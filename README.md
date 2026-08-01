# Wolfpack Labs Website

Static marketing, product, legal, support, and customer-action website for **Wolfpack Labs LLC** and **WP Labs: Invoice**.

The site is designed for deployment through GitHub Pages with the custom domain `wolfpack-labs.com`. It uses plain HTML, CSS, and JavaScript, with Supabase endpoints for subscriptions, support requests, estimate responses, and payment-link lookup.

## Current product status

WP Labs: Invoice is presented as an upcoming iOS invoicing application for contractors, freelancers, consultants, self-employed professionals, and small service businesses. The current website copy states a planned public release in **Fall 2026**.

Core product messaging includes:

- Estimates and invoices
- Customer and job organization
- Payment tracking
- Job-photo attachments
- Saved items and templates
- Document customization
- Customer estimate acceptance or decline
- Stripe-hosted payment checkout links

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages-compatible static hosting
- Supabase Edge Functions and PostgreSQL RPC
- Stripe-hosted checkout links
- JSON-LD structured data
- XML sitemap and `robots.txt`

There is no compilation or build step. The files inside this folder are the deployable website.

## Project structure

```text
Wolfpack Labs/
├── index.html                         # Main landing page
├── wp-labs-invoice.html                 # Main WP Labs: Invoice product page
├── invoice-vs-estimate.html           # Educational SEO guide
├── contact.html                       # Support/contact form
│
├── privacy-policy.html                # Privacy policy
├── terms.html                         # Terms and conditions
├── disclosures.html                   # App disclosures
├── payment-disclosure.html            # Payment-processing disclosure
├── customer-privacy-notice.html       # Invoice-recipient privacy notice
├── data-request-deletion.html         # Privacy and deletion requests
│
├── accept-estimate.html               # Token-based estimate response page
├── pay-invoice.html                   # Payment-link resolver and redirect
├── payment-success.html               # Payment result page
├── payment-cancelled.html             # Cancelled payment page
│
├── invoice-app-for-contractors.html   # Legacy redirect to product page
├── invoice-app-for-freelancers.html   # Legacy redirect to product page
│
├── images/
│   ├── icons/                         # Browser and Apple touch icons
│   ├── screenshots/                   # WP Labs: Invoice product screenshots
│   ├── link-preview.png               # Open Graph/social preview image
│   ├── logo.png                       # Wordmark asset
│   ├── wp-labs-invoice.png                      # WP Labs: Invoice app icon
│   └── wp-labs-invoice-demo.mp4         # Homepage walkthrough video
│
├── styles/
│   ├── shared.css                     # Shared site components
│   ├── mobile-nav.css                 # Responsive accordion navigation
│   └── pages/                         # Page-specific stylesheets
│
├── scripts/
│   └── mobile-nav.js                  # Mobile menu behavior
│
├── CNAME                              # GitHub Pages custom domain
├── robots.txt                         # Search crawler rules
├── sitemap.xml                        # Indexable URL inventory
├── site.webmanifest                   # Web-app metadata
└── README.md
```

## Page indexation

### Public, indexable pages

- `/`
- `/wp-labs-invoice.html`
- `/invoice-vs-estimate.html`
- `/contact.html`
- `/privacy-policy.html`
- `/terms.html`
- `/disclosures.html`
- `/payment-disclosure.html`
- `/customer-privacy-notice.html`
- `/data-request-deletion.html`

These pages are represented in `sitemap.xml` and generally include canonical URLs, descriptions, social metadata, and search-engine directives.

### Utility pages marked `noindex`

- `/accept-estimate.html`
- `/pay-invoice.html`
- `/payment-success.html`
- `/payment-cancelled.html`

These pages perform customer-specific actions and should not appear in normal search results.

### Legacy redirect pages

- `/invoice-app-for-contractors.html` → `/wp-labs-invoice.html#contractors`
- `/invoice-app-for-freelancers.html` → `/wp-labs-invoice.html#freelancers`

The redirects use JavaScript plus a meta refresh because GitHub Pages does not provide per-file server redirect configuration.

## Local development

Run a local static web server from the folder containing `index.html`.

### Python

```bash
cd "Wolfpack Labs"
python -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

### Node.js alternative

```bash
npx serve .
```

Do not test the project by double-clicking HTML files when validating forms, routing, video playback, or browser security behavior. Use a local HTTP server.

## Deployment

The site is structured for GitHub Pages.

1. Upload the **contents** of this folder to the publishing branch or configured Pages folder.
2. Keep `CNAME` in the published root.
3. Confirm the custom domain is set to `wolfpack-labs.com` in the repository’s Pages settings.
4. Confirm HTTPS enforcement is enabled.
5. Verify these files after deployment:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/site.webmanifest`
   - `/images/link-preview.png`
6. Test the mobile menu, forms, estimate response page, and payment redirect.
7. Submit or resubmit the sitemap in Google Search Console and Bing Webmaster Tools after major URL or content changes.

### Cache busting

Shared navigation files currently use query parameters such as:

```html
<link rel="stylesheet" href="styles/mobile-nav.css?v=20260726">
<script defer src="scripts/mobile-nav.js?v=20260726"></script>
```

Increase the version value after changing a cached CSS or JavaScript file.

## Navigation

Desktop navigation is always visible. At widths of **860px or less**, the primary navigation changes to an accordion menu.

Shared navigation assets:

- `styles/mobile-nav.css`
- `scripts/mobile-nav.js`

The primary navigation currently contains:

- Apps
- WP Labs: Invoice
- Legal Docs
- Updates
- Contact

Because the navigation markup is copied into multiple HTML files, any navigation change must be applied consistently to every page. A future template system or static-site generator would reduce duplication and prevent page-to-page drift.

## Supabase and payment integrations

The site references the Supabase project:

```text
https://gwmckwqxnrnzqmhvodgm.supabase.co
```

### Update-list subscription

`index.html` posts JSON to:

```text
/functions/v1/subscribe-email
```

Expected request fields include:

```json
{
  "email": "person@example.com",
  "app": "WP Labs: Invoice",
  "subscribe_company": ""
}
```

`subscribe_company` is a honeypot field and should remain hidden from normal users.

### Contact form

`contact.html` posts to:

```text
/functions/v1/contact-form
```

The Edge Function should perform server-side validation, spam protection, rate limiting, safe email handling, and origin checks.

### Estimate responses

`accept-estimate.html` calls:

```text
/functions/v1/accept-estimate
```

The page reads a response token from its query string and sends one of these actions:

- `details`
- `accept`
- `decline`

The server must validate the token, enforce expiration and one-time response rules where applicable, and avoid returning private estimate data for invalid tokens.

### Invoice payment redirects

`pay-invoice.html` calls the Supabase RPC:

```text
get_invoice_payment_redirect
```

The RPC receives a public payment code and returns a payment URL. The browser only accepts HTTPS URLs hosted at:

- `checkout.stripe.com`
- `buy.stripe.com`

The Supabase publishable/anonymous key in browser code is expected to be public. **Never place a Supabase service-role key in this repository or any client-side file.** Database permissions, Row Level Security, and RPC implementation must provide the actual protection.

## SEO maintenance

When adding or substantially updating a public page:

1. Use one descriptive `<h1>`.
2. Set a unique `<title>` and meta description.
3. Add a self-referencing canonical URL.
4. Add Open Graph and Twitter metadata where appropriate.
5. Add meaningful internal links from related pages.
6. Add the page to `sitemap.xml` only when it should be indexed.
7. Update `<lastmod>` only when the page’s visible content changes meaningfully.
8. Keep customer-specific action pages out of the sitemap and marked `noindex`.
9. Test structured data after changing JSON-LD.
10. Request recrawling after deployment when a major page changes.

## Media guidelines

Product screenshots are currently **1200 × 1500 pixels** and should retain their natural 4:5 aspect ratio.

When adding screenshots:

- Use descriptive filenames and alt text.
- Include explicit `width` and `height` attributes.
- Use `loading="lazy"` below the initial viewport.
- Use `decoding="async"` where appropriate.
- Avoid forcing a phone-like aspect ratio that differs from the source image.
- Compress images before committing them.

The homepage video should be tested on mobile networks and with reduced-motion preferences. Avoid autoplay when it is not necessary, and keep `preload` conservative.

## Accessibility checklist

Before release, verify:

- Keyboard access for the mobile navigation, gallery, lightbox, forms, and action buttons
- Visible focus states
- Appropriate heading order
- Form labels and readable validation messages
- Sufficient color contrast
- Useful image alt text
- Correct dialog focus handling in the screenshot lightbox
- Menu behavior at 860px, immediately below it, and immediately above it
- Layout at 320px, 375px, 390px, 768px, 1024px, and common laptop widths
- Reduced-motion behavior for scrolling, transitions, and video

## Pre-deployment test checklist

### General

- [ ] Every local link opens the expected page or section.
- [ ] Logo and navigation are visible on desktop and laptop screens.
- [ ] Mobile navigation starts collapsed and opens with one tap.
- [ ] Mobile navigation closes after choosing a link.
- [ ] No horizontal page overflow appears.
- [ ] Footer links are consistent across pages.
- [ ] Browser console shows no unexpected errors.

### Homepage

- [ ] Update-list subscription succeeds.
- [ ] Invalid subscription input shows a useful message.
- [ ] Video controls work without blocking page interaction.
- [ ] Screenshot gallery scrolls by touch, mouse, and keyboard.
- [ ] Lightbox opens, closes, and changes images correctly.

### WP Labs: Invoice page

- [ ] All screenshots retain their 4:5 proportions.
- [ ] Screenshot cards are not vertically elongated.
- [ ] Contractor and freelancer anchor links land correctly.
- [ ] Main call-to-action links to the update form.

### Customer actions

- [ ] Valid estimate links load the correct estimate.
- [ ] Invalid and expired estimate tokens fail safely.
- [ ] Accept and decline actions are idempotent.
- [ ] Valid payment codes redirect only to approved Stripe hosts.
- [ ] Invalid payment codes do not expose sensitive debugging details.
- [ ] Payment success and cancellation pages render correctly.

### Search and sharing

- [ ] Canonical URLs use the production domain.
- [ ] `robots.txt` is reachable.
- [ ] `sitemap.xml` is valid and reachable.
- [ ] Social preview image loads at 1200 × 630.
- [ ] Structured data contains no stale release or organization details.

## Website review — July 26, 2026

The uploaded package was statically reviewed for local references, metadata, page structure, navigation consistency, script syntax, sitemap syntax, manifest syntax, media inventory, and integration references.

### Checks that passed

- No missing local page, stylesheet, script, image, video, or anchor references were found.
- All 16 HTML files parsed successfully.
- `scripts/mobile-nav.js` passed JavaScript syntax validation.
- `site.webmanifest` contains valid JSON.
- `sitemap.xml` contains valid XML.
- All meaningful content images include alt text.
- The primary navigation is consistent across the main pages.
- Transaction and customer-action pages are marked `noindex`.
- Indexable content pages have clear titles and primary headings.
- Redirect pages point to the combined WP Labs: Invoice product page.

### Recommended corrections

#### High priority

1. **Deploy the current package.** The publicly retrievable homepage reviewed on July 26, 2026 still showed the older “Legal Documentation Hub” content rather than the newer product-focused homepage in this package. Confirm the correct branch/folder is being published and clear deployment caches.
2. **Remove the unused duplicate video.** `images/wp-labs-invoice-demo2.mp4` is approximately 26 MB and is not referenced by the site. Keeping it increases repository and deployment size without adding functionality.
3. **Remove the remaining footer inconsistency.** `invoice-vs-estimate.html` still contains an `Invoice Guide` footer link, while the other footers do not.
4. **Review homepage autoplay.** The homepage video still includes the `autoplay` attribute. Remove it unless autoplay is a deliberate product decision.
5. **Protect public form endpoints.** Confirm server-side rate limits, bot controls, input validation, logging, and abuse monitoring for subscription, contact, estimate, and payment-related endpoints.

#### Medium priority

1. Add explicit `width`, `height`, `loading`, and `decoding` attributes to homepage gallery images to improve predictable rendering and reduce layout movement.
2. Add a non-JavaScript fallback or direct support contact path for the subscription and contact forms.
3. Avoid returning detailed production debugging information to customers on failed estimate or payment requests.
4. Add a 512 × 512 manifest icon and consider a maskable icon entry.
5. Add an automated link and HTML validation step to the repository workflow.
6. Consider moving repeated navigation and footer markup into templates to prevent future inconsistencies.
7. Review whether all legal pages need to be indexed; some policy pages may provide little search value but should remain easy for users and app-review teams to access.
8. Update sitemap dates when the revised package is actually deployed.

## Suggested future repository automation

A lightweight CI workflow can validate the site on every commit:

- Parse all HTML files
- Verify local links and anchors
- Validate JSON and XML files
- Run JavaScript syntax checks
- Detect unexpectedly large assets
- Confirm navigation and footer link consistency
- Optionally run Lighthouse or another browser-based accessibility/performance audit

## Ownership and support

**Wolfpack Labs LLC**  
Support: `support@wolfpack-labs.com`  
Website: `https://wolfpack-labs.com/`

## License

No open-source license is included in this package. Unless Wolfpack Labs LLC adds a license, the source code, design, written content, product media, and branding should be treated as proprietary and all rights reserved.
