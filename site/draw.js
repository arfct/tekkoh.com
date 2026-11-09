// Starts each ensō's brush: the mark at the top straight away, the larger
// ones when they come into view. The drawing itself is in style.css.
for (const el of document.querySelectorAll(".enso.draw:not(.on-view)")) el.classList.add("drawing");
const seen = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add("drawing");
    seen.unobserve(e.target);
  }
}, { threshold: 0.6 });
for (const el of document.querySelectorAll(".enso.draw.on-view")) seen.observe(el);
