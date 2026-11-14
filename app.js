// Portal pages and navigation.
(function () {
  const C = window.PORTAL_CONFIG;
  const $ = s => document.querySelector(s);
  const root = $('#app');
  const state = { buyer: null, drops: null, ordersTab: 'progress' };

  // ---------- helpers ----------
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = m => m ? Number(m.amount).toLocaleString('en-US', { style: 'currency', currency: m.currencyCode || 'USD' }) : '';
  const date = (d, long) => d ? new Date(d).toLocaleDateString('en-US', long ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' }) : '';
  const img = (url, alt, cls) => url ? '<img class="' + (cls || 'ph') + '" src="' + esc(url) + '" alt="' + esc(alt) + '" loading="lazy">' : '<div class="' + (cls || 'ph') + ' ph-empty"></div>';
  const statusTag = o => '<span class="st st-' + o.status.toLowerCase() + '">' + (o.status === 'Shipped' ? 'In transit' : o.status === 'Fulfilled' ? 'Delivered' : 'Processing') + '</span>';
  const ordersIn = () => state.buyer.orders.filter(o => o.inProgress);
  const ordersPast = () => state.buyer.orders.filter(o => !o.inProgress);

  function brand() {
    return '<div class="c"><div class="logo">' + esc(C.shop.name) + '</div><div class="sub">Retail Partners</div></div>';
  }
  function header(active) {
    const tabs = [['Home', '#/home'], ['Orders', '#/orders'], ['Collector Status', '#/collector'], ['Offers', '#/offers'], ['Questions', '#/faq']];
    return (C.demoMode ? '<div class="demo">Preview with sample orders. Set demoMode to false in js/config.js to go live.</div>' : '') +
      brand() +
      '<div class="topbar"><span>' + esc(state.buyer.email) + '</span><button type="button" class="linkish" data-act="signout">Sign out</button></div>' +
      '<nav class="nav" aria-label="Portal">' + tabs.map(t => '<a href="' + t[1] + '"' + (t[0] === active ? ' aria-current="page"' : '') + '>' + t[0] + '</a>').join('') + '</nav>';
  }
  function orderRow(o) {
    return '<a class="row" href="#/orders/' + encodeURIComponent(o.name.replace('#', '')) + '"><div><div class="id">' + esc(o.name) + '</div><div class="note">Placed ' + date(o.date) + ' · ' + o.pieces + ' pieces</div></div><div>' + statusTag(o) + '</div><div class="tot">' + money(o.total) + '</div></a>';
  }
  function reorderButton(o, cls) {
    const u = window.PortalData.reorderUrl(o);
    return u ? '<a class="btn ' + (cls || 's') + '" href="' + esc(u) + '" target="_blank" rel="noopener">Add entire order to cart</a>' : '';
  }
  function pastRow(o) {
    return '<div class="row past"><div><div class="id">' + esc(o.name) + '</div><div class="note">Placed ' + date(o.date) + ' · ' + o.pieces + ' pieces</div></div><div>' + statusTag(o) + '</div><div class="acts"><div class="tot">' + money(o.total) + '</div>' + reorderButton(o) + '<a class="link" href="#/orders/' + encodeURIComponent(o.name.replace('#', '')) + '">View order</a></div></div>';
  }
  function offerBanner(o) {
    const body = '<div class="c-body"><p class="eye">' + esc(o.eyebrow) + '</p><h2 class="h2">' + esc(o.title) + '</h2><p>' + esc(o.text) + '</p>' + (o.note ? '<p class="note">' + esc(o.note) + '</p>' : '') + (o.link ? '<p><a class="link" href="' + esc(o.link) + '" target="_blank" rel="noopener">Shop now</a></p>' : '') + '</div>';
    return '<div class="ban">' + img(o.image, o.title) + body + '</div>';
  }

  // ---------- sections ----------
  function dropsSection() {
    if (!state.drops) return '<p class="eye c">What’s new in the studio</p><p class="note c">Loading the latest drops…</p>';
    if (!state.drops.length) return '';
    return '<p class="eye c">What’s new in the studio</p><div class="drops">' + state.drops.map((d, i) =>
      '<div class="drop">' + img(d.image, d.title) + '<div class="c-body"><p class="when' + (i === 0 ? ' now' : '') + '">' + esc(d.label) + (d.date ? ' · ' + esc(d.date) : '') + '</p><h2 class="h2">' + esc(d.title) + '</h2><p class="note">' + esc(d.pieces.slice(0, 4).join(', ')) + '</p><a class="link" href="' + esc(C.shop.siteUrl + '/collections/' + d.handle) + '" target="_blank" rel="noopener">' + (i === 0 ? 'Shop the drop' : 'See the collection') + '</a></div></div>'
    ).join('') + '</div>';
  }
  function duo() {
    const s = C.semiCustom;
    return '<div class="duo"><div class="cta"><p class="eye c">Ready for more?</p><h2 class="h2">Place a new order</h2><div><a class="btn" href="' + esc(C.orderFormUrl) + '" target="_blank" rel="noopener">Order on the wholesale form</a></div></div>' +
      '<div class="cta alt"><p class="eye c">Semi-custom</p><h2 class="h2">' + esc(s.title) + '</h2>' + (s.text ? '<p class="note">' + esc(s.text) + '</p>' : (C.demoMode ? '<p class="tbc">Text to confirm in config.js</p>' : '')) + (s.url ? '<div><a class="btn g" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.buttonLabel) + '</a></div>' : '') + '</div></div>';
  }
  // ---------- collector tiers ----------
  function tierInfo() {
    const c = C.collector, b = state.buyer;
    const yearAgo = Date.now() - 365 * 864e5;
    const recent = b.orders.filter(o => new Date(o.date) >= yearAgo && o.status !== 'Processing');
    const count = recent.length;
    const spend = recent.reduce((n, o) => n + Number(o.total ? o.total.amount : 0), 0);
    const byId = id => c.tiers.find(t => t.id === id);
    let id = 'studio';
    if (b.tierOverride && byId(b.tierOverride)) id = b.tierOverride;
    else if ((c.atelierMinOrders && count >= c.atelierMinOrders) || (c.atelierMinSpend && spend >= c.atelierMinSpend)) id = 'atelier';
    const idx = c.tiers.findIndex(t => t.id === id);
    const tier = c.tiers[idx], next = c.tiers[idx + 1] || null;
    let filled = 3, line = 'Our highest tier. Thank you for being a Keystone partner.';
    if (id === 'studio') {
      const need = c.atelierMinOrders || 0;
      filled = need ? Math.min(count, need) : 0;
      const left = need - count;
      const parts = [];
      if (need) parts.push(left + ' more shipped order' + (left === 1 ? '' : 's'));
      if (c.atelierMinSpend) parts.push(money({ amount: Math.max(c.atelierMinSpend - spend, 0), currencyCode: 'USD' }) + ' more in orders');
      line = (parts.length ? parts.join(' or ') : 'A little more') + ' to reach ' + next.name.replace(' Partner', '');
      return { tier, next, count, spend, segments: need || 3, filled, line };
    }
    if (id === 'atelier') line = 'Keystone partners are invited by our team' + (c.keystoneSpendHint ? ', usually after ' + money({ amount: c.keystoneSpendHint, currencyCode: 'USD' }) + ' in a year' : '') + '.';
    return { tier, next, count, spend, segments: 3, filled, line };
  }
  function progressBar(t) {
    let bars = '';
    for (let i = 0; i < t.segments; i++) bars += '<div class="seg' + (i < t.filled ? ' on' : '') + '"></div>';
    return '<div class="bar" role="img" aria-label="' + t.filled + ' of ' + t.segments + ' toward the next tier" style="grid-template-columns:repeat(' + t.segments + ',minmax(0,1fr))">' + bars + '</div>';
  }
  function statusCard() {
    const t = tierInfo();
    return '<div class="status"><p class="eye">Collector status</p><p class="tier">' + esc(t.tier.name) + '</p>' + progressBar(t) +
      '<p class="note">' + esc(t.line) + '</p><div class="links"><a class="link" href="#/collector">Your benefits</a><a class="link" href="#/collector/how">How tiers work</a></div></div>';
  }
  function newsletter() {
    return '<form class="news" id="news"><p class="eye c">Partner newsletter</p><h2 class="h2 c">Hear about what matters to your shop</h2><p class="note">New drops, offers and studio news for our retail partners.</p>' +
      '<div class="frm" style="margin-top:18px"><label class="sr" for="nemail">Email</label><input id="nemail" type="email" required value="' + esc(state.buyer.email) + '"><button class="btn s" type="submit">Sign up</button></div><p class="note" id="newsmsg" role="status"></p></form>';
  }

  // ---------- pages ----------
  const pages = {
    home() {
      const b = state.buyer, open = ordersIn();
      const last = b.orders[0];
      const featured = C.offers.find(o => o.featured);
      return header('Home') + '<div class="hero"><div class="who"><p class="eye">Welcome back</p><h1 class="h1 left">' + esc(b.company) + '</h1><p class="partner left">Exclusive partner of The Clearly Collective</p>' + (b.place ? '<p class="place">' + esc(b.place) + '</p>' : '') + '</div>' + statusCard() + '</div>' +
        '<dl class="facts"><div><dt>Open orders</dt><dd>' + open.length + '</dd></div><div><dt>Last order</dt><dd>' + (last ? date(last.date) : '—') + '</dd></div><div><dt>Orders to date</dt><dd>' + b.orders.length + '</dd></div></dl>' +
        '<div class="gap">' + dropsSection() + '</div>' +
        '<h3 class="h3">In progress</h3>' + (open.length ? open.map(orderRow).join('') : '<p class="note">No open orders right now.</p>') +
        duo() +
        (featured ? '<h3 class="h3">For you</h3>' + offerBanner(featured) : '') + newsletter();
    },
    orders() {
      const tab = state.ordersTab, open = ordersIn(), past = ordersPast();
      return header('Orders') + '<h1 class="h1">Orders</h1><div class="tabs"><button type="button" data-tab="progress" aria-pressed="' + (tab === 'progress') + '">In progress (' + open.length + ')</button><button type="button" data-tab="past" aria-pressed="' + (tab === 'past') + '">Past orders (' + past.length + ')</button></div>' +
        (tab === 'progress' ? (open.length ? open.map(orderRow).join('') : '<p class="note c">No open orders.</p>') : (past.length ? past.map(pastRow).join('') : '<p class="note c">No past orders yet.</p>')) +
        duo();
    },
    collector(ref) {
      const t = tierInfo(), c = C.collector;
      const cards = c.tiers.map(x => {
        const mine = x.id === t.tier.id, isNext = t.next && x.id === t.next.id;
        return '<div class="tcard' + (mine ? ' mine' : '') + '"><p class="when' + (mine ? ' now' : '') + '">' + (mine ? 'Your tier' : isNext ? 'Next tier' : '&nbsp;') + '</p><h2 class="h2">' + esc(x.name) + '</h2><p class="note">' + esc(x.requirement) + '</p><ul>' + x.benefits.map(bn => '<li>' + esc(bn) + '</li>').join('') + '</ul></div>';
      }).join('');
      return header('Collector Status') + '<h1 class="h1">Collector status</h1><p class="lede">Our thanks to the partners who carry our work. The more you stock with us, the earlier you see new designs and the more we do together.</p>' +
        '<div class="status wide"><p class="eye">You are</p><p class="tier">' + esc(t.tier.name) + '</p>' + progressBar(t) + '<p class="note">' + esc(t.line) + '</p><p class="note">' + t.count + ' shipped order' + (t.count === 1 ? '' : 's') + ' in the last 12 months.</p></div>' +
        '<h3 class="h3" id="benefits">Tiers and benefits</h3><div class="tiers">' + cards + '</div>' +
        '<h3 class="h3" id="how">How tiers work</h3><ul class="rules">' + c.rules.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul>' +
        '<p class="note" style="margin-top:20px">Questions about your tier? Write to <a href="mailto:' + esc(C.shop.contactEmail) + '">' + esc(C.shop.contactEmail) + '</a>.</p>';
    },
    order(ref) {
      const o = state.buyer.orders.find(x => x.name.replace('#', '') === ref);
      if (!o) return header('Orders') + '<h1 class="h1">Order not found</h1><p class="c"><a class="link" href="#/orders">Back to orders</a></p>';
      const trk = o.tracking.length ? o.tracking.map(t => '<div class="row"><div class="id">' + esc(t.company || 'Carrier') + '</div><div>' + esc(t.number || '') + '</div><div class="tot">' + (t.url ? '<a class="link" href="' + esc(t.url) + '" target="_blank" rel="noopener">Track package</a>' : '') + '</div></div>').join('') : '<p class="note">Tracking appears here once your order ships.</p>';
      return header('Orders') + '<p class="c"><a class="link" href="#/orders">Back to orders</a></p><h1 class="h1">' + esc(o.name) + '</h1><p class="lede">Placed ' + date(o.date, true) + ' · ' + statusTag(o) + '</p>' +
        '<h3 class="h3">Tracking</h3>' + trk + '<h3 class="h3">Items</h3>' +
        o.items.map(i => '<div class="row"><div><div class="id">' + esc(i.title) + '</div>' + (i.variant && i.variant !== 'Default Title' ? '<div class="note">' + esc(i.variant) + '</div>' : '') + '</div><div>' + i.qty + ' pieces</div><div class="tot">' + money(i.total) + '</div></div>').join('') +
        '<div class="row total"><div class="id">Total</div><div></div><div class="tot">' + money(o.total) + '</div></div>' +
        '<div class="pan"><p class="eye c">Buy again</p><p class="note">Add every piece from this order to your cart. You can change quantities there.</p>' + reorderButton(o, '') + '</div>';
    },
    offers() {
      return header('Offers') + '<h1 class="h1">Early access and offers</h1>' + C.offers.map(offerBanner).join('');
    },
    faq() {
      const groups = [...new Set(C.faq.map(q => q[0]))];
      return header('Questions') + '<h1 class="h1">Common questions</h1>' + groups.map(g => '<h3 class="h3">' + esc(g) + '</h3>' + C.faq.filter(q => q[0] === g).map(q => '<details class="faq"><summary>' + esc(q[1]) + '</summary><p>' + esc(q[2]) + '</p></details>').join('')).join('') +
        '<p class="note c" style="margin-top:34px">Still need help? Write to <a href="mailto:' + esc(C.shop.contactEmail) + '">' + esc(C.shop.contactEmail) + '</a>.</p>';
    }
  };

  function signInPage(msg) {
    return '<div class="narrow c" style="padding-top:72px">' + brand() + '<h1 class="h1" style="margin-top:56px">Wholesale Portal</h1><p class="lede">Track your orders, see past orders, and reorder. Sign in with the email on your wholesale account and we will send you a one-time code.</p><button type="button" class="btn" data-act="signin">Sign in</button>' + (msg ? '<p class="err" role="alert">' + esc(msg) + '</p>' : '') + '<p class="note" style="margin-top:34px">New here? <a href="' + esc(C.applyUrl) + '" target="_blank" rel="noopener">Apply for a retail partnership</a>.</p></div>';
  }
  function notApprovedPage() {
    return '<div class="narrow c" style="padding-top:72px">' + brand() + '<h1 class="h1" style="margin-top:56px">Almost there</h1><p class="lede">Your account is not approved for the partner portal yet. Approval usually follows your first wholesale order. Questions? Write to ' + esc(C.shop.contactEmail) + '.</p><button type="button" class="btn g" data-act="signout">Sign out</button></div>';
  }

  // ---------- routing ----------
  function render() {
    if (!state.buyer) return;
    if (!state.buyer.approved) { root.innerHTML = notApprovedPage(); return; }
    const h = location.hash.replace(/^#\/?/, '');
    const [page, ref] = h.split('/');
    let html;
    if (page === 'orders' && ref) html = pages.order(decodeURIComponent(ref));
    else html = (pages[page] || pages.home)(ref);
    root.innerHTML = '<div class="pg">' + html + '</div>';
    if (page === 'collector' && ref) { const el = document.getElementById(ref); if (el) el.scrollIntoView(); }
    const names = { home: 'Home', orders: 'Orders', collector: 'Collector Status', offers: 'Offers', faq: 'Questions' };
    document.title = (names[page] || 'Home') + ' · ' + C.shop.name + ' Wholesale';
  }

  async function start() {
    root.innerHTML = '<div class="narrow c" style="padding-top:120px">' + brand() + '<p class="note" style="margin-top:40px">Loading…</p></div>';
    try {
      if (!C.demoMode) {
        await window.PortalAuth.handleCallback();
        if (!window.PortalAuth.isSignedIn()) { root.innerHTML = signInPage(); return; }
      }
      state.buyer = await window.PortalData.loadBuyer();
      if (!location.hash || location.hash === '#/') location.hash = '#/home';
      render();
      window.PortalData.loadDrops().then(d => { state.drops = d; render(); }).catch(() => { state.drops = []; render(); });
    } catch (e) {
      console.error(e);
      root.innerHTML = signInPage(e.signedOut ? '' : e.message);
    }
  }

  // ---------- events ----------
  window.addEventListener('hashchange', () => { window.scrollTo(0, 0); render(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (a && a.dataset.act === 'signin') window.PortalAuth.signIn().catch(err => { root.innerHTML = signInPage(err.message); });
    if (a && a.dataset.act === 'signout') { if (C.demoMode) { alert('Sign out is off in demo mode.'); } else window.PortalAuth.signOut(); }
    const t = e.target.closest('[data-tab]');
    if (t) { state.ordersTab = t.dataset.tab; render(); }
  });
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'news') return;
    e.preventDefault();
    const msg = $('#newsmsg');
    const topics = [];
    msg.textContent = 'Signing you up…';
    try { await window.PortalData.subscribe($('#nemail').value, topics); msg.textContent = 'You’re signed up. Thank you.'; }
    catch (err) { msg.textContent = err.message; }
  });

  start();
})();
