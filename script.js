// Floating pearl field: lightweight canvas animation with subtle parallax.
(() => {
  const canvas = document.getElementById("pearls");
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0, height = 0, dpr = 1, pearls = [], pointer = { x: -1000, y: -1000 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(72, Math.max(24, Math.floor((width * height) / 23000)));
    pearls = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * 2.3 + 0.6,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(Math.random() * 0.28 + 0.06),
      alpha: Math.random() * 0.42 + 0.12,
      phase: Math.random() * Math.PI * 2,
      shine: Math.random() * 0.8 + 0.2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const now = performance.now() / 1000;
    for (const p of pearls) {
      if (!reducedMotion) {
        p.x += p.vx; p.y += p.vy;
        p.phase += 0.012;
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100 && distance > 0) {
          p.x += (dx / distance) * 0.35;
          p.y += (dy / distance) * 0.35;
        }
      }
      if (p.y < -12) { p.y = height + 12; p.x = Math.random() * width; }
      if (p.x < -12) p.x = width + 12;
      if (p.x > width + 12) p.x = -12;

      const pulse = 0.78 + Math.sin(now * 1.2 + p.phase) * 0.18;
      const radius = p.r * (1 + Math.sin(now + p.phase) * 0.08);
      const glow = ctx.createRadialGradient(p.x - radius * .35, p.y - radius * .4, 0, p.x, p.y, radius * 4.5);
      glow.addColorStop(0, `rgba(248,250,255,${p.alpha * pulse})`);
      glow.addColorStop(.22, `rgba(198,205,216,${p.alpha * .55 * pulse})`);
      glow.addColorStop(1, "rgba(150,158,170,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius * 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(239,242,247,${p.alpha * p.shine * pulse})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${p.alpha * .35})`;
      ctx.lineWidth = .5;
      ctx.beginPath(); ctx.arc(p.x - radius * .18, p.y - radius * .18, radius * .68, Math.PI * 1.05, Math.PI * 1.8); ctx.stroke();
    }
    if (!reducedMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
  window.addEventListener("pointerleave", () => { pointer.x = -1000; pointer.y = -1000; });
  resize(); draw();
})();

// Mobile navigation.
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Reveal sections as they enter the viewport.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// Contact actions.
const toast = document.getElementById("toast");
let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
}
document.getElementById("copyEmail").addEventListener("click", async (event) => {
  const email = event.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    showToast("Email copied. Replace the sample address before publishing.");
  } catch {
    showToast("Sample email: " + email);
  }
});
document.getElementById("year").textContent = new Date().getFullYear();
