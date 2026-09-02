/* ============================================================
   PRABODH
   ============================================================ */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---- placeholder image generator (no external network calls) ---- */
  function placeholderImg(label, seed) {
    const hues = [205, 12, 150, 40, 260, 190];
    const h = hues[Math.abs(hash(seed)) % hues.length];
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(${h},28%,22%)"/>
            <stop offset="1" stop-color="hsl(${h},20%,10%)"/>
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#g)"/>
        <text x="300" y="210" font-family="monospace" font-size="15" fill="rgba(255,255,255,0.55)"
          text-anchor="middle" letter-spacing="2">${escapeXml(label.toUpperCase())}</text>
      </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return h;
  }
  function escapeXml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function imgSrc(story) {
    if (story && story.image) return story.image;
    const label = (story && (story.headline || story.title)) || "story image";
    return placeholderImg(label, label);
  }
  function hasImage(story) {
    return !(story && story.image === false);
  }

  // Returns the <img> tag, or "" if this story explicitly opts out with image:false
  function imgTag(story, cssClass) {
    if (story && story.image === false) return "";
    return `<img class="${cssClass}" src="${imgSrc(story)}" alt="">`;
  }

  // Converts [[1]], [[2]] typed anywhere inside a paragraph into a small
  // clickable superscript number that jumps down to that numbered source.
  // Leaves normal text untouched if no markers are used.
  function processCites(text) {
    if (!text) return text;
    return text.replace(/\[\[(\d+)\]\]/g, (m, n) =>
      `<sup class="cite-marker"><a href="#src-${n}" onclick="return jumpToSource(${n})">[${n}]</a></sup>`);
  }

  // Renders a numbered "Sources" block. Accepts an array of strings (URLs)
  // or objects like {name, url}. Returns "" if no sources given, so nothing
  // shows on the front page — this only ever runs inside openArticle().
  function renderSources(sources) {
    if (!sources || !sources.length) return "";
    const items = sources.map((s, i) => {
      const url = typeof s === "string" ? s : (s.url || "");
      const label = typeof s === "string" ? s : (s.name || s.url || "");
      const n = i + 1;
      return url
        ? `<li class="source-item" id="src-${n}"><span class="source-num">[${n}]</span> <a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`
        : `<li class="source-item" id="src-${n}"><span class="source-num">[${n}]</span> ${label}</li>`;
    }).join("");
    return `<div class="article-sources"><div class="article-sources-head">SOURCES</div><ol class="source-list">${items}</ol></div>`;
  }

  // Smooth-scrolls to a source entry inside the (scrollable) overlay panel
  // instead of relying on default anchor jump, and briefly highlights it.
  window.jumpToSource = function (n) {
    const target = document.getElementById("src-" + n);
    if (!target) return false;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("source-flash");
    setTimeout(() => target.classList.remove("source-flash"), 900);
    return false;
  };

  const overlay = $("#overlay");
  const overlayContent = $("#overlayContent");

  function openArticle(story) {
    if (!story || !story.body) return;
    const imgLabel = story.headline || story.title || "story image";
    overlayContent.innerHTML = `
      ${story.tag ? `<div class="article-tag">${processCites(story.tag)}</div>` : ""}
      <h2 class="article-headline">${processCites(story.headline || story.title)}</h2>
      ${story.deck || story.dek ? `<p class="article-dek">${processCites(story.deck || story.dek)}</p>` : ""}
      <div class="article-meta">${story.dateplace ? processCites(story.dateplace) + " · " : ""}</div>
      ${hasImage(story) ? `<img class="article-img" src="${imgSrc(story)}" alt="">` : ""}
      ${story.caption ? `<p class="article-caption">${processCites(story.caption)}</p>` : ""}
      <div class="article-body">${story.body.map(p => `<p>${processCites(p)}</p>`).join("")}</div>
      ${renderSources(story.sources)}
      ${story.id ? `<div class="article-id-display">ID:<code>${story.id}</code></div>` : ""}
    `;
    overlay.classList.add("open");
    overlay.scrollTop = 0;
    $("#closeOverlay").focus();
  }

  $("#closeOverlay").addEventListener("click", () => overlay.classList.remove("open"));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") overlay.classList.remove("open"); });

  function render() {
    const D = window.ISSUE;
    if (!D) return;

    $("#motto").textContent = D.motto;
    // $("#dateline").textContent = D.dateline;
    $("#issueline").textContent = D.issueline;

    /* Highlights */
    const hEl = $("#highlights");
    hEl.innerHTML = D.highlights.map((h, i) => `
    <div class="highlight-item" data-idx="${i}" tabindex="0">
    ${hasImage(h) ? `<img class="highlight-img" src="${imgSrc(h)}" alt="" style="width:80px;aspect-ratio:1/1;object-fit:cover;border:1px solid var(--ink);flex-shrink:0;">` : ""}
    <div class="h-text">
      <div class="h-tag">${processCites(h.tag)}</div>
      <div class="h-title">${processCites(h.title)}</div>
    </div>
  </div>`).join("");
    $$(".highlight-item", hEl).forEach((el, i) => {
      const h = D.highlights[i];
      const story = { 
        headline: h.title, 
        tag: h.tag, 
        page: h.page, 
        image: h.image, 
        caption: h.caption, 
        sources: h.sources,
        id: h.id,
        body: (h.body && h.body.length) ? h.body : [`Full coverage of "${h.title}" continues on page ${h.page} of this edition.`] 
      };
      el.addEventListener("click", () => openArticle(story));
      el.addEventListener("keydown", e => { if (e.key === "Enter") openArticle(story); });
    });

    /* Lead story */
    const L = D.lead;
    const leadHasImg = hasImage(L);
    $("#leadStory").innerHTML = `
      ${L.tag ? `<div class="article-tag">${processCites(L.tag)}</div>` : ""}
      <h2 class="lead-headline">${processCites(L.headline)}</h2>
      <p class="lead-deck">${processCites(L.deck)}</p>
      <div class="lead-body-preview${leadHasImg ? "" : " no-image"}">
        <div>
          
          <div class="lead-text"><p>${processCites(L.body[0])}</p></div>
        </div>
        ${leadHasImg ? `
        <div>
          <img class="lead-image" src="${imgSrc(L)}" alt="">
          ${L.caption ? `<div class="lead-caption">${processCites(L.caption)}</div>` : ""}
        </div>` : ""}
      </div>
      <span class="read-more">CONTINUE READING →  </span>`;
    $("#leadStory").addEventListener("click", () => openArticle(L));

    /* Demo tab (placeholder section below cover story, styled like Market Watch) */
    if (D.demoTab && D.demoTab.columns && D.demoTab.rows) {
      const dt = D.demoTab;
      const trendIcon = (t) => {
        if (t === "up") return `<span class="trend trend-up">▲</span>`;
        if (t === "down") return `<span class="trend trend-down">▼</span>`;
        if (t === "same") return `<span class="trend trend-same">–</span>`;
        return "";
      };
      $("#demoTab").innerHTML = `
        <h3 class="rail-head">${dt.title || "DEMO SECTION"}</h3>
        <table class="demo-table">
          <thead>
            <tr><th class="col-basis">RANK</th><th class="col-name">OVERALL</th>${dt.columns.map(c => `<th>${c}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${dt.rows.map(r => `
              <tr>
                <td class="demo-rank col-basis">${r.rank}</td>
                <td class="demo-name col-name">${r.values[0]} ${trendIcon(r.trend)}</td>
                ${r.values.slice(1).map((v, idx) => `<td>${v} ${trendIcon(r.trends && r.trends[idx])}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
        ${dt.source ? `<div class="demo-source">${dt.source}</div>` : ""}`;
    } else if (D.demoTab) {
      $("#demoTab").innerHTML = `
        <h3 class="rail-head">${D.demoTab.title || "DEMO SECTION"}</h3>
        <div class="demo-tab-body">${(D.demoTab.lines || ["Add your content here."]).map(l => `<div>${l}</div>`).join("")}</div>`;
    } else {
      $("#demoTab").innerHTML = `
        <h3 class="rail-head">DEMO SECTION</h3>
        <div class="demo-tab-body">Placeholder — add a "demoTab" object to your data.js when you decide what goes here.</div>`;
    }

    /* In brief */
    const briefWrap = $("#inBrief .rail-items");
    briefWrap.innerHTML = D.inBrief.map((b, i) => `
      <div class="brief-item" data-idx="${i}" tabindex="0">
    <div class="h-tag">${processCites(b.tag)}</div>
    <h4>${processCites(b.headline)}</h4>

  </div>`).join("");
    $$(".brief-item", briefWrap).forEach((el, i) => {
      const b = D.inBrief[i];
      const story = { 
        headline: b.headline, 
        page: b.page, 
        image: b.image, 
        caption: b.caption, 
        tag: b.tag, 
        sources: b.sources,
        id: b.id,
        body: (b.fullBody && b.fullBody.length) ? b.fullBody : [processCites(b.body)] 
      };
      el.addEventListener("click", () => openArticle(story));
      el.addEventListener("keydown", e => { if (e.key === "Enter") openArticle(story); });
    });

    /* Market watch */
    $("#marketTable").innerHTML = D.market.rows.map(r => `
      <tr><td class="name">${r.name}</td><td class="change ${r.up ? "up" : "down"}">${r.up ? "▲" : "▼"} ${r.change}</td></tr>
    `).join("");
    $("#marketNote").textContent = D.market.note;

    /* Startup spotlight (fills gap below Market Watch) */
    const SS = D.startupSpotlight;
    const ssEl = $("#startupSpotlight");
    if (SS && ssEl) {
      ssEl.innerHTML = `
        <h3 class="startup-section-label">${processCites(SS.sectionLabel) || "STARTUP SPOTLIGHT"}</h3>
        <div class="startup-tag">${processCites(SS.tag) || ""}</div>
        <h4 class="startup-headline">${processCites(SS.headline)}</h4>
        <p class="startup-summary">${processCites(SS.summary)}</p>`;
      ssEl.addEventListener("click", () => openArticle(SS));
      ssEl.tabIndex = 0;
      ssEl.addEventListener("keydown", e => { if (e.key === "Enter") openArticle(SS); });
    } else if (ssEl) {
      ssEl.style.display = "none";
    }

    /* Secondary grid */
    $("#secondaryGrid").innerHTML = D.secondary.map((s, i) => `
      <article class="sec-story" data-idx="${i}" tabindex="0">
        ${hasImage(s) ? `<img class="sec-img" src="${imgSrc(s)}" alt="">` : ""}
        
        <div class="sec-tag">${processCites(s.tag)}</div>
        <h3 class="sec-headline">${processCites(s.headline)}</h3>
        <p class="sec-summary">${processCites(s.summary)}</p>
        
      </article>`).join("");
    $$(".sec-story", $("#secondaryGrid")).forEach((el, i) => {
      const s = D.secondary[i];
      el.addEventListener("click", () => openArticle(s));
      el.addEventListener("keydown", e => { if (e.key === "Enter") openArticle(s); });
    });

    /* Featured story 1 */
    const F = D.featured;
    $("#featuredStory").innerHTML = `
      <div class="feat-tag">${processCites(F.tag)}</div>
      <h2 class="feat-headline">${processCites(F.headline)}</h2>
      <p class="feat-dek">${processCites(F.dek)}</p>
      <div class="feat-body">
        <p class="feat-summary">${processCites(F.summary)}</p>
      </div>`;
    $("#featuredStory").addEventListener("click", () => openArticle(F));

    /* Featured story 2 */
    const F2 = D.featured2;
    if (F2) {
      $("#featuredStory2").innerHTML = `
        <div class="feat-tag">${processCites(F2.tag)}</div>
        <h2 class="feat-headline">${processCites(F2.headline)}</h2>
        <p class="feat-dek">${processCites(F2.dek)}</p>
        <div class="feat-body">
          <p class="feat-summary">${processCites(F2.summary)}</p>
        </div>`;
      $("#featuredStory2").addEventListener("click", () => openArticle(F2));
    }

    /* Infographic (CSS conic-gradient donut) */
    const I = D.infographic;
    const cx = 55, cy = 55, r = 55, rInner = 31;
    let angleAcc = -90; // start at top
    const polar = (cx0, cy0, radius, angDeg) => {
      const rad = (angDeg * Math.PI) / 180;
      return [cx0 + radius * Math.cos(rad), cy0 + radius * Math.sin(rad)];
    };
    const donutPaths = I.segments.map(s => {
      const startAngle = angleAcc;
      const sweep = (s.value / 100) * 360;
      const endAngle = startAngle + sweep;
      angleAcc = endAngle;
      const [x1, y1] = polar(cx, cy, r, startAngle);
      const [x2, y2] = polar(cx, cy, r, endAngle);
      const largeArc = sweep > 180 ? 1 : 0;
      return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${cx} ${cy} Z" fill="${s.color}"></path>`;
    }).join("");
    $("#infographicBlock").innerHTML = `
      <div class="info-title">INFOGRAPHIC</div>
      <div class="info-headline">${I.title}</div>
      <div class="donut-wrap">
        <div style="position:relative;width:110px;height:110px;flex-shrink:0;">
          <svg width="110" height="110" viewBox="0 0 110 110">
            ${donutPaths}
            <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="var(--paper)"></circle>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:8px;line-height:1.1;">${I.centerLabel}</div>
            <div style="font-family:'Fraunces',serif;font-weight:900;font-size:11px;">${I.centerValue}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:7px;">${I.centerYear}</div>
          </div>
        </div>
        <div class="donut-legend">
          ${I.segments.map(s => `<div><span class="legend-swatch" style="background:${s.color}"></span>${s.label} <strong>${s.value}%</strong></div>`).join("")}
        </div>
      </div>
      <div class="info-source">${I.source}</div>`;

    /* Bottom strip */
    $("#bottomStrip").innerHTML = D.bottomStrip.map((b, i) => `
      <article class="bottom-item" data-idx="${i}" tabindex="0">
        <div>
          <div class="bottom-tag">${processCites(b.tag)}</div>
          <h4 class="bottom-headline">${processCites(b.headline)}</h4>
          <p class="bottom-summary">${processCites(b.summary)}</p>
        </div>
      </article>`).join("");
    $$(".bottom-item", $("#bottomStrip")).forEach((el, i) => {
      const b = D.bottomStrip[i];
      el.addEventListener("click", () => openArticle(b));
      el.addEventListener("keydown", e => { if (e.key === "Enter") openArticle(b); });
    });

    /* Footer */
    $("#followLine").innerHTML = `© ${new Date().getFullYear()} PRABODHA. All Rights Reserved.`;
    $("#footLinks").innerHTML = D.footer.links.map(l => `<a href="${l.href}">${l.label}</a>`).join("");
    $("#footTag").textContent = D.footer.tag;
    const footExtraEl = $("#footExtra");
    if (footExtraEl) footExtraEl.textContent = (D.footer.extra !== undefined) ? D.footer.extra : "";
  }

  window.renderIssue = render;
  if (window.ISSUE) render(); // backward-compat: run immediately if data already loaded synchronously
})();
