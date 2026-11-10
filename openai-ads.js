/* OpenAI Ads Measurement Pixel for the public, static open-call site.
 * Configure the public Pixel ID below. This is NOT an API secret.
 * An explicit affirmative consent signal is required before the SDK loads.
 */
(function (window, document) {
  "use strict";
  var config = window.openCityAdsConfig || {};
  var pixelId = typeof config.pixelId === "string" ? config.pixelId.trim() : "";
  var initialized = false;
  var consent = false;
  var pageViewSent = false;

  function measure(type, data, options) {
    if (!consent || !initialized) return;
    window.oaiq("measure", type, data, options);
  }

  function enable() {
    if (!pixelId || initialized) return;
    initialized = true;
    (function (w, d, s, u) {
      if (w.oaiq) return;
      var q = function () { q.q.push(arguments); };
      q.q = [];
      w.oaiq = q;
      var script = d.createElement(s);
      script.async = true;
      script.src = u;
      var first = d.getElementsByTagName(s)[0];
      first.parentNode.insertBefore(script, first);
    })(window, document, "script", "https://bzrcdn.openai.com/sdk/oaiq.min.js");
    window.oaiq("consent", false);
    window.oaiq("init", { pixelId: pixelId });
  }

  function setConsent(granted) {
    consent = granted === true;
    if (!consent) {
      if (initialized) window.oaiq("consent", false);
      return;
    }
    enable();
    if (!initialized) return;
    window.oaiq("consent", true);
    if (!pageViewSent) {
      pageViewSent = true;
      measure("page_viewed", { type: "contents", contents: [
        { id: window.location.pathname || "/", name: document.title, content_type: "page" }
      ] });
    }
  }

  function participationIntent(action) {
    if (action !== "agent_instruction_copied" && action !== "github_submission_link_clicked") return;
    measure("custom", { type: "custom" }, { custom_event_name: action });
  }

  window.openCityAds = Object.freeze({
    setConsent: setConsent,
    participationIntent: participationIntent
  });

  // A site's consent manager must explicitly call openCityAds.setConsent(true).
  // Do not initialize or send anything until a visitor opts in.
})(window, document);
