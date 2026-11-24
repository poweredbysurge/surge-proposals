// Tells Surge HQ that a proposal was signed. Loaded by every proposal page:
//   <script src="/brand/deal-sign.js"></script>
// and called from the page's signature handler:
//   if (window.surgeDealSigned) window.surgeDealSigned(e.target);   // e.target is the signature form
//
// It sends who signed and what they filled in. The deal itself (services, price) is read by the
// server from the published page, never taken from the browser, so it cannot be altered here.
// The signature form uses these field names: signer_name, signer_title, date.
// Never blocks or breaks signing: any failure is swallowed.
(function () {
  window.surgeDealSigned = function (form) {
    try {
      var el = document.getElementById('surge-deal');
      if (!el || !form) return;
      var sheet = JSON.parse(el.textContent);
      var fd = new FormData(form);
      var fields = {};
      fd.forEach(function (value, key) { if (typeof value === 'string') fields[key] = value.slice(0, 300); });
      fetch('/api/signed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          slug: sheet && sheet.client && sheet.client.slug,
          signed_by: fields.signer_name || '',
          signed_title: fields.signer_title || '',
          signed_on: fields.date || '',
          fields: fields,
        }),
      }).catch(function () {});
    } catch (e) { /* signing must never fail because of this */ }
  };
})();
