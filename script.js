function openModal() {
  document.getElementById("modal").classList.add("show");
}
function closeModal() {
  document.getElementById("modal").classList.remove("show");
}
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((x) => x.classList.remove("active"));
    btn.classList.add("active");
  });
});
document.getElementById("leadForm").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("formMsg").style.display = "block";
  e.target.querySelector("button").textContent = "Diagnóstico solicitado ✓";
});

// Reveal Animations
document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale",
  );

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
});

/* =========================================================
   HERO — VIDEO SCRUB ON SCROLL
   ========================================================= */

(() => {
  const section = document.getElementById("hero-scroll");
  const hero = section?.querySelector(".hero-sticky");
  const video = document.getElementById("hero-video");
  const { gsap, ScrollTrigger } = window;
  if (!section || !hero || !video || !gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  function initHeroVideo() {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    video.pause();
    video.currentTime = 0;
    const playhead = { progress: 0 };
    const videoTween = gsap.to(playhead, {
      progress: 1,
      ease: "none",
      paused: true,
      onUpdate: () => {
        if (!video.duration) return;
        video.currentTime = playhead.progress * video.duration;
      },
    });
    ScrollTrigger.create({
      trigger: section,
      pin: hero,
      start: "top 76px",
      end: "+=4000",
      scrub: true,
      animation: videoTween,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    });
    video.pause();
    video.currentTime = 0;
    ScrollTrigger.refresh();
  }
  if (video.readyState >= 1) {
    initHeroVideo();
  } else {
    video.addEventListener("loadedmetadata", initHeroVideo, { once: true });
  }
})();
