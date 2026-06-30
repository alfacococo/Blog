---
title: '如何在博客里插入嘟文动态'
author: Curly Sheep
date: '2026-06-30'
tags: ["博客教程"]
description: "之所以能取得这样的科研成果，首先要感谢我的克老师……"
---

<p class='foreword my-3'>塔塔说想看于是就写了！但一来这个功能基本上就是克老师写的，我只负责提需求和改报错/设计；二来我其实不太擅长教人或者说明……唉我尽力吧！大家如果看着头晕的话可以再在星屑或者评论区戳我，或者扔给AI问问。</p>

<div class="divider mb-3 mx-auto"></div>

不太清楚大家的博客代码都是长什么样的，不过应该大差不差……？下面会直接贴出我首页正在用的代码（因为只做了misskey的，所以大部分命名都会以misskey来，长毛象版本是让克老师另外写我再测试过的），大家可以参照说明直接搬回去再改一改！

博客行宽限制，代码在博客页面上显示不完全，会需要滑动才能浏览，所以一部分比较普泛的说明文字我会放到博文正文，比较具体的我会用注释补充，方便大家复制到自己的代码编辑器时也能看。

### Misskey版本

#### HTML

* `class`和`id`都是选择器，`class`主要用在下文的css样式控制上，`id`的话主要是js代码用，主要是用来识别并往里填充嘟文动态和对应的嘟文链接。
* 如果想沿用我这个结构的话，“最近在咩……”这部分是左上角的说明文字，可以任意替换成自己想显示的文字，或者不想显示的话可以直接删掉这一整行`span`标签，不影响使用。
* `a`标签里面的`href`是嘟文动态获取前/获取失败时，点击对应文字（此处是`@bipolar@stelpolva.moe ↗`）会跳转前往的链接，可以改成自己的毛象或者missskey主页网址。`@bipolar@stelpolva.moe ↗`是链接显示的文字，也可以自定义。`target="_blank"`的意思是点击跳转时切换新的标签页。如果想换成当前标签页内跳转的话，可以改成`target="_self"`。
* 这里的`p`标签将显示抓取到的嘟文动态，抓取前的话会显示`加载中……`。也可以改成自己喜欢的文字。

```html
<div class="misskey-note" id="misskey-note">
  <div class="misskey-note-header">
    <span class="misskey-note-label">最近在咩……</span>
    <a
      class="misskey-note-link"
      id="misskey-note-link"
      href="https://stelpolva.moe/@bipolar"
      target="_blank"
    >
      @bipolar@stelpolva.moe ↗
    </a>
  </div>
  <p class="misskey-note-text" id="misskey-note-text">加载中……</p>
</div>
```

#### CSS

* 下面的这部分代码将会控制嘟文的卡片显示。其中像是`.misskey-note`的意思是，控制html的class名为misskey-note 部分的显示效果。
* border控制的是框线，后面几个代码的意思是：1px代表边框粗细为1像素，solid意为实线（可以改成dotted之类的点线），最后一个代表的是颜色。因为我博客代码设置了日间/夜间模式切换，所以var(--border)是我在其他地方定义的颜色变量，后面的逗号#ddd的意思是找不到变量的话可以退而求其次用这个颜色。不过大家可以直接设置成自己想要的颜色，用常用的十六进制hex就可以（诸如#000000这种）。

```css
  .misskey-note {
    border: 1px solid var(--border, #ddd);
    border-radius: 10px; // 卡片四周的圆角，后面的数值越大角越圆润，想要方角可以删掉这行
    padding: 1rem 1.25rem; // 卡片内余白，两个数值分别是上下余白/左右余白
    margin: 1.5rem 0; // 卡片外余白，两个数值分别是上下余白/左右余白
    background-color: var(--background);  // 背景颜色，可改为16进制（如#000000）
  }

  .misskey-note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem; // 卡片头部下方的余白
    font-size: 0.85rem; // 字体大小，可改用px为单位进行设置
  }

  .misskey-note-label {
    font-style: italic; // 左上角文字显示为斜体，不需要的话可以删掉
  }

  .misskey-note-link {
    text-decoration: none; // 去掉标签链接自带的格式
    color: inherit;
  }

  .misskey-note-link:hover {
    text-decoration: underline; // 鼠标移动到上方时显示下划线，不需要的可以删掉
  }

  .misskey-note-text {
    margin: 0;
    line-height: 1.7; // 行间距，数值越大越宽
    font-size: 0.95rem;
    justify-content: space-between; // 两端对齐
  }
```

#### JS

* 其实下面都是克老师写给我的！要写这篇教程的时候我才开始研究代码，去找了[misskey的API文档](https://misskey.io/api-doc#description/introduction)，感觉应该可以开发很多玩法！大家有空也可以去看看。

```javascript
<script>
  async function loadMisskeyNote() {
    // 对应html里面id为"misskey-note-text"的元素，即卡片部分
    const textEl = document.getElementById("misskey-note-text");
    // 对应html里面id为"misskey-note-link"的元素，即链接部分
    const linkEl = document.getElementById("misskey-note-link");
    // 如果这俩有谁不存在的话就返回，不再执行以下代码
    if (!textEl || !linkEl) return;

    try {
      // 第一步：用用户名查 userId, 其中stelpolva.moe 是 Misskey 实例域名，bipolar 是 Misskey 用户名
      const userRes = await fetch("https://stelpolva.moe/api/users/show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "bipolar" }),
      });
      const user = await userRes.json();

      // 第二步：拉取最近 30 条嘟文（只拿有文字内容的普通嘟文，不含转嘟），其他misskey站点用户请把下面星屑域名stelpolva.moe换成对应站点
      const notesRes = await fetch("https://stelpolva.moe/api/users/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          limit: 30, // 拉取嘟文数上限
          withRenotes: false, // 不包含转嘟
          withReplies: false, // 不包含回复
        }),
      });
      const notes = await notesRes.json();

      // 第三步：过滤掉没有文字内容的嘟文（比如纯图片嘟文）
      const textNotes = notes.filter(
        (note: any) => note.text && note.text.trim().length > 0,
      );

      // 如果没有抓到嘟文或者嘟文数量为零的时候，显示下方文字。
      if (!textNotes.length) {
        textEl.textContent = "暂时没有可以显示的嘟文。";
        return;
      }

      // 随机抽取一条嘟文
      const randomNote =
        textNotes[Math.floor(Math.random() * textNotes.length)];

      // 让html显示该条随机嘟文的文字
      textEl.textContent = randomNote.text;

      // 更新链接，指向这条具体的嘟文
      linkEl.href = `https://stelpolva.moe/notes/${randomNote.id}`;
    } catch (err) {
      if (textEl) textEl.textContent = "嘟文加载失败，请稍后再试。";
      console.error("Misskey note fetch error:", err);
    }
  }

  loadMisskeyNote();
  document.addEventListener("astro:page-load", loadMisskeyNote);
</script>
```

### Mastodon版本

* 长毛象版本的逻辑根Misskey版的大差不差，我用自己的小卖部账号跑了一下，确实能够抓取到，就直接省略说明贴上各个部分的代码了，大家用的时候把用户名和实例名改一下就好。

#### HTML

```html
<div class="mastodon-note" id="mastodon-note">
  <div class="mastodon-note-header">
    <span class="mastodon-note-label">最近在嘟……</span>
    <a
      class="mastodon-note-link"
      id="mastodon-note-link"
      href="#"
      target="_blank"
    >
      @bipolar@moresci.sale ↗
    </a>
  </div>
  <p class="mastodon-note-text" id="mastodon-note-text">加载中……</p>
</div>
```

#### CSS

```css
<style>
  .mastodon-note {
    border: 1px solid var(--border, #ddd);
    border-radius: 10px;
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
    background-color: var(--background);
  }
  .mastodon-note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
    font-size: 0.85rem;
    opacity: 0.6;
  }
  .mastodon-note-text {
    margin: 0;
    line-height: 1.7;
    font-size: 0.95rem;
    white-space: pre-wrap;
  }
  .mastodon-note-link {
    text-decoration: none;
    color: inherit;
  }
  .mastodon-note-link:hover {
    text-decoration: underline;
  }
</style>
```

#### JS部分

```javascript
<script>
  async function loadMastodonNote() {
    const textEl = document.getElementById("mastodon-note-text");
    const linkEl = document.getElementById("mastodon-note-link");

    // 配置信息
    const INSTANCE = "https://moresci.sale"; // Mastodon 实例地址
    const USERNAME = "bipolar"; // 这里直接填写用户名

    if (!textEl || !linkEl) return;

    try {
      // 第一步：通过 lookup 接口获取用户的 ID
      const lookupRes = await fetch(
        `${INSTANCE}/api/v1/accounts/lookup?acct=${USERNAME}`,
      );
      if (!lookupRes.ok) throw new Error("无法找到用户");
      const user = await lookupRes.json();
      const userId = user.id;

      // 第二步：使用获取到的 userId 拉取最近嘟文
      const notesRes = await fetch(
        `${INSTANCE}/api/v1/accounts/${userId}/statuses?limit=30&exclude_replies=true&exclude_reblogs=true`,
      );
      const notes = await notesRes.json();

      // 第三步：过滤掉纯媒体或空文本（Mastodon 的 content 包含 HTML）
      const textNotes = notes.filter((n) => {
        const plainText = n.content.replace(/<[^>]+>/g, "").trim();
        return plainText.length > 0;
      });

      if (!textNotes.length) {
        textEl.textContent = "暂时没有可以显示的嘟文。";
        return;
      }

      // 随机获取一条
      const randomNote =
        textNotes[Math.floor(Math.random() * textNotes.length)];

      // 渲染文本（清理 HTML 标签）
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = randomNote.content;
      textEl.textContent = tempDiv.textContent || tempDiv.innerText;

      // 更新跳转链接
      linkEl.href = randomNote.url;
    } catch (err) {
      if (textEl) textEl.textContent = "嘟文加载失败，请检查用户是否存在。";
      console.error("Mastodon fetch error:", err);
    }
  }

  // 初始化调用
  loadMastodonNote();
</script>
```

<div class="divider my-3 mx-auto"></div>
<p class='foreword'>唔大概就是这样！！看不懂的随时再来问卷毛羊！！！祝大家装修愉快嘿嘿嘿</p>
