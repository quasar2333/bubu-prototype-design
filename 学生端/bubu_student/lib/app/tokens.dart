import 'package:flutter/material.dart';

/// 全局设计 tokens —— 颜色、间距、圆角、阴影。
///
/// 命名/取值参考 `学生端原型图/S01_学生端主页.png` 与同目录其它原型图。
/// 改动颜色或间距请优先在此文件修改，所有页面会同步生效。
class AppColors {
  AppColors._();

  /// 主品牌蓝：用于「当前课程」标题、强调按钮、底部 Tab 选中。
  static const brand = Color(0xFF2C6BFF);

  /// 次级蓝：图标、连接成功、链接文字。
  static const brandSoft = Color(0xFF4F86FF);

  /// 浅蓝色「软底」：电子课本图标背景、按钮 hover 态、输入框背景。
  static const brandSurface = Color(0xFFE8EFFF);

  /// 极浅蓝：当前课程卡内的提示徽章背景。
  static const brandTint = Color(0xFFF1F6FF);

  /// 页面背景：温和的冷灰偏蓝。
  static const pageBg = Color(0xFFF3F5F9);

  /// 顶部 / 底部固定栏背景。
  static const chromeBg = Color(0xFFF7F8FB);

  /// 卡片白底。
  static const cardBg = Color(0xFFFFFFFF);

  /// 卡片描边、分隔线。
  static const border = Color(0xFFE6EAF2);
  static const borderStrong = Color(0xFFD7DDEA);

  /// 文本：标题/正文/弱化/占位。
  static const textTitle = Color(0xFF1F2540);
  static const textBody = Color(0xFF3D4561);
  static const textMuted = Color(0xFF7A8499);
  static const textHint = Color(0xFFA7AFC2);

  /// 状态色。
  static const success = Color(0xFF22C36C);
  static const warning = Color(0xFFFFA53B);
  static const danger = Color(0xFFF1593E);

  // 学科 / 入口配色（与 prototype 5 个快捷入口一致）。
  static const subjectBlue = Color(0xFF2C6BFF); // 数学/电子课本
  static const subjectBlueBg = Color(0xFFE8EFFF);

  static const subjectPurple = Color(0xFF8B5CF6); // 课堂笔记
  static const subjectPurpleBg = Color(0xFFF1ECFF);

  static const subjectGreen = Color(0xFF22C36C); // 作业
  static const subjectGreenBg = Color(0xFFE3F8EE);

  static const subjectRed = Color(0xFFF1593E); // 错题本
  static const subjectRedBg = Color(0xFFFFE8E2);

  static const subjectOrange = Color(0xFFF59E2C); // 课件查看
  static const subjectOrangeBg = Color(0xFFFFF1DB);
}

class AppRadius {
  AppRadius._();

  /// 卡片圆角。
  static const card = 20.0;

  /// 大卡圆角（当前课程主卡）。
  static const heroCard = 24.0;

  /// 圆角徽章 / chip。
  static const chip = 12.0;

  /// 按钮圆角。
  static const button = 12.0;

  /// 内嵌图标方块圆角（电子课本等入口图标背景块）。
  static const iconTile = 16.0;
}

class AppSpacing {
  AppSpacing._();

  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 20.0;
  static const xxl = 24.0;
  static const page = 28.0;
}

class AppShadows {
  AppShadows._();

  /// 卡片轻阴影 —— 与原型一致的极淡冷灰。
  static const card = <BoxShadow>[
    BoxShadow(color: Color(0x0D1F2540), blurRadius: 18, offset: Offset(0, 6)),
    BoxShadow(color: Color(0x08FFFFFF), blurRadius: 2, offset: Offset(0, -1)),
  ];

  /// 浮动 / 强调阴影。
  static const float = <BoxShadow>[
    BoxShadow(color: Color(0x141F2540), blurRadius: 24, offset: Offset(0, 10)),
  ];

  /// 重点卡片的轻微抬升阴影。
  static const lifted = <BoxShadow>[
    BoxShadow(color: Color(0x181F2540), blurRadius: 28, offset: Offset(0, 12)),
    BoxShadow(color: Color(0x0A1F2540), blurRadius: 8, offset: Offset(0, 3)),
  ];

  /// 胶囊和小按钮的细腻浮层阴影。
  static const control = <BoxShadow>[
    BoxShadow(color: Color(0x0F1F2540), blurRadius: 14, offset: Offset(0, 5)),
  ];
}

class AppMotion {
  AppMotion._();

  static const press = Duration(milliseconds: 92);
  static const fast = Duration(milliseconds: 140);
  static const normal = Duration(milliseconds: 260);
  static const page = Duration(milliseconds: 460);
  static const route = Duration(milliseconds: 420);
  static const stagger = Duration(milliseconds: 56);

  static const pageCurve = Curves.easeOutCubic;
  static const easeOut = Curves.easeOutCubic;
  static const easeInOut = Curves.easeInOutCubic;
}

/// 平板设计稿基准尺寸：1024 × 768（横屏）。
/// 用于 Web/Windows 预览时构造一个固定大小的「平板外框」。
class AppDeviceMetrics {
  AppDeviceMetrics._();

  static const designWidth = 1024.0;
  static const designHeight = 768.0;

  /// 设备外框圆角（平板边框模拟）。
  static const bezelRadius = 36.0;
}
