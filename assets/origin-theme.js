/**
 * Origin Lux Dawn - Theme Scripts
 * Consolidated from inline scripts in layout/theme.liquid
 */

document.addEventListener("DOMContentLoaded", function () {
  // --- Header Search Toggle Fix ---
  document.addEventListener("click", function (event) {
    // Note: liquid routes are replaced with window.routes in the main theme file,
    // but for specific selectors we might need to rely on classes or attributes that don't depend on dynamic liquid.
    // However, since this file is static asset, we can't use {{ routes.search_url }}.
    // We will use a more generic selector or assume window.routes is available if we needed it for logic,
    // but here it is just for selector matching.
    // Best practice: Use data attributes or generic classes.
    // For now, we'll adapt the selector to be slightly more robust without liquid.

    const searchLink = event.target.closest(
      'a.header__icon--search, a.icon-btn[href*="/search"]'
    );
    if (!searchLink) return;

    const headerRoot = searchLink.closest(".header, .origin-header");
    const modalToggle =
      headerRoot?.querySelector("details-modal .modal__toggle") ||
      document.querySelector("details-modal .modal__toggle");

    if (!modalToggle) return;

    event.preventDefault();
    modalToggle.dispatchEvent(new Event("click", { bubbles: true }));
  });

  // --- Sticky Add To Cart Bar ---
  const stickyBar = document.querySelector("[data-origin-sticky-atc]");
  // We can't check liquid 'request.page_type' here directly.
  // We should rely on the existence of the sticky bar element which typically only exists on product pages.

  if (stickyBar) {
    const productForm =
      document.querySelector('product-form form[action*="/cart/add"]') ||
      document.querySelector('form[action*="/cart/add"]');

    if (productForm) {
      const stickyButton = stickyBar.querySelector(
        "[data-origin-sticky-atc-button]"
      );
      const offset = 80;
      const shouldShowOnViewport = () => window.innerWidth < 990;

      const updateStickyVisibility = () => {
        if (!shouldShowOnViewport()) {
          stickyBar.classList.remove("is-visible");
          return;
        }

        const rect = productForm.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const passedForm = rect.bottom < viewportHeight - offset;

        stickyBar.classList.toggle("is-visible", passedForm);
      };

      window.addEventListener("scroll", updateStickyVisibility, {
        passive: true,
      });
      window.addEventListener("resize", updateStickyVisibility);
      updateStickyVisibility();

      if (stickyButton) {
        stickyButton.addEventListener("click", function () {
          if (typeof productForm.requestSubmit === "function") {
            productForm.requestSubmit();
          } else {
            productForm.submit();
          }
        });
      }
    }
  }

  // --- Origin Quick Add (Collections) ---
  const quickAddForms = document.querySelectorAll(
    "[data-origin-quick-add-form]"
  );
  if (quickAddForms.length) {
    const refreshCart = () => {
      const drawerItems = document.querySelector("cart-drawer-items");
      if (drawerItems && typeof drawerItems.onCartUpdate === "function") {
        return drawerItems.onCartUpdate().then(() => {
          const drawer = document.querySelector("cart-drawer");
          drawer?.open();
        });
      }
      return Promise.resolve();
    };

    quickAddForms.forEach((form) => {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const body = {
          id: formData.get("id"),
          quantity: formData.get("quantity") || 1,
        };

        // window.routes should be defined in theme.liquid before this script loads
        const cartAddUrl = window.routes
          ? window.routes.cart_add_url
          : "/cart/add";

        fetch(`${cartAddUrl}.js`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then(() => refreshCart())
          .catch(() => form.submit());
      });
    });
  }

  // --- Origin Hero Scroll Cue ---
  const scrollCue = document.querySelector("[data-origin-hero-scroll]");
  if (scrollCue) {
    const hero = scrollCue.closest("[data-origin-hero]");
    const hideCue = () => {
      if (window.scrollY > 120) {
        scrollCue.style.opacity = "0";
        scrollCue.style.pointerEvents = "none";
      } else {
        scrollCue.style.opacity = "1";
        scrollCue.style.pointerEvents = "auto";
      }
    };
    window.addEventListener("scroll", hideCue, { passive: true });
    hideCue();

    scrollCue.addEventListener("click", function () {
      const nextSection = hero?.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
      }
    });
  }

  // --- Origin Size Guide Modal ---
  const sizeGuideModal = document.querySelector(
    "[data-origin-size-guide-modal]"
  );
  if (sizeGuideModal) {
    const openers = document.querySelectorAll(
      "[data-origin-size-guide-trigger]"
    );
    const closers = sizeGuideModal.querySelectorAll(
      "[data-origin-size-guide-close]"
    );
    const toggleModal = (shouldOpen) => {
      sizeGuideModal.classList.toggle("is-active", shouldOpen);
      sizeGuideModal.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    };
    openers.forEach((btn) =>
      btn.addEventListener("click", () => toggleModal(true))
    );
    closers.forEach((btn) =>
      btn.addEventListener("click", () => toggleModal(false))
    );
    sizeGuideModal.addEventListener("click", (event) => {
      if (event.target === sizeGuideModal) toggleModal(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") toggleModal(false);
    });
  }

  // --- Origin Cart Upsell Add ---
  document.body.addEventListener("click", function (event) {
    const upsellButton = event.target.closest("[data-origin-cart-upsell-add]");
    if (!upsellButton) return;

    const variantId = upsellButton.getAttribute("data-variant-id");
    if (!variantId) return;

    upsellButton.setAttribute("disabled", "disabled");

    const cartAddUrl = window.routes ? window.routes.cart_add_url : "/cart/add";

    fetch(`${cartAddUrl}.js`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    })
      .then((response) => response.json())
      .then(() => {
        const drawerItems = document.querySelector("cart-drawer-items");
        if (drawerItems && typeof drawerItems.onCartUpdate === "function") {
          return drawerItems.onCartUpdate().then(() => {
            const drawer = document.querySelector("cart-drawer");
            drawer?.open();
          });
        }
        return null;
      })
      .finally(() => upsellButton.removeAttribute("disabled"))
      .catch(() => {
        const cartUrl = window.routes ? window.routes.cart_url : "/cart";
        window.location.href = cartUrl;
      });
  });

  // --- Back To Top ---
  var backToTop = document.querySelector(".origin-back-to-top");
  if (backToTop) {
    function toggleBackToTop() {
      if (window.scrollY > 400) {
        backToTop.classList.add("origin-back-to-top--visible");
      } else {
        backToTop.classList.remove("origin-back-to-top--visible");
      }
    }

    window.addEventListener("scroll", toggleBackToTop, { passive: true });

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
