// An agent's link: https://tekkoh.com/link#s=<slot>&k=<public key>&n=<name>.
// On an iPhone with Tekkoh, iOS opens the app instead of this page. If this
// page opens anyway (some apps' built-in browsers), it offers the app's own
// tekkoh:// link; on anything else, a code for the phone's camera.
// The key in the link never leaves the page; it asks the server only how
// the link is getting on, by its slot.
addEventListener("hashchange", () => location.reload());
(async () => {
  const $ = (id) => document.getElementById(id);
  const frag = location.hash.slice(1);
  const q = new URLSearchParams(frag);
  const slot = q.get("s") || "", key = q.get("k") || "";
  const raw = b64url(key);
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(slot) || !raw || raw.length !== 32) {
    $("broken").hidden = false;
    return;
  }
  const name = (q.get("n") || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 60);
  if (name) $("name").textContent = "“" + name + "”";

  // The same six digits the app and the command-line tool show.
  try {
    const h = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
    const n = ((h[0] << 16) | (h[1] << 8) | h[2]) % 1000000;
    const d = String(n).padStart(6, "0");
    $("digits").textContent = d.slice(0, 3) + " " + d.slice(3);
  } catch { $("digits").textContent = "—"; }

  const iOS = /iPhone|iPod/.test(navigator.userAgent) ||
    (/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  if (iOS) {
    $("open").href = "tekkoh://link#" + frag;
    $("on-phone").hidden = false;
  } else {
    drawQR($("qr"), "https://tekkoh.com/link#" + frag);
    $("on-computer").hidden = false;
  }
  $("ask").hidden = false;
  watch();

  // Waiting, approved on the phone, collected by the agent, or expired.
  async function watch() {
    const text = {
      waiting: "Waiting for your phone…",
      approved: "Approved on your phone. Waiting for the agent to finish…",
    };
    let last = "";
    for (;;) {
      let state = last;
      try {
        const r = await fetch(`https://tekkoh.cronbon.com/v1/pair/${encodeURIComponent(slot)}/state`, { cache: "no-store" });
        if (r.ok) state = (await r.json()).state;
      } catch {}
      if (state !== last) {
        last = state;
        $("state").dataset.state = state;
        if (text[state]) $("state-text").textContent = text[state];
        if (state === "linked" || state === "expired") return finish(state);
      }
      await new Promise((res) => setTimeout(res, document.hidden ? 6000 : 2000));
    }
  }

  function finish(state) {
    for (const el of document.querySelectorAll("#ask > .link-card:not(.done), #ask > h2, #ask > ul, #ask > .lede-sm")) el.hidden = true;
    const h1 = document.querySelector("#ask > h1");
    if (state === "expired") {
      h1.textContent = "This link has expired.";
      $("done-text").textContent = "It was used, or its fifteen minutes ran out. If you still want to link the agent, ask it for a new one.";
    } else {
      h1.textContent = "Linked.";
      $("done-text").textContent = (name ? "\u201C" + name + "\u201D" : "The agent") + " can open your journal now. You can close this page, and sign it out any time in Tekkoh, under Settings \u203A Browsers and agents.";
    }
    $("done").hidden = false;
  }

  function b64url(s) {
    try {
      const t = s.replace(/-/g, "+").replace(/_/g, "/");
      return Uint8Array.from(atob(t + "===".slice((t.length + 3) % 4)), (c) => c.charCodeAt(0));
    } catch { return null; }
  }

  // As one SVG path, so no inline styles are needed.
  function drawQR(el, text) {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount(), m = 4, size = n + 2 * m;
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Link code");
    const bg = document.createElementNS(ns, "rect");
    bg.setAttribute("width", size); bg.setAttribute("height", size); bg.setAttribute("fill", "#fff");
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", d); p.setAttribute("fill", "#1b1a17");
    svg.append(bg, p);
    el.append(svg);
  }
})();
