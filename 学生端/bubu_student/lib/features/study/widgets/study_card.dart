import 'package:flutter/material.dart';

import '../../../app/tokens.dart';
import '../../../core/widgets/motion.dart';

/// 学习主页的入口卡片组件。
///
/// 每张卡片含：左侧精美图标、右侧标题/副标题/最近记录、最右箭头。
/// 风格与甲方设计稿一致。
class StudyCard extends StatelessWidget {
  /// 图标区 Widget（优先使用，替代简单 IconData）
  final Widget? iconWidget;
  final IconData? icon;
  final Color iconColor;
  final Color iconBgColor;
  final String title;
  final String subtitle;
  final String? recentText;
  final Color recentColor;
  final VoidCallback? onTap;

  const StudyCard({
    super.key,
    this.iconWidget,
    this.icon,
    required this.iconColor,
    required this.iconBgColor,
    required this.title,
    required this.subtitle,
    this.recentText,
    this.recentColor = AppColors.brand,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return BubuPressable(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.card),
      pressedScale: 0.976,
      builder: (context, state, child) {
        return AnimatedContainer(
          duration: AppMotion.normal,
          curve: AppMotion.easeOut,
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(AppRadius.card),
            border: Border.all(
              color: state.active ? AppColors.borderStrong : AppColors.border,
            ),
            boxShadow: state.active ? AppShadows.lifted : AppShadows.card,
          ),
          child: child,
        );
      },
      child: Row(
        children: [
          // 图标区：优先使用自定义 Widget，否则用圆角方块 + Icon
          iconWidget ??
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(AppRadius.iconTile),
                ),
                child: Icon(icon ?? Icons.book, size: 36, color: iconColor),
              ),
          const SizedBox(width: AppSpacing.lg),
          // 文字区
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textTitle,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textMuted,
                  ),
                ),
                if (recentText != null) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: recentColor.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      recentText!,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: recentColor,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          // 箭头
          Icon(
            Icons.chevron_right_rounded,
            color: AppColors.textHint,
            size: 24,
          ),
        ],
      ),
    );
  }
}

// ============================
// 甲方设计稿风格的精美图标组件
// ============================

/// 电子课本图标：蓝色翻开的课本
class TextbookIcon extends StatelessWidget {
  const TextbookIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      height: 72,
      decoration: BoxDecoration(
        color: AppColors.subjectBlueBg,
        borderRadius: BorderRadius.circular(AppRadius.iconTile),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // 翻开的书本
          Icon(Icons.menu_book_rounded, size: 38, color: AppColors.subjectBlue),
          // 右上角小装饰标记
          Positioned(
            top: 10,
            right: 10,
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: AppColors.subjectBlue.withValues(alpha: 0.4),
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// 课堂笔记图标：紫色笔记本
class NotebookIcon extends StatelessWidget {
  const NotebookIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      height: 72,
      decoration: BoxDecoration(
        color: AppColors.subjectPurpleBg,
        borderRadius: BorderRadius.circular(AppRadius.iconTile),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            Icons.auto_stories_rounded,
            size: 38,
            color: AppColors.subjectPurple,
          ),
          Positioned(
            top: 10,
            right: 12,
            child: Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: AppColors.subjectPurple.withValues(alpha: 0.35),
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// 课件查看图标：橙色屏幕播放按钮
class CoursewareIcon extends StatelessWidget {
  const CoursewareIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      height: 72,
      decoration: BoxDecoration(
        color: AppColors.subjectOrangeBg,
        borderRadius: BorderRadius.circular(AppRadius.iconTile),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // 屏幕底座
          Positioned(
            bottom: 14,
            child: Container(
              width: 20,
              height: 3,
              decoration: BoxDecoration(
                color: AppColors.subjectOrange.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // 屏幕
          Container(
            width: 40,
            height: 30,
            decoration: BoxDecoration(
              color: AppColors.subjectOrange.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: AppColors.subjectOrange.withValues(alpha: 0.5),
                width: 2,
              ),
            ),
            child: Icon(
              Icons.play_arrow_rounded,
              size: 22,
              color: AppColors.subjectOrange,
            ),
          ),
        ],
      ),
    );
  }
}

/// 自主学习图标：绿色带书签的书
class SelfStudyIcon extends StatelessWidget {
  const SelfStudyIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      height: 72,
      decoration: BoxDecoration(
        color: AppColors.subjectGreenBg,
        borderRadius: BorderRadius.circular(AppRadius.iconTile),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            Icons.auto_stories_rounded,
            size: 36,
            color: AppColors.subjectGreen,
          ),
          // 书签装饰
          Positioned(
            top: 12,
            right: 18,
            child: Container(
              width: 8,
              height: 16,
              decoration: BoxDecoration(
                color: AppColors.subjectGreen,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(4),
                  bottomRight: Radius.circular(4),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
