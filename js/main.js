/**
 * Paste the Google Apps Script web-app URL here after you deploy
 * scripts/leads-apps-script.js (see _IDP docs/LEADS.md).
 * When the portal is hosted, point this at POST /api/leads instead.
 */
const SIGNUP_ENDPOINT = "https://script.google.com/macros/s/AKfycbwyi_qurfZS4Ny6D4klfi8mFqtb6paxybg7CeMZSI3MvpDW3w5-TAGc8ovOJBnSbOZ2YQ/exec";

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
    // text/plain avoids a CORS preflight against Apps Script.
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
      form.innerHTML = '<p class="signup-success" role="status">Thanks &mdash; we&rsquo;ll be in touch shortly.</p>';
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

function setupScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

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

document.addEventListener("DOMContentLoaded", () => {
  setupSignupForms();
  setupScrollReveal();
});
