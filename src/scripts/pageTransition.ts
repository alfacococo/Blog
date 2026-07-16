/**
 * 点击链接切页时，让当前页面先平滑滚回顶部，再交给 View Transition 做淡出/淡入。
 *
 * 这里要处理一个不太直观的细节：ClientRouter 在 `astro:before-preparation` 触发之后、
 * DOM 真正替换之前，还会再取一次 window.scrollY 写进 history.state，
 * 用来在用户之后点"后退"时把这一页恢复到当时的滚动位置。如果什么都不做，
 * 我们自己触发的"滚动到顶部"动画很可能会跟这次二次采样撞在一起（动画还没跑完，
 * 采样就已经发生），导致后退回这一页时错误地停在动画中途的某个位置，
 * 而不是用户离开前的原始位置。所以在 `astro:before-swap`（此时二次采样已经发生，
 * 但这一页的 history 记录还没被替换成新页面）这个时机，把 history.state 里的滚动位置
 * 强制纠正回离开前记下的真实值。
 */
export function initPageTransitionScroll(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scrollBeforeLeave: { x: number; y: number } | null = null;

  document.addEventListener('astro:before-preparation', () => {
    scrollBeforeLeave = { x: window.scrollX, y: window.scrollY };
    if (!prefersReducedMotion) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  });

  document.addEventListener('astro:before-swap', () => {
    if (scrollBeforeLeave && history.state) {
      history.replaceState(
        { ...history.state, scrollX: scrollBeforeLeave.x, scrollY: scrollBeforeLeave.y },
        '',
      );
    }
    scrollBeforeLeave = null;
  });
}
