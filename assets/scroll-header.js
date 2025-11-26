const ScrollHeader = (() => {
  const transparentClass = 'header--transparent';
  const scrolledClass = 'header--scrolled';
  let ticking = false;

  const header = document.querySelector('.section-header .header');
  const heroLogo = document.querySelector('.hero-logo');
  const isHome = document.body.classList.contains('template-index');

  if (!header) return;

  const updateHeaderState = () => {
    const y = window.scrollY;

    if (isHome && y <= 1) {
      header.classList.add(transparentClass);
      header.classList.remove(scrolledClass);
    } else {
      header.classList.add(scrolledClass);
      header.classList.remove(transparentClass);
    }

    if (heroLogo && isHome) {
      const fadeDistance = 200;
      const clamped = Math.min(Math.max(y, 0), fadeDistance);
      const opacity = 1 - clamped / fadeDistance;
      heroLogo.style.opacity = opacity.toFixed(2);
      heroLogo.style.transform = `translateY(${clamped * 0.1}px)`;
    }

    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateHeaderState);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeaderState();
})();
