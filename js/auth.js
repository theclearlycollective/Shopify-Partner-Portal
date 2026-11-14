// Shopify customer sign-in using the Customer Account API (public client + PKCE).
// Shopify hosts the sign-in page and emails the buyer a one-time code.
(function () {
  const C = window.PORTAL_CONFIG;
  const KEY = 'tcc-portal-auth';
  const PENDING = 'tcc-portal-pending';

  function redirectUri() {
    return C.customerAccount.redirectUri || (location.origin + location.pathname);
  }

  function b64url(bytes) {
    let s = '';
    bytes.forEach(b => { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function randomString(n) {
    const a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a);
  }
  async function challengeFor(verifier) {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return b64url(new Uint8Array(d));
  }

  // Shopify publishes its sign-in and API addresses at these discovery URLs.
  // If the browser cannot read them, fall back to addresses built from shopId.
  let cache = null;
  async function endpoints() {
    if (cache) return cache;
    const base = 'https://' + C.shop.storefrontDomain;
    const id = C.customerAccount.shopId;
    const fallback = {
      authorize: 'https://shopify.com/authentication/' + id + '/oauth/authorize',
      token: 'https://shopify.com/authentication/' + id + '/oauth/token',
      logout: 'https://shopify.com/authentication/' + id + '/logout',
      graphql: 'https://shopify.com/' + id + '/account/customer/api/' + C.shop.apiVersion + '/graphql'
    };
    try {
      const [oid, api] = await Promise.all([
        fetch(base + '/.well-known/openid-configuration').then(r => r.json()),
        fetch(base + '/.well-known/customer-account-api').then(r => r.json())
      ]);
      cache = {
        authorize: oid.authorization_endpoint || fallback.authorize,
        token: oid.token_endpoint || fallback.token,
        logout: oid.end_session_endpoint || fallback.logout,
        graphql: api.graphql_api || fallback.graphql
      };
    } catch (e) {
      if (!id) throw new Error('Could not reach Shopify sign-in. Add your shopId in js/config.js.');
      cache = fallback;
    }
    return cache;
  }

  function save(t) {
    const now = Date.now();
    const s = {
      access: t.access_token,
      refresh: t.refresh_token || (load() || {}).refresh || null,
      idToken: t.id_token || (load() || {}).idToken || null,
      expires: now + ((t.expires_in || 3600) - 60) * 1000
    };
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function clear() { localStorage.removeItem(KEY); }

  async function signIn() {
    const ep = await endpoints();
    const verifier = randomString(32);
    const state = randomString(16);
    const nonce = randomString(16);
    sessionStorage.setItem(PENDING, JSON.stringify({ verifier, state, nonce, back: location.hash || '#/home' }));
    const u = new URL(ep.authorize);
    u.searchParams.set('scope', 'openid email customer-account-api:full');
    u.searchParams.set('client_id', C.customerAccount.clientId);
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('redirect_uri', redirectUri());
    u.searchParams.set('state', state);
    u.searchParams.set('nonce', nonce);
    u.searchParams.set('code_challenge', await challengeFor(verifier));
    u.searchParams.set('code_challenge_method', 'S256');
    location.href = u.toString();
  }

  // Runs when Shopify sends the buyer back with ?code=...&state=...
  async function handleCallback() {
    const q = new URLSearchParams(location.search);
    if (!q.get('code')) return null;
    const pending = JSON.parse(sessionStorage.getItem(PENDING) || 'null');
    sessionStorage.removeItem(PENDING);
    history.replaceState(null, '', location.pathname + ((pending && pending.back) || '#/home'));
    if (!pending || pending.state !== q.get('state')) throw new Error('Sign-in expired. Please try again.');
    const ep = await endpoints();
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: C.customerAccount.clientId,
      redirect_uri: redirectUri(),
      code: q.get('code'),
      code_verifier: pending.verifier
    });
    const r = await fetch(ep.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!r.ok) throw new Error('Sign-in failed (' + r.status + '). Check the Customer Account API settings in README.');
    return save(await r.json());
  }

  async function refresh(s) {
    if (!s || !s.refresh) return null;
    const ep = await endpoints();
    const body = new URLSearchParams({ grant_type: 'refresh_token', client_id: C.customerAccount.clientId, refresh_token: s.refresh });
    const r = await fetch(ep.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!r.ok) { clear(); return null; }
    return save(await r.json());
  }

  async function token() {
    let s = load();
    if (!s) return null;
    if (Date.now() > s.expires) s = await refresh(s);
    return s ? s.access : null;
  }

  async function signOut() {
    const s = load();
    clear();
    try {
      const ep = await endpoints();
      if (s && s.idToken) {
        const u = new URL(ep.logout);
        u.searchParams.set('id_token_hint', s.idToken);
        u.searchParams.set('post_logout_redirect_uri', redirectUri());
        location.href = u.toString();
        return;
      }
    } catch (e) { /* fall through */ }
    location.hash = '#/';
    location.reload();
  }

  window.PortalAuth = { signIn, handleCallback, token, signOut, endpoints, isSignedIn: () => !!load() };
})();
