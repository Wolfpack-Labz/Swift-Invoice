(() => {
  const mobileQuery = window.matchMedia('(max-width: 860px)');

  document.querySelectorAll('.nav-accordion').forEach((accordion) => {
    const links = accordion.querySelectorAll('.nav a');

    links.forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileQuery.matches) {
          accordion.removeAttribute('open');
        }
      });
    });

    accordion.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && accordion.open) {
        accordion.removeAttribute('open');
        accordion.querySelector('summary')?.focus();
      }
    });
  });

  const closeDesktopAccordions = (event) => {
    if (!event.matches) {
      document.querySelectorAll('.nav-accordion[open]').forEach((accordion) => {
        accordion.removeAttribute('open');
      });
    }
  };

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', closeDesktopAccordions);
  } else {
    mobileQuery.addListener(closeDesktopAccordions);
  }
})();
