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
    const plans = document.querySelectorAll("[data-plan]");
    const showAll = () => {
      els.forEach((el) => el.classList.add("is-visible"));
      plans.forEach((el) => el.classList.add("is-playing"));
    };
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
          if (el.classList.contains("reveal")) el.classList.add("is-visible");
          if (el.hasAttribute("data-plan")) el.classList.add("is-playing");
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => observer.observe(el));

    // Never leave on-screen content hidden if the observer misfires.
    window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
          if (el.hasAttribute("data-plan")) el.classList.add("is-playing");
        }
      });
    }, 2500);
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
    setupHeader();
    setupMenu();
    setupScrollSpy();
  });
})();
