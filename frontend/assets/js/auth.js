/* =========================================================================
   JobInSight — auth.js
   Shared behavior for login.html and register.html.
   Frontend-only: validation + dummy redirect.
   Flask authentication will be integrated later.
======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initRoleTabs();
  initLoginForm();
  initRegisterForm();
  initPasswordStrength();
});

/* ---------------------------------------------------------------------
   Show/hide password fields
   --------------------------------------------------------------------- */
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';
    });
  });
}

/* ---------------------------------------------------------------------
   Role tabs: "Sign in as User" / "Sign in as Admin"
   Determines which dashboard the dummy login redirects to.
   --------------------------------------------------------------------- */
function initRoleTabs() {
  const tabs = document.querySelectorAll('.role-tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const input = tab.querySelector('input');
      if (input) input.checked = true;
    });
  });
}

/* ---------------------------------------------------------------------
   Small validation helpers
   --------------------------------------------------------------------- */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('has-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('is-visible');
  }
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('has-error');
  if (errorEl) errorEl.classList.remove('is-visible');
}

function showBanner(banner, type, message) {
  if (!banner) return;
  banner.textContent = message;
  banner.className = `form-banner is-visible form-banner--${type}`;
}

/* ---------------------------------------------------------------------
   Login form
--------------------------------------------------------------------- */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("loginEmail");
  const emailError = document.getElementById("loginEmailError");
  const passwordInput = document.getElementById("loginPassword");
  const passwordError = document.getElementById("loginPasswordError");
  const banner = document.getElementById("loginBanner");
  const submitBtn = document.getElementById("loginSubmit");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let valid = true;

    clearFieldError(emailInput, emailError);
    clearFieldError(passwordInput, passwordError);

    // Email Validation
    if (!emailInput.value.trim()) {
      showFieldError(emailInput, emailError, "Email is required.");
      valid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      showFieldError(emailInput, emailError, "Enter a valid email address.");
      valid = false;
    }

    // Password Validation
    if (!passwordInput.value) {
      showFieldError(passwordInput, passwordError, "Password is required.");
      valid = false;
    } else if (passwordInput.value.length < 6) {
      showFieldError(
        passwordInput,
        passwordError,
        "Password must be at least 6 characters."
      );
      valid = false;
    }

    if (!valid) {
      showBanner(
        banner,
        "error",
        "Please fix the highlighted fields and try again."
      );
      return;
    }

    // Determine selected role
    const roleInput = form.querySelector('input[name="role"]:checked');
    const role = roleInput ? roleInput.value : "user";

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

    showBanner(
      banner,
      "success",
      "Login successful. Redirecting..."
    );

    // Redirect after short delay
    setTimeout(() => {

    const redirectURL =
        role === "admin"
            ? "../admin_dashboard/admin.html"
            : "../user_dashboard/user.html";

    window.location.href = redirectURL;

}, 700);
  });
}

/* ---------------------------------------------------------------------
   Register form
   --------------------------------------------------------------------- */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const nameInput = document.getElementById('registerName');
  const nameError = document.getElementById('registerNameError');
  const emailInput = document.getElementById('registerEmail');
  const emailError = document.getElementById('registerEmailError');
  const passwordInput = document.getElementById('registerPassword');
  const passwordError = document.getElementById('registerPasswordError');
  const confirmInput = document.getElementById('registerConfirm');
  const confirmError = document.getElementById('registerConfirmError');
  const termsInput = document.getElementById('registerTerms');
  const termsError = document.getElementById('registerTermsError');
  const banner = document.getElementById('registerBanner');
  const submitBtn = document.getElementById('registerSubmit');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;

    [
      [nameInput, nameError],
      [emailInput, emailError],
      [passwordInput, passwordError],
      [confirmInput, confirmError],
    ].forEach(([input, error]) => clearFieldError(input, error));
    termsError.classList.remove('is-visible');

    if (!nameInput.value.trim()) {
      showFieldError(nameInput, nameError, 'Full name is required.');
      valid = false;
    }

    if (!emailInput.value.trim()) {
      showFieldError(emailInput, emailError, 'Email is required.');
      valid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      showFieldError(emailInput, emailError, 'Enter a valid email address.');
      valid = false;
    }

    if (!passwordInput.value) {
      showFieldError(passwordInput, passwordError, 'Password is required.');
      valid = false;
    } else if (passwordInput.value.length < 8) {
      showFieldError(passwordInput, passwordError, 'Use at least 8 characters.');
      valid = false;
    }

    if (!confirmInput.value) {
      showFieldError(confirmInput, confirmError, 'Please confirm your password.');
      valid = false;
    } else if (confirmInput.value !== passwordInput.value) {
      showFieldError(confirmInput, confirmError, 'Passwords do not match.');
      valid = false;
    }

    if (!termsInput.checked) {
      termsError.classList.add('is-visible');
      valid = false;
    }

    if (!valid) {
      showBanner(banner, 'error', 'Please fix the highlighted fields and try again.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account…';
    showBanner(banner, 'success', 'Account created. Redirecting to login…');

    // Frontend-only demo: simulate account creation, then send to login.
    // Flask will later persist the user in MySQL before this redirect.
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 900);
  });
}

/* ---------------------------------------------------------------------
   Password strength meter (register page only)
   --------------------------------------------------------------------- */
function initPasswordStrength() {
  const passwordInput = document.getElementById('registerPassword');
  const bars = document.querySelectorAll('.strength-meter__bar');
  const label = document.getElementById('strengthLabel');

  if (!passwordInput || !bars.length) return;

  const colors = ['#e6eaf0', '#ef4444', '#f59e0b', '#16a34a', '#2563eb'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  passwordInput.addEventListener('input', () => {
    const value = passwordInput.value;
    let score = 0;

    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    bars.forEach((bar, index) => {
      bar.style.background = index < score ? colors[score] : '#e6eaf0';
    });

    if (label) label.textContent = value ? labels[score] : '';
  });
}