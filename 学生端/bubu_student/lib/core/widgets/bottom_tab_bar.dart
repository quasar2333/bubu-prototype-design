import 'package:flutter/material.dart';

import '../../app/tokens.dart';
import 'motion.dart';

/// 底部 Tab 数据。
class AppTabItem {
  final String label;
  final IconData icon;
  final IconData iconActive;
  const AppTabItem({
    required this.label,
    required this.icon,
    required this.iconActive,
  });
}

const kAppTabs = <AppTabItem>[
  AppTabItem(
    label: '首页',
    icon: Icons.home_outlined,
    iconActive: Icons.home_rounded,
  ),
  AppTabItem(
    label: '学习',
    icon: Icons.menu_book_outlined,
    iconActive: Icons.menu_book_rounded,
  ),
  AppTabItem(
    label: '作业',
    icon: Icons.assignment_outlined,
    iconActive: Icons.assignment_rounded,
  ),
  AppTabItem(
    label: '我的',
    icon: Icons.person_outline_rounded,
    iconActive: Icons.person_rounded,
  ),
];

/// 平板底部 Tab Bar（与原型一致：白底、4 等分、当前项蓝色）。
class BubuBottomTabBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  const BubuBottomTabBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: Row(
        children: [
          for (var i = 0; i < kAppTabs.length; i++)
            Expanded(
              child: _TabSlot(
                item: kAppTabs[i],
                active: i == currentIndex,
                onTap: () => onTap(i),
              ),
            ),
        ],
      ),
    );
  }
}

class _TabSlot extends StatelessWidget {
  final AppTabItem item;
  final bool active;
  final VoidCallback onTap;
  const _TabSlot({
    required this.item,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.brand : AppColors.textHint;
    return BubuPressable(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      pressedScale: 0.965,
      builder: (context, state, child) {
        return Center(
          child: AnimatedContainer(
            duration: AppMotion.normal,
            curve: AppMotion.easeOut,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
            decoration: BoxDecoration(
              color: active
                  ? AppColors.brandSurface.withValues(alpha: 0.64)
                  : state.active
                  ? AppColors.pageBg
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(18),
            ),
            child: child,
          ),
        );
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedSwitcher(
            duration: AppMotion.fast,
            switchInCurve: AppMotion.easeOut,
            switchOutCurve: Curves.easeInCubic,
            transitionBuilder: (child, animation) {
              return FadeTransition(
                opacity: animation,
                child: ScaleTransition(scale: animation, child: child),
              );
            },
            child: Icon(
              active ? item.iconActive : item.icon,
              key: ValueKey(active),
              size: 22,
              color: color,
            ),
          ),
          const SizedBox(width: 8),
          AnimatedDefaultTextStyle(
            duration: AppMotion.fast,
            curve: AppMotion.easeOut,
            style: TextStyle(
              fontSize: 15,
              fontWeight: active ? FontWeight.w600 : FontWeight.w500,
              color: color,
            ),
            child: Text(item.label),
          ),
        ],
      ),
    );
  }
}
