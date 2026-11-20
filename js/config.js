// ============================================================================
// TCC Wholesale Portal — settings
// This is the only file the team needs to edit. Everything here is safe to be
// public on GitHub: none of these values are passwords or admin keys.
// NEVER put a Shopify Admin API token or a Klaviyo private key in this file.
// ============================================================================
window.PORTAL_CONFIG = {
  // STEP 3: change to false to switch on real Shopify sign-in.
  // While true, the portal shows sample orders.
  demoMode: true,

  shop: {
    name: 'The Clearly Collective',
    // Your live website. Used for product, collection and cart links.
    siteUrl: 'https://www.theclearlycollective.com',
    // Domain for the Storefront API. If requests fail, use your
    // xxxx.myshopify.com domain instead (Settings > Domains in Shopify admin).
    storefrontDomain: 'the-clearly-collective.myshopify.com',
    // STEP 1: paste the Public access token from Headless > Storefront API.
    storefrontToken: '',
    apiVersion: '2026-10',
    contactEmail: 'wholesale@theclearlycollective.com'
  },

  // Shopify customer sign-in (Customer Account API, public client).
  // Headless sales channel > Customer Account API settings.
  customerAccount: {
    // STEP 2: paste the Client ID from Headless > Customer Account API.
    clientId: '',
    // Numeric shop ID shown in the Customer Account API settings.
    // Only used if automatic endpoint discovery fails.
    shopId: '66696282394',
    // Must exactly match the Callback URI registered in Shopify.
    // Leave blank to use this page's own address.
    redirectUri: 'https://theclearlycollective.github.io/Shopify-Partner-Portal/'
  },

  // Who may use the portal. 'none' lets any signed-in customer in.
  // 'metafield' only lets in customers whose metafield below is "true".
  // See README > Approval before switching this on.
  approval: { mode: 'none', namespace: 'portal', key: 'approved' },

  // "What's new in the studio". Each entry is a Shopify collection handle,
  // so photos and pieces update automatically from your catalog.
  drops: [
    { handle: 'the-dallas-collection', label: 'Dropping this week', date: '' },
    { handle: 'the-chicago-collection', label: 'Coming soon', date: '' }
  ],

  // Partnership application (from the Retail Partnerships page on your site).
  applyUrl: 'https://znsutebz.formester.com/f/PLzHHpKLf',

  // Existing wholesale order form.
  orderFormUrl: 'https://theclearlycollective.github.io/TCC-Wholesale/',

  // Optional Shopify discount code applied when a buyer reorders, so the cart
  // shows wholesale pricing. Leave blank if you price wholesale another way.
  wholesaleDiscountCode: '',

  // Orders shipped within this many days still show under "In progress".
  inProgressDaysAfterShipping: 10,

  semiCustom: {
    title: 'Make it yours',
    // Wording from the Semi-Custom page on your website.
    text: 'One of our existing designs, personalized with your logo, names, a date or your colors. From 10 pieces, 6–8 weeks.',
    buttonLabel: 'Start your order',
    url: 'https://www.theclearlycollective.com/pages/semi-custom-catalog#order'
  },

  // Collector status tiers (PROPOSAL: confirm names, thresholds and benefits).
  // A partner's tier is worked out from shipped orders in the last 12 months:
  // they reach Atelier with atelierMinOrders orders OR atelierMinSpend dollars.
  // Keystone is by invitation: set it per partner with the customer metafield
  // below (value "keystone"). Leave a threshold as null to ignore it.
  collector: {
    atelierMinOrders: 3,
    atelierMinSpend: null,   // TO CONFIRM, e.g. 10000
    keystoneSpendHint: null, // TO CONFIRM, shown as a guide only, e.g. 25000
    tierMetafield: { namespace: 'portal', key: 'tier' },
    tiers: [
      { id: 'studio', name: 'Studio Partner',
        requirement: 'Approved, with a first order placed',
        benefits: ['Order window opens 7 days before public launch', 'Standard allocation on limited runs',
          'Semi-custom on standard terms (10-piece minimum, 6–8 weeks)', 'Listed on our Store Locator'] },
      { id: 'atelier', name: 'Atelier Partner',
        requirement: '3+ orders in the last 12 months',
        benefits: ['Order window opens 2–3 weeks before launch', 'Priority allocation on limited runs',
          'Reorder from the Archive of retired prints', 'Reduced semi-custom minimum',
          'Lower free-freight threshold', 'Seasonal feature on our social channels', 'Input on our next destination design'] },
      { id: 'keystone', name: 'Keystone Partner',
        requirement: 'By invitation from our team',
        benefits: ['Line sheet preview before production, with reserved allocation',
          'First look at prints before they retire to the Archive',
          'An exclusive design or colorway for your store or city', 'An in-store event or trunk show with Olivia',
          'Payment terms and a dedicated contact', 'Named founding stockist of new city designs'] }
    ]
  },

  newsletter: {
    // Klaviyo > Settings > API keys > Public API key (site ID). Public by design.
    klaviyoPublicKey: '',
    // ID of the Klaviyo list the signup adds people to.
    klaviyoListId: '',
    topics: ['New drops', 'Offers', 'Semi-custom', 'Your city']
  },

  // Offers. Photos are live images from your Shopify store.
  offers: [
    { eyebrow: 'Early access', title: 'The Dallas Collection',
      text: 'Silk scarves, ribbons and wraps celebrating Dallas, open to retail partners first.',
      note: '',
      image: 'https://cdn.shopify.com/s/files/1/0666/9628/2394/collections/TCC_-_Dallas_Silk_Studio.jpg?v=1790801213',
      link: 'https://www.theclearlycollective.com/collections/the-dallas-collection', featured: false },
    { eyebrow: 'Holiday', title: 'Free freight through Nov 15',
      text: 'On orders over $1,500. A thank you for starting your holiday season with us.',
      note: 'Applied when your order is approved.',
      image: 'https://cdn.shopify.com/s/files/1/0666/9628/2394/files/DSCF0927_1.jpg?v=1787939998',
      link: '', featured: true },
    { eyebrow: 'Gifting', title: '5% off gift boxing',
      text: 'On gift-boxed pieces in orders placed by Nov 1.',
      note: 'Applied when your order is approved.',
      image: 'https://cdn.shopify.com/s/files/1/0666/9628/2394/collections/Chapel_Hill_Twilly_Packaging_Product.png?v=1790706863',
      link: '', featured: false }
  ],

  faq: [
    ['Signing in', 'How do I sign in?', 'Enter your email on the sign-in page and we email you a one-time code. There is no password to remember.'],
    ['Signing in', 'Can a colleague use our account?', 'Yes. Ask us to add them as a contact. Each person signs in with their own email.'],
    ['Orders', 'Where can I see where my order is?', 'Open Orders, then In progress, and select an order to see the carrier and tracking number.'],
    ['Orders', 'How do I reorder a past order?', 'Open Orders, then Past orders, and choose Add entire order to cart. You can change quantities in the cart.'],
    ['Orders', 'What if something arrives damaged?', 'Email us with the order number and a photo within 7 days of delivery. We will replace or credit the item.']
  ]
};
