#!/usr/bin/env python3
"""Inject the EN/ES language toggle into the RC All Exteriors proposal.

Idempotent: running it twice leaves the file unchanged after the first pass.
"""
import json, re, sys

HTML = 'index.html'
DICT = 'es.json'

src = open(HTML, encoding='utf-8').read()
es = json.load(open(DICT, encoding='utf-8'))

if 'id="lang-toggle"' in src:
    print('already injected, nothing to do')
    sys.exit(0)

# ---------------------------------------------------------------- 1. CSS
css_anchor = "    ::-webkit-scrollbar          { width: 4px; }"
assert src.count(css_anchor) == 1, 'css anchor'
css = """    /* Language toggle */
    #lang-toggle {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(222,229,53,0.35);
      border-radius: 999px;
      padding: 3px;
      flex-shrink: 0;
    }
    .lang-btn {
      font-family: 'Manrope', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: var(--muted);
      background: transparent;
      border: none;
      border-radius: 999px;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      transition: background 0.18s, color 0.18s;
      line-height: 1;
    }
    .lang-btn:hover { color: #fff; }
    .lang-btn.active {
      background: var(--accent);
      color: #080808;
    }
    #lang-toggle.nudge {
      animation: langPulse 2s ease-out 3;
    }
    @keyframes langPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(222,229,53,0); }
      35%      { box-shadow: 0 0 0 7px rgba(222,229,53,0.22); }
      70%      { box-shadow: 0 0 0 0 rgba(222,229,53,0); }
    }

    /* Hero language invite */
    #lang-invite {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(222,229,53,0.07);
      border: 1px solid rgba(222,229,53,0.45);
      border-radius: 999px;
      padding: 0.75rem 1.375rem;
      margin-bottom: 2.25rem;
      cursor: pointer;
      text-align: left;
      font-family: 'Manrope', sans-serif;
      font-size: 0.9375rem;
      color: #e5e7eb;
      line-height: 1.4;
      transition: background 0.18s, border-color 0.18s, transform 0.12s;
      max-width: 100%;
    }
    #lang-invite:hover {
      background: rgba(222,229,53,0.13);
      border-color: var(--accent);
      transform: translateY(-1px);
    }
    #lang-invite svg { flex-shrink: 0; color: var(--accent); }
    #lang-invite .invite-cta {
      color: var(--accent);
      font-weight: 600;
      white-space: nowrap;
      border-bottom: 1px solid rgba(222,229,53,0.5);
    }
    @media (max-width: 480px) {
      #lang-invite { border-radius: 16px; align-items: flex-start; padding: 0.875rem 1.125rem; font-size: 0.875rem; }
      #nav-confidential { display: none; }
    }

"""
src = src.replace(css_anchor, css + css_anchor, 1)

# ---------------------------------------------------------------- 2. Nav toggle
nav_old = ('  <span style="font-size:0.6875rem;font-weight:500;color:var(--faint);'
           'letter-spacing:0.1em;text-transform:uppercase;">Confidential &middot; September 2026</span>')
assert src.count(nav_old) == 1, 'nav anchor'
nav_new = ('''  <div style="display:flex;align-items:center;gap:1rem;">
    <span id="nav-confidential" style="font-size:0.6875rem;font-weight:500;color:var(--faint);letter-spacing:0.1em;text-transform:uppercase;">Confidential &middot; September 2026</span>
    <div id="lang-toggle" role="group" aria-label="Language / Idioma">
      <button type="button" class="lang-btn active" data-lang="en" aria-label="English">EN</button>
      <button type="button" class="lang-btn" data-lang="es" aria-label="Espanol">ES</button>
    </div>
  </div>''')
src = src.replace(nav_old, nav_new, 1)

# ---------------------------------------------------------------- 3. Hero invite
hero_anchor = '''    <div class="fade-up d3" style="display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;font-size:0.8125rem;">
      <span style="color:var(--faint);">Prepared for'''
assert src.count(hero_anchor) == 1, 'hero anchor'
invite = '''    <button type="button" id="lang-invite" class="fade-up d2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span><span id="lang-invite-text">Esta propuesta tambi&eacute;n est&aacute; disponible en espa&ntilde;ol.</span> <span class="invite-cta" id="lang-invite-cta">Verla en espa&ntilde;ol</span></span>
    </button>

'''
src = src.replace(hero_anchor, invite + hero_anchor, 1)

# ---------------------------------------------------------------- 4. Script
body_close = '</body>\n</html>'
assert src.count(body_close) == 1, 'body close'

script = """
<!-- LANGUAGE TOGGLE -->
<script>
(function () {
  var ES = __ES_JSON__;

  // Reverse map for ES -> EN. Verified collision-free at build time.
  var EN = {};
  for (var k in ES) { if (Object.prototype.hasOwnProperty.call(ES, k)) EN[ES[k]] = k; }

  var TITLE = {
    en: 'RC All Exteriors x Surge: Growth System',
    es: 'RC All Exteriors x Surge: Sistema de Crecimiento'
  };

  var INVITE = {
    // Shown while the page is in English: invite in Spanish so it reads as a gesture.
    en: { text: 'Esta propuesta tambi\\u00e9n est\\u00e1 disponible en espa\\u00f1ol.', cta: 'Verla en espa\\u00f1ol' },
    // Shown while the page is in Spanish: offer English back.
    es: { text: 'This proposal is also available in English.', cta: 'View it in English' }
  };

  var PLACEHOLDERS = [
    ['f-signer', 'Type full name to sign'],
    ['f-title',  'e.g. Owner']
  ];

  var current = 'en';
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };

  function walk(node, fn) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { fn(c); }
      else if (c.nodeType === 1 && !SKIP[c.tagName]) { walk(c, fn); }
    }
  }

  function apply(lang) {
    var map = (lang === 'es') ? ES : EN;
    walk(document.body, function (t) {
      var raw = t.nodeValue;
      var key = raw.trim();
      if (!key) return;
      var hit = map[key];

      // Strings joined by a middot ("02 \u00b7 The Situation", the nav and footer
      // lines) arrive as ONE text node in the browser, so they never match a whole
      // key. Translate each segment and rejoin.
      if (hit === undefined && key.indexOf('\u00b7') !== -1) {
        var parts = key.split('\u00b7');
        var changed = false;
        for (var i = 0; i < parts.length; i++) {
          var seg = parts[i].trim();
          if (map[seg] !== undefined) {
            parts[i] = parts[i].replace(seg, map[seg]);
            changed = true;
          }
        }
        if (changed) hit = parts.join('\u00b7');
      }

      if (hit === undefined) return;
      // preserve the original surrounding whitespace so layout does not shift
      var lead = raw.slice(0, raw.indexOf(key));
      var tail = raw.slice(raw.indexOf(key) + key.length);
      t.nodeValue = lead + hit + tail;
    });

    for (var i = 0; i < PLACEHOLDERS.length; i++) {
      var el = document.getElementById(PLACEHOLDERS[i][0]);
      if (el) {
        var base = PLACEHOLDERS[i][1];
        el.placeholder = (lang === 'es' && ES[base]) ? ES[base] : base;
      }
    }

    document.documentElement.lang = lang;
    document.title = TITLE[lang];

    var iv = INVITE[lang];
    var ivText = document.getElementById('lang-invite-text');
    var ivCta  = document.getElementById('lang-invite-cta');
    if (ivText) ivText.textContent = iv.text;
    if (ivCta)  ivCta.textContent  = iv.cta;

    var btns = document.querySelectorAll('.lang-btn');
    for (var b = 0; b < btns.length; b++) {
      btns[b].classList.toggle('active', btns[b].getAttribute('data-lang') === lang);
    }

    current = lang;
    window.__lang = lang;
    try { localStorage.setItem('rc-lang', lang); } catch (e) {}
  }

  function setLang(lang) {
    if (lang === current) return;
    apply(lang);
    var tg = document.getElementById('lang-toggle');
    if (tg) tg.classList.remove('nudge');
  }
  window.setLang = setLang;

  // Translate a single string for dynamically inserted content.
  window.tr = function (s) {
    if (current === 'es' && ES[s] !== undefined) return ES[s];
    return s;
  };

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.lang-btn') : null;
    if (btn) { setLang(btn.getAttribute('data-lang')); return; }
    var inv = e.target.closest ? e.target.closest('#lang-invite') : null;
    if (inv) { setLang(current === 'en' ? 'es' : 'en'); }
  });

  // Restore a previous choice on this device, otherwise nudge the toggle once
  // so it is noticed without hijacking the page.
  var saved = null;
  try { saved = localStorage.getItem('rc-lang'); } catch (e) {}
  if (saved === 'es') {
    apply('es');
  } else {
    var tg = document.getElementById('lang-toggle');
    if (tg) setTimeout(function () { tg.classList.add('nudge'); }, 1400);
  }
})();
</script>

</body>
</html>"""

script = script.replace('__ES_JSON__', json.dumps(es, ensure_ascii=False, indent=0).replace('\n', ' '))
src = src.replace(body_close, script.lstrip('\n'), 1)


# ---------------------------------------------------------------- 5. handleSubmit
def sub(old, new, label):
    global src
    assert src.count(old) == 1, '%s: %d matches' % (label, src.count(old))
    src = src.replace(old, new, 1)
    print('  handleSubmit:', label)

sub("""    const dateDisplay = date
      ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : date;""",
"""    const locale = (window.__lang === 'es') ? 'es-US' : 'en-US';
    const dOpts  = { year:'numeric', month:'long', day:'numeric' };
    // What the client sees, in whichever language they are reading.
    const dateDisplay = date ? new Date(date + 'T12:00:00').toLocaleDateString(locale, dOpts) : date;
    // What Sam and Mario get in the notification email: always English.
    const dateEn      = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', dOpts) : date;""",
    'date locale follows active language')

sub("    const spend       = fd.get('spend')        || 'Decide on launch call';",
    "    const spend       = fd.get('spend')        || 'Decide on the launch call';",
    'fallback aligned to a dictionary key')

sub("        date:     dateDisplay,", "        date:     dateEn,",
    'notification email carries the English date')

sub("        retainer: `Launch $3,000/mo. Starting ad budget: ${spend}`,",
"""        // Always English: this email goes to Sam and Mario, not the client.
        retainer: `Launch $3,000/mo. Starting ad budget: ${spend}`,
        language_viewed: (window.__lang === 'es') ? 'Spanish' : 'English',""",
    'payload stays English, records language viewed')

sub("    document.getElementById('conf-spend').textContent = spend;",
    "    document.getElementById('conf-spend').textContent = window.tr ? window.tr(spend) : spend;",
    'confirmation spend translated for display')

sub("""      payLabel.textContent       = "You're approved. One step left: start the subscription and lock your build slot.";""",
"""      const approvedMsg          = "You're approved. One step left: start the subscription and lock your build slot.";
      payLabel.textContent       = window.tr ? window.tr(approvedMsg) : approvedMsg;""",
    'approval label translated')

open(HTML, 'w', encoding='utf-8').write(src)
print('injected: toggle + invite + %d translations' % len(es))
