// Live data: the buyer's orders (Customer Account API), drops (Storefront API),
// newsletter signup (Klaviyo) and reorder links (Shopify cart permalinks).
(function () {
  const C = window.PORTAL_CONFIG;

  // ---------- Buyer and orders (Customer Account API) ----------
  const CUSTOMER_QUERY = `
    query Portal {
      customer {
        firstName
        lastName
        emailAddress { emailAddress }
        defaultAddress { company city zoneCode }
        orders(first: 50) {
          nodes {
            id
            name
            processedAt
            totalPrice { amount currencyCode }
            fulfillments(first: 5) {
              nodes { createdAt trackingInformation { company number url } }
            }
            lineItems(first: 100) {
              nodes { title variantTitle quantity variantId image { url } totalPrice { amount currencyCode } }
            }
          }
        }
      }
    }`;

  const TIER_QUERY = `
    query Tier($ns: String!, $key: String!) {
      customer { metafield(namespace: $ns, key: $key) { value } }
    }`;

  const APPROVAL_QUERY = `
    query Approval($ns: String!, $key: String!) {
      customer { metafield(namespace: $ns, key: $key) { value } }
    }`;

  async function customerApi(query, variables) {
    const token = await window.PortalAuth.token();
    if (!token) throw Object.assign(new Error('Not signed in'), { signedOut: true });
    const ep = await window.PortalAuth.endpoints();
    const r = await fetch(ep.graphql, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ query, variables: variables || {} })
    });
    if (r.status === 401) throw Object.assign(new Error('Session ended'), { signedOut: true });
    const j = await r.json();
    if (j.errors) throw new Error(j.errors.map(e => e.message).join('; '));
    return j.data;
  }

  function shapeOrder(o) {
    const fulfillments = (o.fulfillments && o.fulfillments.nodes) || [];
    const tracking = [];
    fulfillments.forEach(f => (f.trackingInformation || []).forEach(t => tracking.push(t)));
    const shippedAt = fulfillments.length ? fulfillments[fulfillments.length - 1].createdAt : null;
    const items = (o.lineItems.nodes || []).map(i => ({
      title: i.title, variant: i.variantTitle, qty: i.quantity, variantId: i.variantId,
      image: i.image && i.image.url, total: i.totalPrice
    }));
    const days = shippedAt ? (Date.now() - new Date(shippedAt)) / 864e5 : 0;
    let status = 'Processing';
    if (shippedAt) status = days <= C.inProgressDaysAfterShipping ? 'Shipped' : 'Fulfilled';
    return {
      id: o.id, name: o.name, date: o.processedAt, total: o.totalPrice,
      pieces: items.reduce((n, i) => n + i.qty, 0), items, tracking, status,
      inProgress: status !== 'Fulfilled'
    };
  }

  async function loadBuyer() {
    if (C.demoMode) return window.PORTAL_DEMO.buyer();
    const d = await customerApi(CUSTOMER_QUERY);
    const c = d.customer;
    let approved = true;
    if (C.approval.mode === 'metafield') {
      const a = await customerApi(APPROVAL_QUERY, { ns: C.approval.namespace, key: C.approval.key });
      approved = !!(a.customer.metafield && String(a.customer.metafield.value).toLowerCase() === 'true');
    }
    let tierOverride = null;
    try {
      const m = C.collector.tierMetafield;
      const t = await customerApi(TIER_QUERY, { ns: m.namespace, key: m.key });
      tierOverride = t.customer.metafield ? String(t.customer.metafield.value).toLowerCase() : null;
    } catch (e) { console.warn('Tier metafield not readable', e); }
    const addr = c.defaultAddress || {};
    const orders = c.orders.nodes.map(shapeOrder).sort((a, b) => new Date(b.date) - new Date(a.date));
    return {
      approved,
      company: addr.company || [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Your shop',
      place: [addr.city, addr.zoneCode].filter(Boolean).join(', '),
      email: c.emailAddress ? c.emailAddress.emailAddress : '',
      orders, tierOverride
    };
  }

  // ---------- Drops (Storefront API) ----------
  const DROP_QUERY = `
    query Drop($handle: String!) {
      collection(handle: $handle) {
        title
        handle
        image { url altText }
        products(first: 8) { nodes { title handle featuredImage { url altText } } }
      }
    }`;

  async function storefront(query, variables) {
    const s = C.shop;
    const r = await fetch('https://' + s.storefrontDomain + '/api/' + s.apiVersion + '/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': s.storefrontToken },
      body: JSON.stringify({ query, variables })
    });
    const j = await r.json();
    if (j.errors) throw new Error(j.errors.map(e => e.message).join('; '));
    return j.data;
  }

  async function loadDrops() {
    if (!C.shop.storefrontToken) return window.PORTAL_DEMO.drops();
    const out = [];
    for (const d of C.drops) {
      try {
        const res = await storefront(DROP_QUERY, { handle: d.handle });
        const col = res.collection;
        if (!col) continue;
        const first = col.products.nodes.find(p => p.featuredImage);
        out.push({
          label: d.label, date: d.date, title: col.title, handle: col.handle,
          image: (col.image && col.image.url) || (first && first.featuredImage.url) || '',
          pieces: col.products.nodes.map(p => p.title)
        });
      } catch (e) { console.warn('Drop failed to load', d.handle, e); }
    }
    return out;
  }

  // ---------- Reorder: add every piece of an order to the store cart ----------
  // Uses a Shopify cart permalink. storefront=true opens the cart page
  // rather than going straight to checkout.
  function reorderUrl(order) {
    const parts = order.items
      .filter(i => i.variantId)
      .map(i => i.variantId.split('/').pop() + ':' + i.qty);
    if (!parts.length) return null;
    const u = new URL(C.shop.siteUrl + '/cart/' + parts.join(','));
    u.searchParams.set('storefront', 'true');
    if (C.wholesaleDiscountCode) u.searchParams.set('discount', C.wholesaleDiscountCode);
    return u.toString();
  }

  // ---------- Newsletter (Klaviyo client API, public key only) ----------
  async function subscribe(email, topics) {
    const n = C.newsletter;
    if (!n.klaviyoPublicKey || !n.klaviyoListId) throw new Error('Newsletter is not set up yet.');
    const r = await fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + encodeURIComponent(n.klaviyoPublicKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.api+json', revision: '2024-10-15' },
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'Wholesale portal',
            profile: { data: { type: 'profile', attributes: {
              email, properties: { portal_interests: topics, portal_partner: true }
            } } }
          },
          relationships: { list: { data: { type: 'list', id: n.klaviyoListId } } }
        }
      })
    });
    if (!r.ok) throw new Error('Signup failed (' + r.status + ').');
  }

  window.PortalData = { loadBuyer, loadDrops, reorderUrl, subscribe };
})();
