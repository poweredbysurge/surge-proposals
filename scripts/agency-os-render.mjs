#!/usr/bin/env node
// Agency OS proposal -> Surge proposal page (Mario, 2026-10-30).
//
// Agency OS (BPT's proposal pipeline) decides WHAT the proposal says: the data pull, the angles, the
// section order, the forecast. This script decides how it LOOKS and how it closes: the Surge skin
// (#080808, lime #dee535, Bebas Neue + Manrope, the same components as the RC, Home Source and Señor
// pages), plus our own sections: why Surge, the investment card, and sign + Stripe.
// Only this page ever goes to a client. The Agency OS deck and its web_url never do.
//
// Inputs
//   --deck   deck.json   the proposal_deck output (slides with blocks), saved as-is
//   --client <slug>      reads clients/<slug>/surge.json (our extras and the publish facts)
//   --draft              internal preview: DRAFT banner, no signature form, allowed without a call or price
//   --add-route          adds /<slug> to build.sh and vercel.json (idempotent)
//
// Publish lock (no --draft): refuses unless surge.json has discovery_call (date) and monthly_price, and
// the lint finds nothing blocking. A pre-call proposal can only ever be a draft.
//
// surge.json
//   { "company": "Bath Fitter", "contact": "Melissa", "vertical": "home_services",
//     "discovery_call": "2026-11-04", "tier": "Scale", "monthly_price": 6500,
//     "price_note": "Month to month, 30 days notice.", "stripe_link": "https://buy.stripe.com/...",
//     "video": "/clients/<slug>/explainer.mp4", "includes": ["..."], "reasons": [{ "title": "...", "body": "..." }],
//     "extras": [{ "label": "Custom website", "amount": "$1,000/mo for 12 months" }] }
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const flag = (k) => args.includes(k);

// ---------------------------------------------------------------------------------------------
// Text: escaping, Surge house rules, home-services vocabulary

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** BPT's deck copy is written for law firms. For a home services prospect, say it the way a contractor would. */
const HOME_SERVICES = [
  [/\bsigned cases a month\b/gi, "booked jobs a month"],
  [/\bsigned cases\b/gi, "booked jobs"],
  [/\bsigned case\b/gi, "booked job"],
  [/\bsigned outcome\b/gi, "booked job"],
  [/\bWhat is my case worth and how long will it take\?/g, "What will it cost and who should I trust?"],
  [/\bWhat happened to me and what are the rules\?/g, "What are my options?"],
  [/\bwhat a case is worth or how long it takes\b/gi, "what the work costs or how long it takes"],
  [/\bcases\b/gi, "jobs"],
  [/\bcase\b/gi, "job"],
  [/\bpractice[- ]area\b/gi, "service"],
  [/\bclients?\b(?= a month)/gi, "customers"],
  [/\bthe firm\b/gi, "the company"],
  [/\bfirms\b/gi, "companies"],
  [/\bfirm\b/gi, "company"],
  [/\ba bio or a results page\b/gi, "a pricing or about page"],
  [/\battorneys?\b/gi, "team"],
];

let CTX = { company: "", draftTitle: "", vertical: "home_services" };

function say(s) {
  let t = String(s ?? "");
  if (CTX.draftTitle) t = t.split(CTX.draftTitle).join(CTX.company);
  if (CTX.vertical === "home_services") for (const [re, to] of HOME_SERVICES) t = t.replace(re, (m) => matchCase(m, to));
  return t.replace(/\s*[—–]\s*/g, (m) => (/\d/.test(m) ? "-" : ", ")).replace(/ ,/g, ",");
}
const matchCase = (from, to) => (from[0] === from[0].toUpperCase() && from[0] !== from[0].toLowerCase() ? to[0].toUpperCase() + to.slice(1) : to);
const h = (s) => esc(say(s));

// ---------------------------------------------------------------------------------------------
// Lint: what must be fixed in Agency OS (proposal_revise) or surge.json before a client sees it

function lint(deck, surge, hasCall) {
  const out = [];
  const add = (level, where, msg) => out.push({ level, where, msg });
  const walk = (o, path) => {
    if (typeof o === "string") {
      const t = say(o);
      if (/\b(you told us|told us on the call|on the call)\b/i.test(t) && !hasCall) add("block", path, `quotes a call that has not happened: "${t.slice(0, 90)}"`);
      if (/PRE-CALL DRAFT|do not send/i.test(t)) add("block", path, "internal draft note in client copy");
      if (/\bOur work goes where the cases are\b/i.test(o)) add("warn", path, "law-firm copy rewritten by the vocabulary pass, read it once");
    } else if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { if (k !== "shot") walk(v, `${path}.${k}`); }
  };
  for (const s of deck.slides) {
    if (s.hidden) continue;
    walk(s, s.id);
    if (s.id === "competitors") {
      const empty = (s.blocks?.[0]?.rows ?? []).filter((r) => (r.cells ?? []).filter((c) => /^\s*[—-]?\s*$/.test(String(c.v ?? ""))).length >= 2).map((r) => r.sub || r.label);
      if (empty.length) add("warn", s.id, `competitor rows with missing data (${empty.join(", ")}); hide the slide or re-pull`);
    }
    if (s.id === "forecast") {
      const k = s.blocks?.find((b) => b.kind === "kpis")?.items ?? [];
      const jobs = k.find((x) => /case|job/i.test(x.label ?? ""));
      if (jobs && Number(String(jobs.value).replace(/[^\d.]/g, "")) > 500) add("block", s.id, `forecast says ${jobs.value} ${say(jobs.label).toLowerCase()}: set real conversion rates (proposal_revise) or hide the slide`);
    }
  }
  if (!surge.company) add("block", "surge.json", "company missing");
  return out;
}

// ---------------------------------------------------------------------------------------------
// Blocks -> Surge components

const toneColor = { good: "var(--accent)", accent: "var(--accent)", bad: "#f87171", info: "#e5e7eb", neutral: "#d1d5db" };

function kpis(b) {
  return `<div class="stat-grid">${(b.items ?? []).map((k) => `
    <div class="stat-chip"><div class="font-display" style="font-size:2.4rem;line-height:1;color:${toneColor[k.tone] ?? "#fff"};">${h(k.value)}</div>
      <div style="font-size:0.8125rem;color:#d1d5db;margin-top:0.5rem;">${h(k.label)}</div>
      ${k.meta ? `<div style="font-size:0.75rem;color:${k.meta_tone === "bad" ? "#f87171" : "var(--faint)"};margin-top:0.25rem;">${h(k.meta)}</div>` : ""}</div>`).join("")}</div>`;
}

function notes(b) {
  const style = { bad: "col-bad", good: "col-good" };
  return `<div class="notes-grid">${(b.items ?? []).map((n) => `
    <div class="${style[n.tone] ?? "card"}" style="padding:1.5rem;"><h3 style="font-weight:600;font-size:1rem;margin-bottom:0.5rem;color:#fff;">${h(n.title)}</h3>
      <p style="color:var(--muted);font-size:0.9rem;line-height:1.65;">${h(n.body)}</p></div>`).join("")}</div>`;
}

function panels(b) {
  return `<div class="notes-grid">${(b.items ?? []).map((p) => `
    <div class="engine">${p.eyebrow ? `<div class="section-label" style="margin-bottom:0.5rem;">${h(p.eyebrow)}</div>` : ""}
      <h3 class="font-display" style="font-size:1.6rem;line-height:1.05;margin-bottom:0.625rem;">${h(p.title)}</h3>
      <p style="color:var(--muted);font-size:0.9rem;line-height:1.65;">${h(p.body)}</p>
      ${(p.stats ?? []).length ? `<div style="display:flex;gap:1.5rem;margin-top:1rem;flex-wrap:wrap;">${p.stats.map((s) => `<div><div class="font-display" style="font-size:1.8rem;color:var(--accent);line-height:1;">${h(s.value)}</div><div style="font-size:0.75rem;color:var(--faint);">${h(s.label)}</div></div>`).join("")}</div>` : ""}</div>`).join("")}</div>`;
}

function line(b) {
  const series = b.series ?? [];
  const labels = series[0]?.points?.map((p) => p.label) ?? [];
  const all = series.flatMap((s) => s.points.map((p) => Number(p.value) || 0));
  if (!labels.length || !all.length) return "";
  const W = 900, H = 300, L = 56, R = 16, T = 16, B = 34;
  const max = Math.max(...all) * 1.08, min = 0;
  const x = (i) => L + (i * (W - L - R)) / Math.max(1, labels.length - 1);
  const y = (v) => T + (H - T - B) * (1 - (v - min) / (max - min || 1));
  const fmt = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : String(Math.round(v)));
  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => { const v = min + f * (max - min); return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,0.06)"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" fill="#6b7280" font-size="11">${fmt(v)}</text>`; }).join("");
  const step = Math.ceil(labels.length / 8);
  const xl = labels.map((l, i) => (i % step === 0 || i === labels.length - 1 ? `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" fill="#6b7280" font-size="11">${esc(l)}</text>` : "")).join("");
  const colors = ["#dee535", "#9ca3af", "#f87171"];
  const paths = series.map((s, si) => `<path d="${s.points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(Number(p.value) || 0).toFixed(1)}`).join("")}" fill="none" stroke="${colors[si % 3]}" stroke-width="2.5" ${s.style === "dashed" ? 'stroke-dasharray="6 5"' : ""}/>`).join("");
  const legend = series.length > 1 ? `<div style="display:flex;gap:1.25rem;flex-wrap:wrap;margin-top:0.75rem;font-size:0.8125rem;color:#d1d5db;">${series.map((s, si) => `<span style="display:inline-flex;align-items:center;gap:0.4rem;"><span style="width:18px;height:3px;background:${colors[si % 3]};display:inline-block;${s.style === "dashed" ? "opacity:.6" : ""}"></span>${h(s.name)}</span>`).join("")}</div>` : "";
  return `<div class="card" style="padding:1.25rem;">${b.caption ? `<div class="card-h">${h(b.caption)}</div>` : ""}<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;" role="img" aria-label="${h(b.caption || series.map((s) => s.name).join(", "))}">${grid}${xl}${paths}</svg>${legend}</div>`;
}

function matrix(b) {
  const head = `<tr>${(b.columns ?? []).map((c) => `<th${c.highlight ? ' class="hl"' : ""}>${h(c.label)}${c.sub ? `<span>${h(c.sub)}</span>` : ""}</th>`).join("")}</tr>`;
  const rows = (b.rows ?? []).map((r) => `<tr${r.highlight ? ' class="hl"' : ""}><td><b>${h(r.label)}</b>${r.badge ? ` <em class="badge">${h(r.badge)}</em>` : ""}${r.sub ? `<span>${h(r.sub)}</span>` : ""}${r.tag ? `<span>${h(r.tag.text)}</span>` : ""}</td>${(r.cells ?? []).map((c) => `<td style="color:${toneColor[c.tone] ?? "#d1d5db"}">${h(c.v)}</td>`).join("")}</tr>`).join("");
  return `<div class="tbl${b.prose ? " prose" : ""}"><table>${head}${rows}</table></div>`;
}

function funnel(b) {
  const pct = (s) => Math.max(2, Number(String(s ?? "").replace(/[^\d.]/g, "")) || 0);
  return `<div style="display:grid;gap:0.75rem;">${(b.stages ?? []).map((s) => `
    <div class="card" style="padding:1.25rem 1.5rem;">
      <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:baseline;">
        <div><div class="section-label">${h(s.stage)}</div><div style="color:#d1d5db;font-size:0.9rem;margin-top:0.25rem;">${h(s.question)}</div></div>
        <div style="text-align:right;"><span class="font-display" style="font-size:1.8rem;color:var(--accent);">${h(s.keywords)}</span> <span style="color:var(--faint);font-size:0.8rem;">keywords · ${h(s.traffic)} visits · ${h(s.pages)} pages</span></div>
      </div>
      <div style="height:6px;background:rgba(255,255,255,0.05);border-radius:3px;margin-top:0.875rem;"><div style="height:6px;width:${pct(s.share)}%;background:var(--accent);border-radius:3px;"></div></div>
      ${(s.examples ?? []).length ? `<div style="color:var(--faint);font-size:0.8rem;margin-top:0.625rem;">${s.examples.map((e) => `${h(e.keyword)} ${h(e.position)}`).join(" · ")}</div>` : ""}
    </div>`).join("")}</div>`;
}

function pageaudit(b) {
  return `<div class="two-col" style="align-items:start;">
    ${b.shot ? `<div class="card" style="padding:0.75rem;"><img src="${b.shot}" alt="${h(b.url)}" style="width:100%;border-radius:10px;display:block;" loading="lazy"/><div style="font-size:0.75rem;color:var(--faint);margin-top:0.5rem;word-break:break-all;">${h(b.url)}</div></div>` : ""}
    <div>${(b.checks ?? []).map((c) => `<div class="check-item"><span style="color:${c.verdict === "good" ? "var(--accent)" : "#f87171"};flex-shrink:0;">${c.verdict === "good" ? "&#10003;" : "&#10007;"}</span><span style="color:#d1d5db;"><b>${h(c.label)}</b>: ${h(c.value)}${c.note ? ` <span style="color:var(--faint)">${h(c.note)}</span>` : ""}</span></div>`).join("")}
      ${(b.fixes ?? []).map((f) => `<div class="engine" style="margin-top:0.75rem;padding:1.25rem;"><h3 style="font-weight:600;color:#fff;margin-bottom:0.25rem;">${h(f.title)}</h3><p style="color:var(--muted);font-size:0.875rem;">${h(f.body)}</p></div>`).join("")}</div></div>`;
}

function scope(b) {
  return `<div class="notes-grid">${(b.items ?? []).map((w) => `
    <div class="card"><div class="section-label" style="margin-bottom:0.375rem;">${h(w.when)}</div>
      <h3 class="font-display" style="font-size:1.6rem;line-height:1.05;margin-bottom:0.375rem;">${h(w.title)}</h3>
      <p style="color:var(--muted);font-size:0.875rem;margin-bottom:0.75rem;">${h(w.summary)}</p>
      ${(w.includes ?? []).map((i) => `<div class="check-item"><span style="color:var(--accent);flex-shrink:0;">&#8594;</span><span style="color:#d1d5db;">${h(i)}</span></div>`).join("")}</div>`).join("")}</div>`;
}

function timeline(b) {
  return matrix({ columns: [{ label: "" }, ...(b.columns ?? []).map((c) => ({ label: c }))], rows: (b.rows ?? []).map((r) => ({ label: r.label, cells: r.cells.map((c) => ({ v: c })) })) });
}

const paragraph = (b) => `<p style="color:#d1d5db;font-size:1.0625rem;line-height:1.75;max-width:760px;">${h(b.text)}</p>`;
const bullets = (b) => (b.items ?? []).map((i) => `<div class="check-item"><span style="color:var(--accent);flex-shrink:0;">&#8594;</span><span style="color:#d1d5db;">${h(i.text)}${i.note ? ` <span style="color:var(--faint)">${h(i.note)}</span>` : ""}</span></div>`).join("");

const RENDER = { kpis, notes, panels, line, matrix, funnel, pageaudit, scope, timeline, paragraph, bullets };

// ---------------------------------------------------------------------------------------------
// Page

function section(n, s, alt) {
  const blocks = (s.blocks ?? []).map((b) => (RENDER[b.kind] ? `<div class="fade-up d3" style="margin-top:1.5rem;">${RENDER[b.kind](b)}</div>` : `<!-- unknown block ${esc(b.kind)} -->`)).join("");
  return `
<section id="${esc(s.id)}" style="padding:5.5rem 1.5rem;${alt ? "background:var(--surface2);border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04);" : ""}">
  <div style="max-width:1000px;margin:0 auto;">
    <div class="accent-line fade-up" style="margin-bottom:1.25rem;"></div>
    <div class="section-label fade-up d1" style="margin-bottom:0.875rem;">${String(n).padStart(2, "0")} &middot; ${h(s.eyebrow || "")}</div>
    <h2 class="section-title fade-up d2" style="margin-bottom:0.875rem;">${h(s.title).toUpperCase()}</h2>
    ${s.source_note ? `<p class="fade-up d3" style="color:var(--faint);font-size:0.8125rem;max-width:680px;line-height:1.6;">${h(s.source_note)}</p>` : ""}
    ${blocks}
  </div>
</section>`;
}

function divider(s) {
  return `
<section style="padding:6rem 1.5rem;border-top:1px solid rgba(255,255,255,0.04);" class="hero-grid">
  <div style="max-width:1000px;margin:0 auto;">
    <div class="section-label fade-up">${h(s.eyebrow)}</div>
    <h2 class="font-display fade-up d1" style="font-size:clamp(3.5rem,10vw,7.5rem);line-height:0.9;color:var(--accent);">${h(s.title).toUpperCase()}</h2>
    ${s.source_note ? `<p class="fade-up d2" style="color:var(--muted);margin-top:1rem;">${h(s.source_note)}</p>` : ""}
  </div>
</section>`;
}

const money = (n) => `$${Number(n).toLocaleString("en-US")}`;

function reasonsSection(n, surge) {
  const reasons = surge.reasons?.length ? surge.reasons : [
    { title: "We only do home services", body: "Roofers, remodelers, landscapers, restaurants with real kitchens. We know what a booked job is worth to you and we measure everything against it." },
    { title: "You own everything", body: "Your website, your Google profile, your data, your accounts. Month to month, 30 days notice. If we stop earning it, you walk away with all of it." },
    { title: "You talk to the people doing the work", body: "Sam and Mario on every monthly call. No account managers in between, no reports nobody reads." },
  ];
  return `
<section style="padding:5.5rem 1.5rem;">
  <div style="max-width:1000px;margin:0 auto;">
    <div class="accent-line fade-up" style="margin-bottom:1.25rem;"></div>
    <div class="section-label fade-up d1" style="margin-bottom:0.875rem;">${String(n).padStart(2, "0")} &middot; Why Surge</div>
    <h2 class="section-title fade-up d2" style="margin-bottom:2rem;">THREE REASONS.<br/><span style="color:var(--accent);">NO FLUFF.</span></h2>
    <div class="notes-grid">${reasons.map((r, i) => `<div class="proof fade-up d${i + 3}"><div class="font-display" style="font-size:2.5rem;color:var(--accent);line-height:1;">0${i + 1}</div><h3 style="font-weight:600;color:#fff;margin:0.5rem 0;">${h(r.title)}</h3><p style="color:var(--muted);font-size:0.9rem;line-height:1.65;">${h(r.body)}</p></div>`).join("")}</div>
  </div>
</section>`;
}

function investmentSection(n, surge, draft) {
  const priced = Number(surge.monthly_price) > 0;
  const price = priced ? money(surge.monthly_price) : "After our call";
  return `
<section id="investment" style="padding:5.5rem 1.5rem;background:var(--surface2);border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04);">
  <div style="max-width:900px;margin:0 auto;">
    <div class="accent-line fade-up" style="margin-bottom:1.25rem;"></div>
    <div class="section-label fade-up d1" style="margin-bottom:0.875rem;">${String(n).padStart(2, "0")} &middot; The Offer</div>
    <h2 class="section-title fade-up d2" style="margin-bottom:2rem;">ONE NUMBER.<br/><span style="color:var(--accent);">NO SURPRISES.</span></h2>
    <div class="fade-up d3" style="background:var(--surface);border:2px solid var(--accent);border-radius:16px;padding:2rem;">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:1.5rem;margin-bottom:1.5rem;">
        <div><div class="section-label" style="margin-bottom:0.5rem;">Monthly engagement${surge.tier ? ` &middot; ${h(surge.tier)}` : ""}</div>
          <h3 class="font-display" style="font-size:1.75rem;line-height:1.1;">Everything in this plan</h3>
          <p style="color:var(--muted);font-size:0.875rem;margin-top:0.375rem;">${h(surge.price_note || "Month to month. 30 days notice. No long-term contract.")}</p></div>
        <div style="text-align:right;"><div class="font-display" style="font-size:${priced ? "4rem" : "2.5rem"};color:var(--accent);line-height:1;">${price}</div>${priced ? `<div style="font-size:0.8125rem;color:var(--faint);">/month</div>` : ""}</div>
      </div>
      ${(surge.includes ?? []).length ? `<div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:1.25rem;">${surge.includes.map((i) => `<div class="check-item"><span style="color:var(--accent);flex-shrink:0;">&#8594;</span><span style="color:#d1d5db;">${h(i)}</span></div>`).join("")}</div>` : ""}
      ${(surge.extras ?? []).map((x) => `<div class="check-item" style="justify-content:space-between;"><span style="color:#d1d5db;">${h(x.label)}</span><span style="color:var(--accent);">${h(x.amount)}</span></div>`).join("")}
    </div>
    ${draft && !priced ? `<p class="fade-up d4" style="color:#f87171;font-size:0.8125rem;margin-top:1rem;">Draft: price and tier are set after the discovery call.</p>` : ""}
  </div>
</section>`;
}

function closeSection(n, surge, steps, draft) {
  const form = draft ? `<div class="card" style="padding:1.5rem;color:#f87171;">Draft preview: the signature form and payment link appear on the published page only.</div>` : `
    <form id="proposal-form" class="card fade-up d4" style="padding:2rem;" onsubmit="handleSubmit(event)">
      <h3 style="font-weight:600;font-size:1rem;color:#d1d5db;margin-bottom:0.375rem;">Approve proposal</h3>
      <p style="font-size:0.8125rem;color:var(--faint);margin-bottom:1.5rem;">One signature from an authorized representative. Typed name serves as a binding signature.</p>
      <div style="display:grid;gap:1rem;margin-bottom:1.25rem;">
        <input class="field" type="text" id="f-signer" name="signer_name" placeholder="Type full name to sign" required />
        <input class="field" type="text" id="f-title" name="signer_title" placeholder="Your title" />
        <input class="field" type="date" id="f-date" name="date" required />
      </div>
      <button type="submit" id="submit-btn" class="btn" style="width:100%;font-size:1.25rem;">SIGN AND APPROVE</button>
    </form>
    <div id="signed" class="card" style="display:none;padding:2rem;text-align:center;">
      <h3 class="font-display" style="font-size:2rem;color:var(--accent);">Signed. Thank you.</h3>
      <p style="color:var(--muted);margin:0.75rem 0 1.5rem;">Last step: start the monthly subscription.</p>
      <a class="btn" href="${esc(surge.stripe_link)}" target="_blank" rel="noopener">START THE SUBSCRIPTION</a>
    </div>
    <script>
      async function handleSubmit(e) {
        e.preventDefault();
        const f = e.target, b = document.getElementById('submit-btn'); b.disabled = true; b.textContent = 'SENDING...';
        const body = { name: f.signer_name.value + (f.signer_title.value ? ', ' + f.signer_title.value : ''), company: ${JSON.stringify(surge.company)}, date: f.date.value,
          retainer: ${JSON.stringify(Number(surge.monthly_price) > 0 ? money(surge.monthly_price) + "/mo" + (surge.tier ? " (" + surge.tier + ")" : "") : "")}, proposal: location.href, fee: ${JSON.stringify((surge.extras ?? []).map((x) => x.label + ": " + x.amount).join("; ") || "none")} };
        try { await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); } catch (_) {}
        f.style.display = 'none'; document.getElementById('signed').style.display = 'block';
      }
    </script>`;
  return `
<section id="next" style="padding:5.5rem 1.5rem;">
  <div style="max-width:720px;margin:0 auto;">
    <div class="accent-line fade-up" style="margin-bottom:1.25rem;"></div>
    <div class="section-label fade-up d1" style="margin-bottom:0.875rem;">${String(n).padStart(2, "0")} &middot; Next steps</div>
    <h2 class="section-title fade-up d2" style="margin-bottom:2rem;">LET'S BUILD THIS.</h2>
    <div style="display:grid;gap:1rem;margin-bottom:2.5rem;">${steps.map((s, i) => `
      <div class="card fade-up d3" style="padding:1.5rem;display:flex;gap:1.25rem;"><div class="font-display" style="font-size:2.5rem;color:var(--accent);line-height:1;">0${i + 1}</div>
        <div><h3 style="font-weight:600;color:#e5e7eb;margin-bottom:0.25rem;">${h(s.text)}</h3>${s.note ? `<p style="color:var(--muted);font-size:0.875rem;">${h(s.note)}</p>` : ""}</div></div>`).join("")}</div>
    ${form}
  </div>
</section>`;
}

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--accent:#dee535;--accent-hover:#b8be2a;--bg:#080808;--surface:#111111;--surface2:#0d0d0d;--border:rgba(255,255,255,0.06);--muted:#9ca3af;--faint:#6b7280}
html{scroll-behavior:smooth;overflow-x:clip}
body{font-family:'Manrope',sans-serif;background:var(--bg);color:#fff;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.font-display{font-family:'Bebas Neue',sans-serif;letter-spacing:.01em}
.section-label{font-size:.6875rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
.section-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,6.5vw,5rem);line-height:.93;letter-spacing:.01em;max-width:900px}
.accent-line{width:36px;height:3px;background:var(--accent);border-radius:2px}
.fade-up{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}.fade-up.in{opacity:1;transform:none}
.d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}.d5{transition-delay:.5s}
.hero-grid{background-image:linear-gradient(rgba(222,229,53,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(222,229,53,.035) 1px,transparent 1px);background-size:64px 64px}
.card,.proof{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:1.75rem}
.card-h{font-size:.75rem;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);margin-bottom:.75rem}
.engine{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:1.75rem;border-left:2px solid var(--accent)}
.col-bad{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.18);border-radius:16px}
.col-good{background:rgba(222,229,53,.05);border:1px solid rgba(222,229,53,.18);border-radius:16px}
.notes-grid{display:grid;grid-template-columns:1fr;gap:1rem}@media(min-width:768px){.notes-grid{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}}
.two-col{display:grid;grid-template-columns:1fr;gap:1.25rem}@media(min-width:768px){.two-col{grid-template-columns:1fr 1fr}}
.stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem}@media(min-width:768px){.stat-grid{grid-template-columns:repeat(4,1fr)}}
.two-col>*,.notes-grid>*,.stat-grid>*{min-width:0}
.check-item span,.card p,.engine p{overflow-wrap:anywhere}
.stat-chip{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.25rem;text-align:center}
.check-item{display:flex;gap:.75rem;align-items:flex-start;font-size:.9rem;line-height:1.55;padding:.625rem 0;border-bottom:1px solid rgba(255,255,255,.04)}.check-item:last-child{border-bottom:none}
.tbl{overflow-x:auto;border:1px solid var(--border);border-radius:16px;background:var(--surface)}
.tbl table{width:100%;border-collapse:collapse;font-size:.875rem;min-width:560px}
.tbl th{text-align:left;font-size:.6875rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);font-weight:600;padding:.875rem 1rem;border-bottom:1px solid var(--border);vertical-align:bottom}
.tbl th span,.tbl td span{display:block;font-size:.75rem;color:var(--faint);text-transform:none;letter-spacing:0;font-weight:400}
.tbl td{padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:top}
.tbl tr.hl td{background:rgba(222,229,53,.06)}.tbl th.hl{color:var(--accent)}
.tbl.prose td{line-height:1.55}.badge{font-style:normal;font-size:.625rem;letter-spacing:.12em;text-transform:uppercase;background:var(--accent);color:#080808;border-radius:4px;padding:.1rem .35rem}
.btn{display:inline-flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.125rem;letter-spacing:.06em;color:#080808;background:var(--accent);border:none;border-radius:8px;padding:1rem 2rem;cursor:pointer;text-decoration:none}
.btn:hover{background:var(--accent-hover)}
.field{background:#0d0d0d;border:1px solid rgba(255,255,255,.09);border-radius:8px;color:#fff;padding:.875rem 1rem;width:100%;font-family:'Manrope',sans-serif;font-size:.9375rem}
.field:focus{border-color:var(--accent);outline:none}
#nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;background:rgba(8,8,8,.88);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.04)}
.draft-bar{position:fixed;bottom:0;left:0;right:0;z-index:101;background:#f87171;color:#080808;text-align:center;font-weight:600;font-size:.8125rem;padding:.5rem 1rem}
`;

function render(deck, surge, draft) {
  const slides = deck.slides.filter((s) => !s.hidden);
  const cover = slides.find((s) => s.layout === "cover");
  const closing = slides.find((s) => s.layout === "closing");
  const body = [];
  let n = 1, alt = false;
  for (const s of slides) {
    if (s === cover || s === closing) continue;
    if (s.layout === "section") { body.push(divider(s)); continue; }
    body.push(section(n++, s, alt)); alt = !alt;
  }
  body.push(reasonsSection(n++, surge));
  body.push(investmentSection(n++, surge, draft));
  const steps = closing?.blocks?.find((b) => b.kind === "bullets")?.items ?? [{ text: "Approve this proposal" }, { text: "Kickoff call" }];
  body.push(closeSection(n++, surge, steps, draft));

  const title = `${surge.company} x Surge: ${say(cover?.title || "SEO Proposal")}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)}</title>
<meta name="robots" content="noindex, nofollow"/>
<meta property="og:title" content="${esc(title)}"/><meta property="og:image" content="https://proposals.thesurgeagency.com/brand/SurgeProposalOG.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet"/>
<link rel="icon" href="https://thesurgeagency.com/favicon.ico"/>
<!-- Built by scripts/agency-os-render.mjs from Agency OS proposal ${esc(deck.analysis_id ?? "")} on ${new Date().toISOString().slice(0, 10)}. Edit the proposal in Agency OS or clients/<slug>/surge.json, then render again. -->
<style>${CSS}</style>
</head>
<body>
<nav id="nav"><span class="font-display" style="font-size:1.4rem;letter-spacing:.12em;">SURGE <span style="color:var(--accent);">&#10022;</span></span><span style="font-size:.75rem;color:var(--faint);letter-spacing:.12em;text-transform:uppercase;">Prepared for ${h(surge.company)}</span></nav>
<section class="hero-grid" style="min-height:92vh;display:flex;flex-direction:column;justify-content:flex-end;padding:8rem 1.5rem 4.5rem;">
  <div style="max-width:1000px;margin:0 auto;width:100%;">
    <div class="section-label fade-up" style="margin-bottom:1rem;">${h(surge.company)} &middot; ${h(surge.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))}</div>
    <h1 class="font-display fade-up d1" style="font-size:clamp(3.5rem,11vw,8.5rem);line-height:.88;">${h(cover?.title || "SEO Proposal").toUpperCase()}</h1>
    ${surge.descriptor || cover?.source_note ? `<p class="fade-up d2" style="color:var(--muted);font-size:1.0625rem;max-width:620px;margin-top:1.25rem;line-height:1.6;">${h(surge.descriptor || cover.source_note)}</p>` : ""}
    ${surge.video ? `<video class="fade-up d3" src="${esc(surge.video)}" controls playsinline preload="metadata" style="width:100%;max-width:760px;border-radius:16px;margin-top:2rem;border:1px solid var(--border);"></video>` : ""}
  </div>
</section>
${body.join("\n")}
<footer style="padding:2.5rem 1.5rem;text-align:center;color:var(--faint);font-size:.75rem;border-top:1px solid rgba(255,255,255,.04);">Surge &middot; thesurgeagency.com &middot; Data from Ahrefs and Google, pulled ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}</footer>
${draft ? `<div class="draft-bar">DRAFT &middot; internal preview &middot; not for ${h(surge.company)}</div>` : ""}
<script>
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------------------------
// Routes (CLAUDE.md: build.sh governs the live deploy, vercel.json kept in step)

function addRoute(slug) {
  const route = `{ "src": "/${slug}", "dest": "/clients/${slug}/index.html" }`;
  const b = join(ROOT, "build.sh");
  let s = readFileSync(b, "utf8");
  if (!s.includes(`"/${slug}"`)) {
    const m = s.match(/"routes"\s*:\s*\[/);
    if (!m) throw new Error("build.sh: no routes list found");
    s = s.replace(m[0], `${m[0]}\n    ${route},`);
    writeFileSync(b, s);
  }
  const v = join(ROOT, "vercel.json");
  const vj = JSON.parse(readFileSync(v, "utf8"));
  const list = vj.routes ?? vj.rewrites;
  if (Array.isArray(list) && !list.some((r) => (r.src ?? r.source) === `/${slug}`)) {
    list.unshift(vj.routes ? { src: `/${slug}`, dest: `/clients/${slug}/index.html` } : { source: `/${slug}`, destination: `/clients/${slug}/index.html` });
    writeFileSync(v, `${JSON.stringify(vj, null, 2)}\n`);
  }
}

// ---------------------------------------------------------------------------------------------

function main() {
  const slug = arg("--client");
  const deckPath = arg("--deck");
  if (!slug || !deckPath) { console.error("usage: agency-os-render.mjs --client <slug> --deck <deck.json> [--draft] [--add-route]"); process.exit(2); }
  const dir = join(ROOT, "clients", slug);
  const surgePath = join(dir, "surge.json");
  if (!existsSync(surgePath)) { console.error(`STOP: ${surgePath} is missing (company, discovery_call, tier, monthly_price, stripe_link)`); process.exit(2); }
  const surge = JSON.parse(readFileSync(surgePath, "utf8"));
  const deck = JSON.parse(readFileSync(deckPath, "utf8"));
  const draft = flag("--draft");
  CTX = { company: surge.company, draftTitle: surge.agency_os_title || "", vertical: surge.vertical || "home_services" };

  const hasCall = Boolean(surge.discovery_call);
  const issues = lint(deck, surge, hasCall);
  if (!draft) {
    if (!hasCall) issues.push({ level: "block", where: "surge.json", msg: "no discovery_call date: a proposal is never published before the call" });
    if (!(Number(surge.monthly_price) > 0)) issues.push({ level: "block", where: "surge.json", msg: "no monthly_price" });
    if (!/^https:\/\/(buy|checkout)\.stripe\.com\//.test(surge.stripe_link ?? "")) issues.push({ level: "block", where: "surge.json", msg: "stripe_link must be a Stripe Payment Link (ADR-001)" });
  }
  for (const i of issues) console.error(`${i.level.toUpperCase()}  ${i.where}: ${i.msg}`);
  if (!draft && issues.some((i) => i.level === "block")) { console.error("STOP: fix the BLOCK lines (Agency OS proposal_revise or surge.json), then render again."); process.exit(1); }

  const html = render(deck, surge, draft);
  const out = join(dir, draft ? "draft.html" : "index.html");
  writeFileSync(out, html);
  if (flag("--add-route") && !draft) addRoute(slug);
  console.log(JSON.stringify({ written: out, draft, bytes: html.length, blocks: issues.filter((i) => i.level === "block").length, warnings: issues.filter((i) => i.level === "warn").length }));
}

main();
