# 步步学生端 · 平板 App 原型 (`bubu_student`)

> 按 `..\学生端原型图\*.png` 视觉复刻的 Flutter 学生端平板应用。
> 当前阶段：**S01 学生端主页** 已复刻。

## 快速开始

```powershell
# 1. 进入项目目录
cd bubu_student

# 2. 拉依赖
flutter pub get

# 3a. Web 预览（推荐用于视觉评审，无需 Android 环境）
flutter run -d web-server --web-port 8765
# 浏览器打开 http://127.0.0.1:8765

# 3b. Windows 桌面预览
flutter run -d windows

# 3c. Android 平板（连接平板/启动模拟器后）
flutter run -d <device-id>
```

> Web/Windows 端会自动套一个 1024×768 的「平板外框」以贴合设计稿；
> Android 真机/模拟器锁定横屏 (`sensorLandscape`)，全屏铺满。

## 目录结构

```bash
lib/
├── main.dart                       # 入口：锁横屏 + TabletFrame + AppShell
├── app/
│   ├── tokens.dart                 # 设计 tokens：颜色 / 间距 / 圆角 / 阴影
│   ├── theme.dart                  # Material 3 主题 + Noto Sans SC 字体回退
│   └── app_shell.dart              # 上「系统状态栏」+ 中 业务页 + 下 底部 Tab
├── core/widgets/
│   ├── tablet_frame.dart           # Web/桌面下的 1024×768 平板外框
│   ├── system_status_bar.dart      # 9:41 时间 + WiFi + 电量
│   ├── status_chip.dart            # 状态胶囊 / 提示徽章
│   ├── cartoon_avatar.dart         # 占位卡通学生头像（CustomPainter）
│   └── bottom_tab_bar.dart         # 底部 4 Tab
├── data/
│   └── mock_data.dart              # 学生 / 当前课程 / 快捷入口 Mock
└── features/home/                  # S01 学生端主页
    ├── home_page.dart
    └── widgets/
        ├── user_header.dart        # 头像+姓名+状态胶囊+课表按钮
        ├── current_class_card.dart # 当前课程大卡（含课前资料插画）
        └── shortcut_grid.dart      # 5 个快捷入口卡片

assets/
├── images/                         # 通用图片（后续放真实头像/插画）
└── images/textbook_covers/         # 教材封面（电子课本会用）
```

## 已完成

- [x] Flutter 项目初始化（Android / Web / Windows 三端）
- [x] 全局设计 tokens + Material 3 主题 + Noto Sans SC 字体加载
- [x] 横屏锁定（Android Manifest + `SystemChrome`）
- [x] 「平板外框」预览容器（自适应缩放）
- [x] 顶部系统状态栏 + 底部 4 Tab 应用骨架
- [x] **S01 学生端主页** 视觉复刻

## 待复刻（按原型目录）

- [ ] S02 电子课本（上课同步阅读 / 自由阅读）
- [ ] S04 课堂笔记（学科总览 / 上课自动编辑 / 数学课程归档）
- [ ] S06 课堂互动（听写 / 随堂练 / 讨论 / 实验）
- [ ] S07 作业（一级首页 / 列表 / 作答 / 提交 / 结果 / 订正 / 错题本）

## 设计 tokens 速查

| Token | 取值 |
| --- | --- |
| 主品牌蓝 `AppColors.brand` | `#2C6BFF` |
| 极浅蓝徽章底 `AppColors.brandTint` | `#F1F6FF` |
| 页面背景 `AppColors.pageBg` | `#F3F5F9` |
| 卡片描边 `AppColors.border` | `#E6EAF2` |
| 标题色 `AppColors.textTitle` | `#1F2540` |
| 卡片圆角 `AppRadius.card` | `20` |
| 大卡圆角 `AppRadius.heroCard` | `24` |
