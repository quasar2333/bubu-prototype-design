import 'package:flutter/material.dart';

import '../../app/tokens.dart';

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
        border: Border(
          top: BorderSide(color: AppColors.border, width: 1),
        ),
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
    return InkWell(
      onTap: onTap,
      child: Center(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(active ? item.iconActive : item.icon, size: 22, color: color),
            const SizedBox(width: 8),
            Text(
              item.label,
              style: TextStyle(
                fontSize: 15,
                fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
