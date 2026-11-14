// ============================================================================
// TCC Wholesale Portal — settings
// This is the only file the team needs to edit. Everything here is safe to be
// public on GitHub: none of these values are passwords or admin keys.
// NEVER put a Shopify Admin API token or a Klaviyo private key in this file.
// ============================================================================
window.PORTAL_CONFIG = {
  // While true, the portal shows sample orders so you can preview it before
  // Shopify sign-in is set up. Set to false once the steps in README.md are done.
  demoMode: true,

  shop: {
    name: 'The Clearly Collective',
    // Your live website. Used for product, collection and cart links.
    siteUrl: 'https://www.theclearlycollective.com',
    // Domain for the Storefront API. If requests fail, use your
    // xxxx.myshopify.com domain instead (Settings > Domains in Shopify admin).
    storefrontDomain: 'www.theclearlycollective.com',
    // Headless sales channel > Storefront API > Public access token.
    storefrontToken: '',
    apiVersion: '2026-10',
    contactEmail: 'wholesale@theclearlycollective.com'
  },

  // Shopify customer sign-in (Customer Account API, public client).
  // Headless sales channel > Customer Account API settings.
  customerAccount: {
    clientId: '',
    // Numeric shop ID shown in the Customer Account API settings.
    // Only used if automatic endpoint discovery fails.
    shopId: '',
    // Must exactly match the Callback URI registered in Shopify.
    // Leave blank to use this page's own address.
    redirectUri: ''
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

  // Collector status. Hidden for real buyers until howToEarn and benefits are
  // filled in. ordersNeeded drives the progress line.
  collector: {
    ordersNeeded: null, // TO CONFIRM, e.g. 3
    howToEarn: '',      // TO CONFIRM: not stated anywhere on the website
    // From the Collectors' Circle page on your website.
    benefits: 'Early releases, archive exclusives and concierge perks.'
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
      image: 'https://cdn.shopify.com/s/files/1/0666/9628/2394/collections/IMG_5074.jpg?v=1744288856',
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
