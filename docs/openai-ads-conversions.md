# OpenAI Ads conversion measurement (website)

The public site is static HTML hosted at `haidian.open-city.ai`. Its proposal submission workflow happens on GitHub; a visitor copying an Agent instruction or following an outbound submission link is **not** a confirmed proposal submission.

## Implemented events

- `page_viewed` (standard): sent once when consent is granted on a page, including its path.
- `agent_instruction_copied` (custom): sent **only after** the home-page clipboard operation succeeds.
- `github_submission_link_clicked` (custom): sent when the gallery's GitHub submission CTA is clicked.

These custom events measure participation *intent*, not `registration_completed`, `lead_created`, or a confirmed GitHub pull request. A confirmed-submission event requires a trusted GitHub webhook or other server-side verification, which is not present in this repository.

## Activate safely

1. In OpenAI Ads Manager, create or retrieve a website data source and copy its **public Pixel ID**. Do not put Advertiser API keys or Conversions API keys in this repository.
2. Before `openai-ads.js` in `index.html` and `submissions.html`, set the same public Pixel ID with `window.openCityAdsConfig = { pixelId: "YOUR_PIXEL_ID" };`. Leaving the Pixel ID unset keeps tracking disabled.
3. Connect the site's consent UI/consent management platform to call `window.openCityAds.setConsent(true)` **only after explicit measurement consent**. On denial or withdrawal, call `window.openCityAds.setConsent(false)`. The script does not store consent and does not load the Pixel or send events before that call. Restore a persisted grant only through the site's consent manager, after validating it.
4. In Ads Manager, create conversion event settings for desired `custom` event names attached to the same data source, and associate settings with campaigns. Do not treat page views as confirmed submissions. The account owner should decide whether intent events belong in campaign optimization.

The Pixel's own consent control is set to `false` before `init`, then set to `true` only upon grant. The Pixel ID is a public identifier; API keys are secrets and must remain server-side. If introducing a site-wide CSP, allow `https://bzrcdn.openai.com` for scripts and configuration, and `https://bzr.openai.com` for network/image events.

## Verify

1. With `pixelId` unset, or without a consent grant, inspect the Network tab: no requests to `bzrcdn.openai.com` or `bzr.openai.com` should occur from this integration.
2. Set a real Pixel ID and grant consent using the site's approved consent UI. The SDK should load; the page should send `page_viewed`.
3. On `index.html`, click a copy-instruction button. Only a successful clipboard copy should send `agent_instruction_copied`.
4. On `submissions.html`, click the explicit GitHub submission CTA. It should send `github_submission_link_clicked`; clicking other GitHub references must not.
5. Check recent events under Ads Manager or `GET /v1/conversions/events?pid=PIXEL_ID` using a **server-held Advertiser API key**. Recent-event inspection is time-limited; it does not establish attributed conversions.
6. Revoke consent and repeat actions; no further events should be sent.

Official references:
- https://developers.openai.com/ads/measurement-pixel
- https://developers.openai.com/ads/conversion-tracking
- https://developers.openai.com/ads/supported-events
