(() => {
  const mobileQuery = window.matchMedia('(max-width: 860px)');
  const accordions = Array.from(document.querySelectorAll('.nav-accordion'));

  const closeMobileMenus = (except = null) => {
    if (!mobileQuery.matches) return;
    accordions.forEach((accordion) => {
      if (accordion !== except) accordion.removeAttribute('open');
    });
  };

  const syncNavigationForViewport = () => {
    accordions.forEach((accordion) => {
      if (mobileQuery.matches) accordion.removeAttribute('open');
      else accordion.setAttribute('open', '');
    });
  };

  accordions.forEach((accordion) => {
    const summary = accordion.querySelector('summary');
    const links = accordion.querySelectorAll('.nav a');

    summary?.addEventListener('click', () => {
      if (mobileQuery.matches && !accordion.open) closeMobileMenus(accordion);
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileQuery.matches) accordion.removeAttribute('open');
      });
    });

    accordion.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileQuery.matches && accordion.open) {
        accordion.removeAttribute('open');
        summary?.focus();
      }
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!mobileQuery.matches) return;
    accordions.forEach((accordion) => {
      if (accordion.open && !accordion.contains(event.target)) accordion.removeAttribute('open');
    });
  });

  syncNavigationForViewport();
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', syncNavigationForViewport);
  } else {
    mobileQuery.addListener(syncNavigationForViewport);
  }
})();
