/**
 * 统一处理"组件脚本要跟着 Astro 的 SPA 导航（ClientRouter）重新初始化"这件事。
 *
 * 背景：启用 <ClientRouter /> 之后，页面切换不再是整页刷新，而是局部替换 DOM。
 * 本来写在组件 <script> 顶层、只会执行一次的初始化代码，不会跟着每次切页重新跑。
 * `astro:page-load` 这个事件会在首次加载、以及之后每一次导航完成后都触发，
 * 用它来重新触发初始化逻辑即可解决这个问题。
 *
 * @param fn 每次导航完成后要执行的初始化函数
 * @param options.once
 *   - false（默认）：适用于每次导航都会被 Astro 全新渲染出来的内容
 *     （比如点赞按钮、目录、文章内的图片/代码块）——每次导航都要完整重新初始化一遍，
 *     重新查询 DOM、重新绑定事件。
 *   - true：适用于放在 `transition:persist` 元素内部、跨导航不会被销毁重建的节点
 *     （比如放在 <nav transition:persist> 里的搜索按钮、主题切换按钮）——
 *     只需要在真正意义上的"第一次"（包含首次加载）执行一次，
 *     不然会在同一个持久化节点上反复叠加事件监听器。
 *
 * 用法：
 * ```ts
 * function initFoo() { ... }
 * onNavigate(initFoo);                 // 每次导航都重新初始化
 * onNavigate(initBar, { once: true }); // 只在真正的第一次初始化，之后导航不再重复绑定
 * ```
 *
 * 注意：不需要在调用 onNavigate 之外再手动调用一次 fn()——
 * `astro:page-load` 本身就会在首次加载时触发一次，重复调用反而会导致首次加载时执行两次。
 */
export function onNavigate(fn: () => void, options: { once?: boolean } = {}): void {
  document.addEventListener('astro:page-load', fn, { once: options.once ?? false });
}
