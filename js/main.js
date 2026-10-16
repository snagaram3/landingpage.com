/**
 * Paste the Google Apps Script web-app URL here after you deploy
 * scripts/leads-apps-script.js (see _IDP docs/LEADS.md).
 * When the portal is hosted, point this at POST /api/leads instead.
 */
const SIGNUP_ENDPOINT = "https://script.google.com/macros/s/AKfycbwyi_qurfZS4Ny6D4klfi8mFqtb6paxybg7CeMZSI3MvpDW3w5-TAGc8ovOJBnSbOZ2YQ/exec";

/**
 * Production portal origin, e.g. "https://app.example.com". While empty, the
 * hero "Get my plan" form hands the repo to the review form below instead.
 * Can also be set without editing JS via <meta name="alineplane-portal">.
 */
const PORTAL_ORIGIN = "";

(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Analytics ------------------------------------------------------------ */

  function track(eventName, extra) {
    const payload = Object.assign({ event: eventName }, extra || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, extra || {});
    }
  }

  function setupAnalyticsClicks() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-event]");
      if (!target || target.type === "submit") return;
      track(target.getAttribute("data-event"), {
        href: target.getAttribute("href") || "",
        label: (target.textContent || "").trim(),
      });
    });
  }

  /* Portal --------------------------------------------------------------- */

  function portalOrigin() {
    if (PORTAL_ORIGIN) return PORTAL_ORIGIN.replace(/\/$/, "");
    const meta = document.querySelector('meta[name="alineplane-portal"]');
    const fromMeta = meta && meta.getAttribute("content");
    return fromMeta ? fromMeta.replace(/\/$/, "") : "";
  }

  /** Accepts "github.com/org/app", "https://github.com/org/app(.git)", etc. */
  function normalizeRepo(raw) {
    const value = String(raw || "").trim().replace(/\/+$/, "").replace(/\.git$/, "");
    const match = value.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)$/i);
    return match ? `https://github.com/${match[1]}/${match[2]}` : "";
  }

  function setupRepoForm() {
    const form = document.getElementById("repo-form");
    if (!form) return;
    const input = form.querySelector("input");

    input.addEventListener("input", () => {
      input.setCustomValidity("");
      form.classList.remove("is-invalid");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const repo = normalizeRepo(input.value);
      if (!repo) {
        form.classList.add("is-invalid");
        input.setCustomValidity("Enter a public GitHub repo, like github.com/your-org/your-app");
        input.reportValidity();
        return;
      }

      track("analyze_click", { repo });

      const origin = portalOrigin();
      const path = form.getAttribute("data-portal-path") || "/analyze";
      if (origin) {
        window.location.href = `${origin}${path}?repo=${encodeURIComponent(repo)}`;
        return;
      }

      // No hosted analyzer yet: carry the repo into the review form.
      const reviewRepo = document.getElementById("repo");
      const name = document.getElementById("name");
      if (reviewRepo) reviewRepo.value = repo;
      document.getElementById("review").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      if (name) window.setTimeout(() => name.focus({ preventScroll: true }), reducedMotion ? 0 : 600);
    });
  }

  /* Lead form ------------------------------------------------------------ */

  function payloadFromForm(form, source) {
    const data = new FormData(form);
    return {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || ""),
      cloud: String(data.get("cloud") || ""),
      repo: String(data.get("repo") || "").trim(),
      source,
      pageUrl: window.location.href,
    };
  }

  function isHoneypotFilled(form) {
    const bait = form.querySelector('input[name="website"]');
    return Boolean(bait && String(bait.value || "").trim());
  }

  function showFormError(form, message) {
    let el = form.querySelector("[data-signup-error]");
    if (!el) {
      el = document.createElement("p");
      el.dataset.signupError = "true";
      el.className = "signup-error";
      el.setAttribute("role", "alert");
      form.appendChild(el);
    }
    el.hidden = false;
    el.textContent = message;
  }

  async function submitLead(form, source) {
    if (!SIGNUP_ENDPOINT) {
      throw new Error("Sign-up is not configured yet. Set SIGNUP_ENDPOINT in js/main.js.");
    }
    const response = await fetch(SIGNUP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payloadFromForm(form, source)),
    });
    if (!response.ok && response.type !== "opaque") {
      throw new Error("Could not send that request. Try again in a moment.");
    }
  }

  function setupSignupForm() {
    const form = document.getElementById("signup-form");
    const success = document.getElementById("signup-success");
    if (!form || !success) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const done = () => {
        track("book_review_submit");
        form.hidden = true;
        success.hidden = false;
      };
      if (isHoneypotFilled(form)) return done();

      const button = form.querySelector("button[type='submit']");
      if (button) button.disabled = true;
      try {
        await submitLead(form, "book_review");
        done();
      } catch (err) {
        showFormError(form, err instanceof Error ? err.message : "Could not send that request.");
        if (button) button.disabled = false;
      }
    });
  }

  /* Video facade: load YouTube only when asked --------------------------- */

  function setupVideo() {
    document.querySelectorAll("[data-video]").forEach((facade) => {
      facade.addEventListener("click", () => {
        const id = facade.getAttribute("data-video");
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        iframe.title = "Alineplane demo";
        iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        facade.replaceWith(iframe);
        iframe.focus();
      });
    });
  }

  /* Motion --------------------------------------------------------------- */

  function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    const showAll = () => els.forEach((el) => el.classList.add("is-visible"));
    if (reducedMotion || !("IntersectionObserver" in window)) return showAll();

    // Stagger siblings that enter together.
    const groups = new Map();
    els.forEach((el) => {
      const list = groups.get(el.parentElement) || [];
      list.push(el);
      groups.set(el.parentElement, list);
    });
    groups.forEach((list) => list.forEach((el, i) => el.style.setProperty("--reveal-d", `${Math.min(i, 5) * 0.07}s`)));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => observer.observe(el));

    // Never leave on-screen content hidden if the observer misfires.
    window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 2500);
  }

  /* Canvas: repo → services → datastores, provisioned live --------------- */

  const STATE_LABELS = {
    planned: "Planned",
    deploying: "Deploying",
    active: "Active",
    flagged: "Not supported yet",
  };
  const REPO_LABELS = { planned: "Queued", deploying: "Scanning", active: "Scanned" };

  function setupCanvas() {
    const canvas = document.querySelector("[data-canvas]");
    if (!canvas) return;
    const svg = canvas.querySelector(".canvas-wires");
    const stage = canvas.querySelector(".canvas-stage");
    const statusText = canvas.querySelector("[data-status-text]");
    const replay = canvas.querySelector("[data-replay]");
    const nodes = {};
    canvas.querySelectorAll("[data-node]").forEach((el) => (nodes[el.dataset.node] = el));
    const finalStates = Object.fromEntries(Object.entries(nodes).map(([k, el]) => [k, el.dataset.state]));
    const finalStatus = statusText ? statusText.textContent : "";
    const NS = "http://www.w3.org/2000/svg";

    const wires = (canvas.dataset.wires || "").split(/\s+/).filter(Boolean).map((pair) => {
      const [from, to] = pair.split(">");
      const gap = finalStates[to] === "flagged";
      const line = document.createElementNS(NS, "path");
      line.setAttribute("class", gap ? "wire wire-gap" : "wire");
      const flow = document.createElementNS(NS, "path");
      flow.setAttribute("class", "flow");
      svg.append(line, flow);
      return { from, to, gap, line, flow, drawn: false };
    });

    function setState(key, state) {
      const el = nodes[key];
      if (!el || el.dataset.state === state) return;
      el.dataset.state = state;
      const labels = key === "repo" ? REPO_LABELS : STATE_LABELS;
      el.querySelector(".node-st em").textContent = labels[state] || STATE_LABELS[state];
      if (state === "active" || state === "flagged") {
        el.classList.remove("is-pulse");
        void el.offsetWidth;
        el.classList.add("is-pulse");
      }
      updateFlows();
    }

    function updateFlows() {
      wires.forEach((w) => {
        const live = !w.gap && w.drawn && nodes[w.from].dataset.state === "active" && nodes[w.to].dataset.state === "active";
        w.flow.classList.toggle("is-flowing", live);
      });
    }

    // Curves go right-to-left between columns, top-to-bottom when stacked.
    const stacked = window.matchMedia("(max-width: 560px)");

    function layout() {
      const box = stage.getBoundingClientRect();
      // On phones the flagged item sits below the datastores; a wire to it would cross them.
      wires.forEach((w) => w.gap && (w.line.style.display = stacked.matches ? "none" : ""));
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      wires.forEach((w) => {
        const a = nodes[w.from].getBoundingClientRect();
        const b = nodes[w.to].getBoundingClientRect();
        let d;
        if (b.left >= a.right - 4) {
          const x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top;
          const x2 = b.left - box.left, y2 = b.top + b.height / 2 - box.top;
          const dx = (x2 - x1) * 0.5;
          d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
        } else {
          const x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top;
          const x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top;
          const dy = (y2 - y1) * 0.5;
          d = `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`;
        }
        w.line.setAttribute("d", d);
        w.flow.setAttribute("d", d);
        if (!w.gap && !w.drawn) {
          const len = w.line.getTotalLength();
          w.line.style.strokeDasharray = len;
          w.line.style.strokeDashoffset = len;
        }
      });
    }

    function draw(filter) {
      layout(); // nodes have finished arriving; measure their resting positions
      wires.filter(filter).forEach((w) => {
        if (w.gap) {
          w.line.classList.add("is-shown");
          w.drawn = true;
          return;
        }
        w.line.classList.add("is-drawing");
        w.line.style.strokeDashoffset = "0";
        w.drawn = true;
        w.line.addEventListener("transitionend", () => {
          w.line.classList.remove("is-drawing");
          w.line.style.strokeDasharray = "";
          w.line.style.strokeDashoffset = "";
        }, { once: true });
      });
      updateFlows();
    }

    let timers = [];
    const at = (ms, fn) => timers.push(window.setTimeout(fn, ms));
    const say = (text) => statusText && (statusText.textContent = text);

    function reset() {
      timers.forEach(clearTimeout);
      timers = [];
      canvas.classList.remove("is-on", "is-settled");
      if (replay) replay.hidden = true;
      Object.keys(nodes).forEach((k) => setState(k, "planned"));
      wires.forEach((w) => {
        w.drawn = false;
        w.line.classList.remove("is-shown", "is-drawing");
      });
      say("Reading repository…");
      layout();
      updateFlows();
    }

    function finish() {
      timers.forEach(clearTimeout);
      timers = [];
      canvas.classList.add("is-on", "is-settled");
      Object.entries(finalStates).forEach(([k, st]) => setState(k, st));
      wires.forEach((w) => {
        w.drawn = true;
        w.line.classList.toggle("is-shown", w.gap);
        w.line.style.strokeDasharray = "";
        w.line.style.strokeDashoffset = "";
      });
      layout();
      updateFlows();
      say(finalStatus);
    }

    function play() {
      reset();
      void canvas.offsetWidth;
      canvas.classList.add("is-on");
      at(250, () => setState("repo", "deploying"));
      at(1000, () => {
        setState("repo", "active");
        say("Inferred 4 resources from evidence");
        draw((w) => w.from === "repo");
      });
      at(1500, () => {
        canvas.classList.add("is-settled");
        setState("web", "deploying");
        setState("worker", "deploying");
        draw((w) => w.from !== "repo");
      });
      at(1800, () => {
        setState("pg", "deploying");
        setState("redis", "deploying");
        setState("search", "flagged");
        say("Provisioning in your Azure account…");
      });
      at(2700, () => setState("pg", "active"));
      at(3000, () => setState("redis", "active"));
      at(3400, () => setState("worker", "active"));
      at(3700, () => setState("web", "active"));
      at(3900, () => {
        say(finalStatus);
        if (replay) replay.hidden = false;
      });
    }

    if (replay) replay.addEventListener("click", play);

    let resizeFrame = 0;
    const relayout = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(layout);
    };
    if ("ResizeObserver" in window) new ResizeObserver(relayout).observe(stage);
    else window.addEventListener("resize", relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

    if (reducedMotion || !("IntersectionObserver" in window)) {
      finish();
      return;
    }

    reset();
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        play();
      },
      { threshold: 0.4 }
    );
    observer.observe(canvas);
  }

  /* Header + nav --------------------------------------------------------- */

  function setupHeader() {
    const header = document.querySelector(".header");
    if (!header) return;
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function setupMenu() {
    const burger = document.querySelector(".burger");
    const nav = document.getElementById("site-nav");
    if (!burger || !nav) return;

    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    burger.addEventListener("click", () => setOpen(!document.body.classList.contains("menu-open")));
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (document.body.classList.contains("menu-open") && !event.target.closest(".header")) setOpen(false);
    });
    const desktop = window.matchMedia("(min-width: 861px)");
    const onChange = (e) => e.matches && setOpen(false);
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else desktop.addListener(onChange);
  }

  function setupScrollSpy() {
    const links = [...document.querySelectorAll(".nav-link")];
    const targets = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if (!targets.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === id));
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    targets.forEach((section) => observer.observe(section));
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupAnalyticsClicks();
    setupRepoForm();
    setupSignupForm();
    setupVideo();
    setupReveal();
    setupCanvas();
    setupHeader();
    setupMenu();
    setupScrollSpy();
  });
})();
