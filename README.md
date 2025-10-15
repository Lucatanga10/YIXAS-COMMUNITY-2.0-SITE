YIXAS COMMUNITY 2.0 - Demo site

Contents:
- index.html
- css/styles.css
- js/script.js
- assets/yixas.jpg  (place your supplied image here)

Quick start:
1. Put the provided image into `assets/yixas.jpg` (create the `assets` folder if missing).
2. Edit `js/config.js` and set `window.PAYPAL_ME_USERNAME` to your PayPal.me username (e.g. 'mario' for https://www.paypal.me/mario).
3. Open `index.html` in a browser. You can also run a simple static server to avoid local file restrictions.

Changes in this cleanup pass:
- Improved HTML semantics and accessibility (skip link, ARIA roles, modal keyboard support).
- Removed inline styles on `cart.html` and centralized styles in `css/styles.css`.
- Added safer JS guards for missing elements and PayPal username handling.
- Minor visual polish: included Inter font, typographic variables, and improved layout spacing.

Testing locally:
- Open `index.html` in your browser.
- To test cart flow: add products on the home page, click "Cart" and then "Checkout with PayPal" (this redirects to PayPal.me).
- For a small local server (recommended on Windows PowerShell):

```powershell
# from the project folder
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Technical notes:
- The cart is client-side and uses `localStorage`.
- Checkout redirects to PayPal.me with the total amount. PayPal handles the payment. Make sure you have an active PayPal account and a configured PayPal.me link.
- To receive exactly €5 for testing, add an item priced at €5 and complete checkout. For production-grade payment handling (IPN/webhooks, server verification), use a secure backend.

Limitations & Security:
- Do not use this demo as-is for production payments.
- For verifiable automated payments, integrate PayPal Webhooks on a secure server backend.
