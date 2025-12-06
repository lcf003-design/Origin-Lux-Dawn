/**
 * Gucci Product Carousel & Zoom Logic
 * Extracted from sections/gucci-carousel-product.liquid
 */

(function () {
  /* --- CAROUSEL LOGIC --- */
  let currentIndex = 0;
  const track = document.getElementById("gsTrack");
  const slides = document.querySelectorAll(".gucci-slide");
  const thumbs = document.querySelectorAll(".gs-thumb");
  const totalSlides = slides.length;

  function updateSlide() {
    if (totalSlides === 0) return;

    // Always reset zoom when changing slides
    resetZoom();

    if (track) {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    thumbs.forEach((t, i) => {
      t.classList.toggle("active", i === currentIndex);
    });
  }

  window.nextSlide = function () {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlide();
  };
  window.prevSlide = function () {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlide();
  };
  window.goToSlide = function (index) {
    currentIndex = index;
    updateSlide();
  };

  /* --- TOUCH SWIPE FOR SLIDER (Disabled when zoomed) --- */
  let touchStartX = 0;
  const stage = document.querySelector(".gucci-visuals-stage");

  if (stage) {
    stage.addEventListener(
      "touchstart",
      (e) => {
        // Don't track swipe if currently zoomed
        if (document.querySelector(".gucci-slide.is-zoomed")) return;
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    stage.addEventListener("touchend", (e) => {
      // Don't trigger swipe change if currently zoomed
      if (document.querySelector(".gucci-slide.is-zoomed")) return;

      let touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) nextSlide();
      if (touchEndX - touchStartX > 50) prevSlide();
    });
  }

  /* --- ZOOM LOGIC (THE GUCCI EFFECT) --- */
  const ZOOM_LEVEL = 2.5;

  // Helper to remove zoom from all slides
  function resetZoom() {
    slides.forEach((slide) => {
      slide.classList.remove("is-zoomed");
      const img = slide.querySelector("img");
      if (img) {
        img.style.transform = "";
        img.style.transformOrigin = "center center";
        // Re-enable smooth transition in case it was removed during panning
        img.style.transition =
          "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform-origin 0.1s linear";
      }
    });
  }

  slides.forEach((slide) => {
    const img = slide.querySelector("img");
    if (!img) return;

    // 1. CLICK TO TOGGLE ZOOM
    slide.addEventListener("click", function (e) {
      // If already zoomed, unzoom
      if (slide.classList.contains("is-zoomed")) {
        resetZoom();
        return;
      }

      // If not zoomed, activate zoom
      resetZoom(); // Clear others first
      slide.classList.add("is-zoomed");

      // Perform initial zoom at the center, or where user clicked?
      // Gucci usually zooms centered, then you move.
      // Or we can zoom exactly where they clicked immediately:
      moveMagnifier(e, slide, img);
    });

    // 2. MOUSE/TOUCH MOVE TO PAN
    slide.addEventListener("mousemove", function (e) {
      if (!slide.classList.contains("is-zoomed")) return;
      moveMagnifier(e, slide, img);
    });

    slide.addEventListener(
      "touchmove",
      function (e) {
        if (!slide.classList.contains("is-zoomed")) return;
        // Prevent scrolling the page while panning image
        if (e.cancelable) e.preventDefault();
        moveMagnifier(e, slide, img);
      },
      { passive: false }
    );
  });

  function moveMagnifier(e, container, img) {
    // Get mouse/touch position
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate percentage position
    let xPercent = (x / rect.width) * 100;
    let yPercent = (y / rect.height) * 100;

    // Clamp values 0-100
    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));

    // Update Transform Origin to "pan"
    // We disable the transition on the transform-origin during movement for instant response
    img.style.transition =
      "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    img.style.transform = `scale(${ZOOM_LEVEL})`;
  }
})();
