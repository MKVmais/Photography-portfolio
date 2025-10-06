document.addEventListener("DOMContentLoaded", () => {
  /* =============================
     Scroll animations (data-animate)
  ============================== */
  const animateElements = document.querySelectorAll("[data-animate]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  animateElements.forEach(el => observer.observe(el));

  /* =============================
     Atheneum Belt + Lightbox
  ============================== */
  const belt = document.getElementById("belt");
  if (belt) {
    // Mark originals
    const originals = Array.from(belt.querySelectorAll("img"));
    originals.forEach((img, i) => img.dataset.index = i);

    // Clone nodes for seamless belt
    const clones = originals.map(img => img.cloneNode(true));
    clones.forEach(clone => belt.appendChild(clone));

    // Auto-scroll
    let pos = 0;
    const speed = 1.2;
    let ticker = null;
    const start = () => {
      if (ticker) return;
      ticker = setInterval(() => {
        pos += speed;
        belt.scrollLeft = pos;
        if (pos >= belt.scrollWidth / 2) {
          pos = 0;
          belt.scrollLeft = 0;
        }
      }, 20);
    };
    const stop = () => { clearInterval(ticker); ticker = null; };

    start();
    belt.addEventListener("mouseenter", stop);
    belt.addEventListener("mouseleave", start);

    // Lightbox
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const btnClose = document.getElementById("close");
    const btnPrev = document.getElementById("prev");
    const btnNext = document.getElementById("next");

    let current = 0;
    const total = originals.length;

    const openLightbox = (index) => {
      current = ((index % total) + total) % total;
      lightboxImg.src = originals[current].src;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
    };
    const closeLightbox = () => {
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
    };
    const showPrev = () => openLightbox(current - 1);
    const showNext = () => openLightbox(current + 1);

    // Event delegation: originals + clones clickable
    belt.addEventListener("click", (e) => {
      if (e.target && e.target.tagName === "IMG") {
        const idx = Number(e.target.dataset.index);
        if (!Number.isNaN(idx)) openLightbox(idx);
      }
    });

    btnClose.addEventListener("click", closeLightbox);
    btnPrev.addEventListener("click", showPrev);
    btnNext.addEventListener("click", showNext);

    // Close when clicking outside
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard support
    document.addEventListener("keydown", (e) => {
      if (lightbox.classList.contains("active")) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showPrev();
        if (e.key === "ArrowRight") showNext();
      }
    });

    // Swipe support (lightbox)
    let startX = 0;
    lightbox.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) dx > 0 ? showPrev() : showNext();
    }, { passive: true });
  }
});
