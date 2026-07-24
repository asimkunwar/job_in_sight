/* =========================================================================
   JobInSight Dashboard — script.js
   Vanilla JS only. Organized by feature: init, date, stat counters,
   sidebar toggle, nav highlighting, search filter, notifications.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  animateStatCounters();
  initSidebarToggle();
  initNavHighlighting();
  initSearchFilter();
  initNotificationDropdown();
  initLogout();
});

/* ---------------------------------------------------------------------
   Current date in the topbar
   --------------------------------------------------------------------- */
function setCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  if (!dateEl) return;

  const today = new Date();
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  dateEl.textContent = today.toLocaleDateString('en-US', options);
}

/* ---------------------------------------------------------------------
   Dummy statistics count-up animation
   --------------------------------------------------------------------- */
function animateStatCounters() {
  const counters = document.querySelectorAll('.stat-card__value[data-count]');

  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-count'), 10) || 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out for a smoother finish
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      counter.textContent = current.toLocaleString('en-US');

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = target.toLocaleString('en-US');
      }
    }

    requestAnimationFrame(tick);
  });
}

/* ---------------------------------------------------------------------
   Responsive sidebar toggle (off-canvas on mobile, icon-only on tablet)
   --------------------------------------------------------------------- */
function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar || !toggleBtn || !overlay) return;

  const closeSidebar = () => {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  };

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-visible');
  });

  overlay.addEventListener('click', closeSidebar);

  // Close the off-canvas sidebar whenever a nav link is clicked (mobile UX)
  document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 860) closeSidebar();
    });
  });

  // Reset state when resizing back to desktop widths
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeSidebar();
  });
}

/* ---------------------------------------------------------------------
   Sidebar active menu highlighting based on scroll position
   --------------------------------------------------------------------- */
function initNavHighlighting() {
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = Array.from(navLinks)
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.section === id);
    });
  };

  // Click: instant highlight feedback before scroll animation completes
  navLinks.forEach((link) => {
    link.addEventListener('click', () => setActive(link.dataset.section));
  });

  // Scroll: highlight whichever section is currently most visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------------------------------------------------------------------
   Search bar interaction — filters the Latest Job Trends cards live
   --------------------------------------------------------------------- */
function initSearchFilter() {
  const searchInput = document.getElementById('globalSearch');
  const jobGrid = document.getElementById('jobGrid');
  const emptyState = document.getElementById('jobEmptyState');

  if (!searchInput || !jobGrid) return;

  const jobCards = Array.from(jobGrid.querySelectorAll('.job-card'));

  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    let visibleCount = 0;

    jobCards.forEach((card) => {
      const haystack = card.dataset.search || '';
      const matches = query === '' || haystack.includes(query);
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }

    // If the user is actively searching, bring the results into view
    if (query !== '') {
      document.getElementById('job-trends')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Pressing "Enter" simply confirms current filter and keeps focus usable
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') event.preventDefault();
  });
}

/* ---------------------------------------------------------------------
   Notification bell dropdown
   --------------------------------------------------------------------- */
function initNotificationDropdown() {
  const btn = document.getElementById('notificationBtn');
  const dropdown = document.getElementById('notificationDropdown');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.classList.toggle('is-open');
  });

  // Close when clicking anywhere outside the dropdown
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target) && event.target !== btn) {
      dropdown.classList.remove('is-open');
    }
  });

  // Close on Escape for keyboard users
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dropdown.classList.remove('is-open');
  });
}

/* ---------------------------------------------------------------------
   Logout (placeholder — backend not yet connected)
   --------------------------------------------------------------------- */
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    // Placeholder behavior until Flask session/auth endpoints exist.
    // eslint-disable-next-line no-alert
    alert('You have been logged out. (Connect this to the Flask /logout route later.)');
  });
}