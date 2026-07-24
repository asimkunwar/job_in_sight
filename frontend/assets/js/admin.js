/* =========================================================================
   JobInSight — admin.js
   Vanilla JS for admin.html. Mirrors the sidebar/topbar behavior from
   script.js and adds admin-only interactions: table search & filters,
   skill-tag management, mining "run now" simulation, settings toggles.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  animateStatCounters();
  initSidebarToggle();
  initNavHighlighting();
  initNotificationDropdown();
  initLogout();

  initTableSearch('userSearch', 'userTableBody');
  initTableSearch('jobSearch', 'jobTableBody');
  initTableSearch('companySearch', 'companyTableBody');

  initStatusFilter();
  initTagManager();
  initMiningControls();
  initSettingsForm();
});

/* ---------------------------------------------------------------------
   Current date in the topbar
   --------------------------------------------------------------------- */
function setCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  if (!dateEl) return;
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  dateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

/* ---------------------------------------------------------------------
   Dummy statistic count-up animation (same technique as user dashboard)
   --------------------------------------------------------------------- */
function animateStatCounters() {
  document.querySelectorAll('.stat-card__value[data-count]').forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-count'), 10) || 0;
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(eased * target).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(tick);
      else counter.textContent = target.toLocaleString('en-US');
    }
    requestAnimationFrame(tick);
  });
}

/* ---------------------------------------------------------------------
   Sidebar toggle (off-canvas mobile)
   --------------------------------------------------------------------- */
function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !toggleBtn || !overlay) return;

  const close = () => {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  };

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-visible');
  });

  overlay.addEventListener('click', close);

  document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 860) close();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) close();
  });
}

/* ---------------------------------------------------------------------
   Sidebar active-link highlighting on scroll
   --------------------------------------------------------------------- */
function initNavHighlighting() {
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = Array.from(navLinks)
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.section === id));
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setActive(link.dataset.section));
  });

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------------------------------------------------------------------
   Notification dropdown
   --------------------------------------------------------------------- */
function initNotificationDropdown() {
  const btn = document.getElementById('notificationBtn');
  const dropdown = document.getElementById('notificationDropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.classList.toggle('is-open');
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target) && event.target !== btn) {
      dropdown.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dropdown.classList.remove('is-open');
  });
}

/* ---------------------------------------------------------------------
   Logout — redirects to the login page
   --------------------------------------------------------------------- */
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = 'login.html';
  });
}

/* ---------------------------------------------------------------------
   Generic live table search: filters <tr> rows by data-search attribute
   --------------------------------------------------------------------- */
function initTableSearch(inputId, tbodyId) {
  const input = document.getElementById(inputId);
  const tbody = document.getElementById(tbodyId);
  if (!input || !tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    rows.forEach((row) => {
      const haystack = row.dataset.search || row.textContent.toLowerCase();
      row.style.display = query === '' || haystack.toLowerCase().includes(query) ? '' : 'none';
    });
  });
}

/* ---------------------------------------------------------------------
   Status filter dropdowns (Manage Jobs / Manage Users / Manage Companies)
   --------------------------------------------------------------------- */
function initStatusFilter() {
  document.querySelectorAll('.filter-select[data-filter-target]').forEach((select) => {
    const tbody = document.getElementById(select.dataset.filterTarget);
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));

    select.addEventListener('change', () => {
      const value = select.value;
      rows.forEach((row) => {
        const status = row.dataset.status || '';
        row.style.display = value === 'all' || status === value ? '' : 'none';
      });
    });
  });
}

/* ---------------------------------------------------------------------
   Skill tag manager (add / remove) — Skills & Categories section
   --------------------------------------------------------------------- */
function initTagManager() {
  const input = document.getElementById('newSkillInput');
  const addBtn = document.getElementById('addSkillBtn');
  const list = document.getElementById('skillTagList');
  if (!input || !addBtn || !list) return;

  const addTag = () => {
    const value = input.value.trim();
    if (!value) return;

    const tag = document.createElement('span');
    tag.className = 'manage-tag';
    tag.innerHTML = `${value} <button type="button" aria-label="Remove ${value}"><i class="fa-solid fa-xmark"></i></button>`;
    tag.querySelector('button').addEventListener('click', () => tag.remove());

    list.appendChild(tag);
    input.value = '';
    input.focus();
  };

  addBtn.addEventListener('click', addTag);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    }
  });

  // Wire up remove buttons on tags already in the static markup
  list.querySelectorAll('.manage-tag button').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('.manage-tag').remove());
  });
}

/* ---------------------------------------------------------------------
   Data mining control: "Run Now" simulation with status + log feedback
   --------------------------------------------------------------------- */
function initMiningControls() {
  const buttons = document.querySelectorAll('.source-card__run');
  const logConsole = document.getElementById('logConsole');

  const appendLog = (tag, message) => {
    if (!logConsole) return;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const line = document.createElement('div');
    line.className = 'log-console__line';
    line.innerHTML = `<span class="log-console__time">[${time}]</span> <span class="log-console__tag--${tag}">${message}</span>`;
    logConsole.appendChild(line);
    logConsole.scrollTop = logConsole.scrollHeight;
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.source-card');
      const sourceName = card?.querySelector('.source-card__name')?.textContent.trim() || 'Source';
      const dot = card?.querySelector('.status-dot');
      const statusText = card?.querySelector('.source-card__status-text');

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running…';
      if (dot) { dot.classList.remove('status-dot--idle'); dot.classList.add('status-dot--running'); }
      if (statusText) statusText.textContent = 'Running';

      appendLog('info', `Starting scrape job for ${sourceName}…`);

      setTimeout(() => {
        appendLog('ok', `${sourceName} scrape completed — 128 new listings ingested.`);
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Run Now';
        if (dot) { dot.classList.remove('status-dot--running'); dot.classList.add('status-dot--idle'); }
        if (statusText) statusText.textContent = 'Idle';
      }, 1800);
    });
  });
}

/* ---------------------------------------------------------------------
   Settings form — dummy save feedback (no backend yet)
   --------------------------------------------------------------------- */
function initSettingsForm() {
  const form = document.getElementById('settingsForm');
  const banner = document.getElementById('settingsBanner');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!banner) return;
    banner.textContent = 'Settings saved successfully.';
    banner.classList.add('is-visible');
    setTimeout(() => banner.classList.remove('is-visible'), 2600);
  });
}