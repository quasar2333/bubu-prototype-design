# Stage 8 PPTist Demo 验证记录

## 结论

本阶段采用「PPTist 画布/数据结构思路 + React 原型重写」作为可验收路线，不直接把 PPTist Vue 子应用嵌入当前 React 页面。

> 注意：外部审议提示 PPTist 仓库许可证可能不是前期资料写的 MIT，而是 AGPL-3.0。未完成正式许可证复核前，本项目不得复制或直接集成 PPTist 源码，只能参考交互模型和数据结构思路。

## 验证范围

- 导入：前端允许 Office / PDF / 视频进入导入流程，后端真实转换暂以 Mock 任务表示。
- 编辑：课件页抽象为 `slides[]`，每页包含基础内容与可拖拽 `layers[]`。
- 互动：互动卡片落为 `interaction` layer，绑定随堂练、抽人回答、典型答案展示三类配置。
- 预览：当前页可在编辑器内打开播放预览。
- 保存/上传：保存为本地草稿，并通过 Mock 上传提示保留后端接口。

## 暂不直接嵌入 PPTist 的原因

- PPTist 是 Vue 技术栈，当前教师端是 React + Vite + Electron；直接嵌入会引入子应用生命周期、样式隔离和打包复杂度。
- Stage 8 只要求 MVP 的 5 个工具和 3 个互动组件，不需要模板库、动画面板、完整属性面板。
- 现有 React 编辑器已具备 slide/layer/drag/config/preview 的最小闭环，适合按 T04 高保真继续收敛。

## 后续可替换边界

- `slides[]` 可迁移为 PPTist 风格页面 JSON。
- `layers[]` 可映射到 PPTist element schema。
- 导入转换服务成熟后，可把 Mock 导入任务替换为真实 `POST /api/courseware/import` 和轮询状态。
