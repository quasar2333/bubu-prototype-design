import 'package:flutter/material.dart';

import 'tokens.dart';

/// 全局 Material 3 主题。
ThemeData buildAppTheme() {
  // 字体回退链：Web 已通过 index.html 加载 Noto Sans SC；Android 系统字体
  // 自带 CJK；这里再补一条 fallback，确保任意端不会缺字。
  const fontFamily = 'Noto Sans SC';
  const fontFallback = <String>[
    'PingFang SC',
    'Microsoft YaHei',
    'Source Han Sans SC',
    'sans-serif',
  ];

  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppColors.pageBg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.brand,
      brightness: Brightness.light,
      surface: AppColors.cardBg,
    ),
    fontFamily: fontFamily,
    fontFamilyFallback: fontFallback,
    splashFactory: InkSparkle.splashFactory,
  );

  return base.copyWith(
    textTheme: base.textTheme
        .apply(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          bodyColor: AppColors.textBody,
          displayColor: AppColors.textTitle,
        )
        .copyWith(
          // 按 prototype 调整：标题深、正文中、提示弱。
          headlineLarge: const TextStyle(
            fontWeight: FontWeight.w700,
            color: AppColors.textTitle,
            height: 1.2,
            letterSpacing: 0,
          ),
          headlineMedium: const TextStyle(
            fontWeight: FontWeight.w700,
            color: AppColors.textTitle,
            height: 1.2,
          ),
          titleLarge: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.textTitle,
            height: 1.25,
          ),
          titleMedium: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: AppColors.textTitle,
            height: 1.3,
          ),
          bodyLarge: const TextStyle(
            fontSize: 15,
            color: AppColors.textBody,
            height: 1.4,
          ),
          bodyMedium: const TextStyle(
            fontSize: 14,
            color: AppColors.textBody,
            height: 1.4,
          ),
          bodySmall: const TextStyle(
            fontSize: 12,
            color: AppColors.textMuted,
            height: 1.3,
          ),
          labelLarge: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
    iconTheme: const IconThemeData(color: AppColors.textBody, size: 20),
    dividerTheme: const DividerThemeData(
      color: AppColors.border,
      thickness: 1,
      space: 1,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: AppColors.cardBg,
      surfaceTintColor: Colors.transparent,
      shadowColor: const Color(0x14000000),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.card),
        side: const BorderSide(color: AppColors.border),
      ),
      margin: EdgeInsets.zero,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        textStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.button),
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.brand,
        side: const BorderSide(color: AppColors.brand, width: 1.2),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        textStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.button),
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.brand,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      ),
    ),
  );
}
