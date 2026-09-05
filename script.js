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
  const videoWrapper = document.getElementById("hero-video-wrapper");

  const { gsap, ScrollTrigger } = window;

  if (!section || !hero || !video || !videoWrapper || !gsap || !ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  function initHeroVideo() {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    video.pause();
    video.currentTime = 0;

    const mm = gsap.matchMedia();

    /*
    ========================================
    DESKTOP
    mantém exatamente a lógica atual
    ========================================
    */
    mm.add("(min-width: 768px)", () => {
      const playhead = {
        progress: 0,
      };

      const videoTween = gsap.to(playhead, {
        progress: 1,
        ease: "none",
        paused: true,

        onUpdate: () => {
          if (!video.duration) return;

          video.currentTime = playhead.progress * video.duration;
        },
      });

      const trigger = ScrollTrigger.create({
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

      return () => {
        trigger.kill();
        videoTween.kill();
      };
    });

    /*
    ========================================
    MOBILE
    vídeo chega no topo
    fica preso
    scroll começa a controlar o vídeo
    ========================================
    */
    mm.add("(max-width: 767px)", () => {
      const playhead = {
        progress: 0,
      };

      const videoTween = gsap.to(playhead, {
        progress: 1,

        ease: "none",

        paused: true,

        onUpdate: () => {
          if (!video.duration) return;

          video.currentTime = playhead.progress * video.duration;
        },
      });

      const trigger = ScrollTrigger.create({
        /*
        O próprio vídeo é quem ativa
        o ScrollTrigger
        */
        trigger: videoWrapper,

        /*
        No mobile somente o vídeo
        fica preso
        */
        pin: videoWrapper,

        /*
        Começa quando o topo do vídeo
        encosta no topo da viewport
        */
        start: "top top",

        /*
        Distância de scroll usada para
        percorrer o vídeo
        */
        end: "+=2500",

        scrub: true,

        animation: videoTween,

        invalidateOnRefresh: true,

        anticipatePin: 1,

        /*
        Mantém espaço no documento
        enquanto o vídeo está pinned
        */
        pinSpacing: true,

        onEnter: () => {
          video.pause();
        },

        onEnterBack: () => {
          video.pause();
        },
      });

      video.pause();
      video.currentTime = 0;

      return () => {
        trigger.kill();
        videoTween.kill();
      };
    });

    ScrollTrigger.refresh();
  }

  if (video.readyState >= 1) {
    initHeroVideo();
  } else {
    video.addEventListener("loadedmetadata", initHeroVideo, {
      once: true,
    });
  }
})();
