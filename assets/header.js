// assets/header.js
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-origin-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menuDrawer = document.querySelector("[data-menu-drawer]");
  const menuClose = document.querySelector("[data-menu-close]");
  const menuOverlay = document.querySelector("[data-menu-overlay]");
  const subToggles = document.querySelectorAll("[data-sub-toggle]");

  // Shrink / solid on scroll
  if (header) {
    const onScroll = () => {
      const scrolled = window.scrollY > 80;
      header.classList.toggle("is-scrolled", scrolled);
      header.classList.toggle("scrolled", scrolled);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const openMenu = () => {
    if (!menuDrawer) return;
    menuDrawer.classList.add("is-open");
    document.documentElement.classList.add("origin-menu-open");
  };

  const closeMenu = () => {
    if (!menuDrawer) return;
    menuDrawer.classList.remove("is-open");
    document.documentElement.classList.remove("origin-menu-open");
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", (event) => {
      event.preventDefault();
      if (menuDrawer && menuDrawer.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", (event) => {
      event.preventDefault();
      closeMenu();
    });
  }

  if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMenu);
  }

  // Mobile submenu toggles
  subToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const item = toggle.closest("[data-has-children]");
      const submenu = item && item.querySelector("[data-sub-menu]");
      if (!submenu) return;

      const isOpen = submenu.classList.toggle("is-open");
      item.classList.toggle("is-open", isOpen);
    });
  });

  // Close menu on Escape
  document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
});
