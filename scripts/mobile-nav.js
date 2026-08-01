(() => {
  const mobileQuery = window.matchMedia('(max-width: 860px)');
  const accordions = Array.from(document.querySelectorAll('.nav-accordion'));

  const syncNavigationForViewport = () => {
    accordions.forEach((accordion) => {
      if (mobileQuery.matches) {
        // Mobile starts collapsed and can be opened by the user.
        accordion.removeAttribute('open');
      } else {
        // Desktop/laptop navigation must always remain visible.
        accordion.setAttribute('open', '');
      }
    });
  };

  accordions.forEach((accordion) => {
    const links = accordion.querySelectorAll('.nav a');

    links.forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileQuery.matches) {
          accordion.removeAttribute('open');
        }
      });
    });

    accordion.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileQuery.matches && accordion.open) {
        accordion.removeAttribute('open');
        accordion.querySelector('summary')?.focus();
      }
    });
  });

  syncNavigationForViewport();

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', syncNavigationForViewport);
  } else {
    mobileQuery.addListener(syncNavigationForViewport);
  }
})();
