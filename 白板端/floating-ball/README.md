# 白板端悬浮组件

桌面主入口是 `desktop.html` + Electron 透明悬浮窗。圆形悬浮球和条形组件已经做成相互独立的模块，可以同屏运行，样式、事件、布局存储互不干扰。

条形组件入口是 `index.html` + `src/components/FloatingStrip.jsx`，支持替换功能、拖拽排序、折叠展开、触发回调、配置导出、整体拖动和整体缩放。

圆形悬浮球入口是 `demo.html`、`floating-ball.css`、`floating-ball.js`，支持功能点替换、功能点拖动换位、整体拖动、整体缩放、折叠展开和布局持久化。

## 直接桌面后台运行

双击：

```text
启动桌面版.cmd
```

这个脚本会通过 `后台启动桌面版.vbs` 隐藏启动，不会依赖浏览器窗口，也不会要求打开 Vite 开发服务。

或在当前目录执行：

```bash
npm run desktop
```

桌面版会先构建 `dist`，再打开透明、无边框、置顶的 Electron 桌面悬浮层，默认加载 `desktop.html`。窗口关闭时会隐藏到系统托盘，托盘菜单可以显示、隐藏、重新加载和退出。

## 调整位置和大小

- 条形组件：顶部小手柄拖动位置；点击顶部“调大小”图标进入大小调节模式，出现蓝色虚线边框后拖动边框缩放，再点一次退出。缩放使用整体比例，内部图标、文字、按钮会一起变大变小。
- 圆形悬浮球：拖动中心 `Ai` 球调整整体位置；点击底部工具条的“调大小”进入大小调节模式，出现蓝色虚线边框后拖动边框缩放，再点一次退出。
- 两者的布局分别写入不同的本地存储 key，互不覆盖。

## 条形组件接入

```jsx
import { useState } from 'react'
import { FloatingStrip, defaultFloatingActions } from './components/FloatingStrip.jsx'

function Page() {
  const [items, setItems] = useState(defaultFloatingActions)

  return (
    <FloatingStrip
      items={items}
      onItemsChange={setItems}
      onAction={(item) => console.log(item)}
      storageKey="my-floating-strip-layout"
    />
  )
}
```

`items` 数组决定功能、文字、图标和顺序。拖动条上的任意功能点会触发 `onItemsChange`，也可以直接替换某一项的 `label`、`icon`、`variant`。

## 运行

```bash
npm install
npm run dev
```

当前 Vite 默认端口是 `5174`。如果该端口被占用，Vite 会提示新的端口；也可以指定端口：

```bash
npm run dev -- --host 0.0.0.0 --port 5188 --strictPort
```

打开路径：

- 条形组件：`http://127.0.0.1:5174/`
- 同屏运行：`http://127.0.0.1:5174/same-screen.html`
- 桌面悬浮层调试页：`http://127.0.0.1:5174/desktop.html`
- 圆形悬浮球独立 demo：直接打开 `demo.html`，或用本地服务访问
