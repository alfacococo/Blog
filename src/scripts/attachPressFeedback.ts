/**
 * 给匹配 selector 的元素统一绑定"按压视觉反馈"：
 * pointerdown 时加上 pressedClass，pointerup/pointerleave/pointercancel 时移除。
 * 常用于卡片、标签这类需要"按下去有反馈"的可点击元素。
 *
 * @param selector 要绑定的元素的 CSS 选择器
 * @param pressedClass 按下时添加的 class 名，默认 'is-pressed'
 */
export function attachPressFeedback(selector: string, pressedClass = 'is-pressed'): void {
  document.querySelectorAll(selector).forEach((el) => {
    const press = () => el.classList.add(pressedClass);
    const release = () => el.classList.remove(pressedClass);

    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointercancel', release);
  });
}
