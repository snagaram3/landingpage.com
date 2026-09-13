/**
 * Paste the Google Apps Script web-app URL here after you deploy
 * scripts/leads-apps-script.js (see _IDP docs/LEADS.md).
 * When the portal is hosted, point this at POST /api/leads instead.
 */
const SIGNUP_ENDPOINT = "https://script.google.com/macros/s/AKfycbwyi_qurfZS4Ny6D4klfi8mFqtb6paxybg7CeMZSI3MvpDW3w5-TAGc8ovOJBnSbOZ2YQ/exec";

(function () {
  function payloadFromForm(form, source) {
    const data = new FormData(form);
    return {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || ""),
      cloud: String(data.get("cloud") || ""),
      source,
      pageUrl: window.location.href,
    };
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
      throw new Error("Could not send that sign-up. Try again in a moment.");
    }
  }

  function handleSignupSubmit(form, source, onSuccess) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const button = form.querySelector("button[type='submit']");
      if (button) button.disabled = true;
      try {
        await submitLead(form, source);
        onSuccess(form);
      } catch (err) {
        showFormError(form, err instanceof Error ? err.message : "Could not send that sign-up.");
        if (button) button.disabled = false;
      }
    });
  }

  function setupSignupForms() {
    const heroForm = document.getElementById("hero-signup-form");
    if (heroForm) {
      handleSignupSubmit(heroForm, "hero", (form) => {
        form.innerHTML = '<p class="signup-success" role="status">Thanks. We&rsquo;ll be in touch shortly.</p>';
      });
    }

    const signupForm = document.getElementById("signup-form");
    const signupSuccess = document.getElementById("signup-success");
    if (signupForm && signupSuccess) {
      handleSignupSubmit(signupForm, "footer", () => {
        signupForm.hidden = true;
        signupSuccess.hidden = false;
      });
    }
  }

  function markIn(el) {
    el.classList.add("is-in");
  }

  function setupAppear() {
    const nodes = document.querySelectorAll(".appear");
    nodes.forEach((el) => {
      el.addEventListener("animationend", () => markIn(el), { once: true });
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const stalled = [...nodes].every((el) => {
          if (typeof el.getAnimations !== "function") return true;
          const running = el.getAnimations().some((anim) => {
            return anim.playState === "running" || anim.playState === "finished";
          });
          return !running;
        });
        if (stalled) nodes.forEach(markIn);
      });
    });
  }

  function setupScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach((els) => {
      els.forEach((el, i) => {
        el.style.setProperty("--reveal-d", `${i * 0.08}s`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  function setupPointerGlow() {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) {
      return;
    }
    const root = document.documentElement;
    window.addEventListener(
      "pointermove",
      (event) => {
        root.style.setProperty("--mx", `${event.clientX}px`);
        root.style.setProperty("--my", `${event.clientY}px`);
      },
      { passive: true }
    );
  }

  function setupParallax() {
    const atmosphere = document.querySelector(".atmosphere");
    if (!atmosphere || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      atmosphere.style.setProperty("--grid-y", `${window.scrollY * 0.12}px`);
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
  }

  function setupScrollSpy() {
    const links = [...document.querySelectorAll(".nav-pill")];
    const targets = links
      .map((link) => {
        const id = link.getAttribute("href");
        return id && id.startsWith("#") ? document.querySelector(id) : null;
      })
      .filter(Boolean);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === id));
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    targets.forEach((section) => observer.observe(section));
  }

  function setupMenu() {
    const burger = document.querySelector(".burger");
    const nav = document.getElementById("site-nav");
    const backdrop = document.querySelector(".menu-backdrop");
    if (!burger || !nav) return;

    const desktop = window.matchMedia("(min-width: 901px)");

    function setOpen(open) {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (backdrop) backdrop.hidden = !open;
    }

    burger.addEventListener("click", () => {
      setOpen(!document.body.classList.contains("menu-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => setOpen(false));
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    const onDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener("change", onDesktop);
    else desktop.addListener(onDesktop);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupSignupForms();
    setupAppear();
    setupScrollReveal();
    setupMenu();
    setupPointerGlow();
    setupParallax();
    setupScrollSpy();
  });
})();
