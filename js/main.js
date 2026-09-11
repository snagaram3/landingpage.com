function handleSignupSubmit(form, onSuccess) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // No backend is wired up yet — swap this for a real API call once one exists.
    onSuccess(form);
  });
}

function setupSignupForms() {
  const heroForm = document.getElementById("hero-signup-form");
  if (heroForm) {
    handleSignupSubmit(heroForm, (form) => {
      form.innerHTML = '<p class="signup-success" role="status">Thanks &mdash; we&rsquo;ll be in touch shortly.</p>';
    });
  }

  const signupForm = document.getElementById("signup-form");
  const signupSuccess = document.getElementById("signup-success");
  if (signupForm && signupSuccess) {
    handleSignupSubmit(signupForm, (form) => {
      form.hidden = true;
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
