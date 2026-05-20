import 'package:flutter/material.dart';

import '../../../app/tokens.dart';
import '../../../core/widgets/motion.dart';
import '../../../data/mock_data.dart';

/// 主页 5 个快捷入口横向网格。
class HomeShortcutGrid extends StatelessWidget {
  final List<HomeShortcut> shortcuts;
  final void Function(HomeShortcut shortcut)? onTap;

  const HomeShortcutGrid({super.key, required this.shortcuts, this.onTap});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const gap = 14.0;
        final width =
            (constraints.maxWidth - gap * (shortcuts.length - 1)) /
            shortcuts.length;
        return Row(
          children: [
            for (var i = 0; i < shortcuts.length; i++) ...[
              if (i != 0) const SizedBox(width: gap),
              SizedBox(
                width: width,
                child: _ShortcutCard(
                  data: shortcuts[i],
                  onTap: onTap == null ? null : () => onTap!(shortcuts[i]),
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}

class _ShortcutCard extends StatelessWidget {
  final HomeShortcut data;
  final VoidCallback? onTap;
  const _ShortcutCard({required this.data, this.onTap});

  @override
  Widget build(BuildContext context) {
    return BubuPressable(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.card),
      pressedScale: 0.975,
      builder: (context, state, child) {
        return AnimatedContainer(
          duration: AppMotion.normal,
          curve: AppMotion.easeOut,
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 18),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // 与原型一致：图标直接绘制在白色卡面上（无方块底色）
          SizedBox(
            height: 64,
            child: Image.asset(
              data.iconAsset,
              fit: BoxFit.contain,
              alignment: Alignment.centerLeft,
              filterQuality: FilterQuality.high,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            data.title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textTitle,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            data.subtitle,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textMuted,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }
}
