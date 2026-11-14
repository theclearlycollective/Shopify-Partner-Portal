// Sample data shown only while demoMode is true in config.js.
// Products, photos and variant IDs are real items from the store, so the
// reorder button works in demo mode. Orders, buyer and totals are made up.
(function () {
  const CDN = 'https://cdn.shopify.com/s/files/1/0666/9628/2394/files/';
  const P = {
    dalScarf: { title: 'The Dallas Scarf', variantId: 'gid://shopify/ProductVariant/52576540098842', image: CDN + 'Gemini_Generated_Image_pquxfopquxfopqux.jpg?v=1787624706' },
    dalRibbon: { title: 'The Dallas Silk Ribbon', variantId: 'gid://shopify/ProductVariant/52708428710170', image: CDN + 'ChatGPT_Image_Sep_20_2026_06_51_14_PM.png?v=1789944682' },
    dalWrap: { title: 'The Dallas Silk Cashmere Wrap', variantId: 'gid://shopify/ProductVariant/52719816966426', image: CDN + 'Gemini_Generated_Image_s4binqs4binqs4bi.jpg?v=1793154906' },
    chs: { title: 'The Charleston Scarf', variantId: 'gid://shopify/ProductVariant/49853517627674', image: CDN + 'TCC_-_Charleston_Studio.jpg?v=1787283616' }
  };
  const usd = a => ({ amount: String(a), currencyCode: 'USD' });
  const line = (p, qty, each) => ({ title: p.title, variant: '', qty, variantId: p.variantId, image: p.image, total: usd(qty * each) });
  const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString();
  function order(name, d, items, status, tracking) {
    const total = items.reduce((s, i) => s + Number(i.total.amount), 0);
    return { id: 'demo-' + name.slice(1), name, date: daysAgo(d), total: usd(total), items,
      pieces: items.reduce((n, i) => n + i.qty, 0), status, inProgress: status !== 'Fulfilled', tracking: tracking || [] };
  }
  window.PORTAL_DEMO = {
    buyer: () => ({
      approved: true, company: 'Sample Boutique', place: 'Charleston, SC', email: 'buyer@example.com',
      orders: [
        order('#1042', 3, [line(P.dalScarf, 12, 92.5), line(P.dalRibbon, 12, 32.5)], 'Processing'),
        order('#1037', 6, [line(P.chs, 12, 77.5), line(P.dalWrap, 4, 162.5)], 'Shipped',
          [{ company: 'UPS', number: '1Z0000417000', url: '' }]),
        order('#1021', 40, [line(P.chs, 24, 77.5)], 'Fulfilled'),
        order('#0988', 84, [line(P.chs, 12, 77.5), line(P.dalRibbon, 6, 32.5)], 'Fulfilled')
      ]
    }),
    drops: () => ([
      { label: 'Dropping this week', date: '', title: 'The Dallas Collection', handle: 'the-dallas-collection',
        image: 'https://cdn.shopify.com/s/files/1/0666/9628/2394/collections/TCC_-_Dallas_Silk_Studio.jpg?v=1790801213',
        pieces: ['The Dallas Scarf', 'The Dallas Silk Ribbon', 'The Dallas Silk Cashmere Wrap'] },
      { label: 'Coming soon', date: '', title: 'The Chicago Collection', handle: 'the-chicago-collection',
        image: CDN + 'Screenshot2026-07-23at12.29.23PM.png?v=1784824175',
        pieces: ['The Chicago Scarf', 'The Chicago Cashmere Wrap', 'The Chicago Acrylic Tray', 'The Chicago Acrylic Valet Tray'] }
    ])
  };
})();
