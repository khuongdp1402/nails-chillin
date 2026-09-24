export function scrollToTarget(
  el: HTMLElement | null,
  opts: { extraOffset?: number } = {},
): void {
  if (!el) return;
  const header = document.querySelector<HTMLElement>('.site-header');
  const headerHeight = header ? header.getBoundingClientRect().height : 72;
  const top =
    el.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    12 -
    (opts.extraOffset ?? 0);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
}
