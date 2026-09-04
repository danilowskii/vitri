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
