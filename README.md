# TCC Wholesale Portal

A sign-in portal for The Clearly Collective's retail partners. Buyers sign in with Shopify (email plus one-time code), see their real orders and tracking, reorder a whole past order into the store cart, see the latest drops pulled live from your Shopify collections, and sign up for the partner newsletter in Klaviyo.

It is a plain website (HTML, CSS and JavaScript). No server, no build step, no monthly hosting cost. It runs on GitHub Pages.

**Everything you edit lives in `js/config.js`.** Nothing in this repository is a secret. Never put a Shopify Admin API token or a Klaviyo private key anywhere in it.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `css/portal.css` | The look |
| `js/config.js` | All settings, text and offers. The only file the team edits |
| `js/auth.js` | Shopify sign-in |
| `js/data.js` | Orders, drops, reorder links and newsletter signup |
| `js/app.js` | The pages and navigation |
| `js/demo.js` | Sample orders shown while `demoMode` is on |

## Updating files

After uploading changed files, open `index.html` on GitHub and change every `?v=4` to the next number (`?v=5`, and so on). This makes browsers load the new files instead of saved copies.

## 1. Put it on GitHub

1. Create a new repository, for example `TCC-Wholesale-Portal`.
2. Upload every file and folder here, keeping the folder structure, including the empty `.nojekyll` file.
3. In the repository go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the portal is live at `https://<your-github-name>.github.io/TCC-Wholesale-Portal/`. It opens in demo mode with sample orders.

## 2. Connect Shopify

You need the **Headless** sales channel (free from the Shopify App Store). Check that it is available on your plan before you start.

1. In Shopify admin, install **Headless** and create a storefront.
2. **Storefront API:** copy the *public access token* into `shop.storefrontToken`. This makes the drops section live.
3. **Customer Account API** settings in the same storefront:
   - Client type: **Public**
   - Callback URI: your exact portal address, for example `https://<your-github-name>.github.io/TCC-Wholesale-Portal/`
   - JavaScript origin: `https://<your-github-name>.github.io`
   - Logout URI: the same portal address
   - Copy the **Client ID** into `customerAccount.clientId` and the **Shop ID** into `customerAccount.shopId`.
4. Under **Settings → Customer accounts**, make sure the store uses the newer customer accounts (sign-in with a one-time code).
5. Set `demoMode: false` in `js/config.js` and commit.

## 3. Connect Klaviyo

1. Klaviyo → **Settings → API keys**: copy the **Public API key / site ID** into `newsletter.klaviyoPublicKey`.
2. Choose the list for partner signups and copy its **list ID** into `newsletter.klaviyoListId`.
3. Each signup also saves the topics the buyer ticked on their profile as `portal_interests`, which you can use to segment.

## 4. Link it from your website

In Shopify admin → **Online Store → Navigation**, add a "Retail partners" link to your footer or main menu pointing to the portal address.

Optional: to use `portal.theclearlycollective.com`, add a `CNAME` file containing that address, set it under **Settings → Pages → Custom domain**, add the CNAME record at your domain provider, and update the Callback URI, JavaScript origin and Logout URI in Shopify to match.

## 5. Approval (who can get in)

`approval.mode: 'none'` lets any signed-in customer in. They only ever see their own orders, but they also see the offers page.

To limit the portal to approved partners:

1. Shopify admin → **Settings → Custom data → Customers**: add a True/false metafield with namespace `portal` and key `approved`. Turn on access for customer accounts.
2. Set it to true for approved buyers, by hand or with a Shopify Flow automation (for example: when an order tagged `wholesale` is fulfilled, set this metafield on the customer).
3. Set `approval.mode: 'metafield'` in `js/config.js`.

## 6. Still to fill in (in `js/config.js`)

- `drops[].date`: the Dallas and Chicago dates. The photos and pieces come from Shopify automatically.
- `collector`: the three collector tiers (Studio, Atelier, Keystone) are a proposal. Confirm the names, the Atelier threshold (`atelierMinOrders` and/or `atelierMinSpend`) and the benefits. To make a partner Keystone, add a customer metafield `portal.tier` (single-line text) in Shopify with the value `keystone`, with customer account access turned on.
- `semiCustom`: uses the wording, minimum and timeline from your website's Semi-Custom page. Change it if wholesale partners get different terms.
- `offers`: wording, dates and photos.
- `wholesaleDiscountCode`: see the pricing note below.

## Things to test before launch

These depend on Shopify settings that could not be tested from outside your store:

- **Wholesale pricing in the cart.** "Add entire order to cart" adds the pieces to your normal store cart, which shows retail prices. Shopify's built-in wholesale price lists need the Shopify Plus plan. Options: a wholesale discount code in `wholesaleDiscountCode`, a wholesale pricing app, or keep ordering on the order form.
- **Reorder link.** It uses a Shopify cart link. If a product from an old order has been archived or is out of stock, Shopify may reject the link.
- **Orders need to be in Shopify.** Buyers only see orders that exist in Shopify under their email. Orders placed only through the order form's Google Sheet will not appear.
- **Company name.** The welcome line uses the Company field on the buyer's default address in Shopify, then their name.
- **"In progress".** An order counts as in progress until it has shipped plus `inProgressDaysAfterShipping` days.
