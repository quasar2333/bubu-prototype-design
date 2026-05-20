import 'package:flutter/material.dart';

import '../../app/tokens.dart';

/// 单个状态项（图标 + 文字），用在「平板已连接 / 网络良好 / 云同步完成」这类灰底白色胶囊里。
class StatusItem {
  final IconData icon;
  final String label;
  final Color iconColor;
  const StatusItem({
    required this.icon,
    required this.label,
    this.iconColor = AppColors.brand,
  });
}

/// 三段式状态胶囊：白底 + 浅灰描边 + 中间用细分隔线。
class StatusGroupChip extends StatelessWidget {
  final List<StatusItem> items;
  final EdgeInsets padding;
  const StatusGroupChip({
    super.key,
    required this.items,
    this.padding = const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
  });

  @override
  Widget build(BuildContext context) {
    final children = <Widget>[];
    for (var i = 0; i < items.length; i++) {
      children.add(_buildItem(items[i]));
      if (i != items.length - 1) {
        children.add(const _Divider());
      }
    }
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(AppRadius.chip + 2),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.control,
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: children),
    );
  }

  Widget _buildItem(StatusItem item) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(item.icon, size: 18, color: item.iconColor),
        const SizedBox(width: 6),
        Text(
          item.label,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: AppColors.textBody,
          ),
        ),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 16,
      margin: const EdgeInsets.symmetric(horizontal: 14),
      color: AppColors.border,
    );
  }
}

/// 课前提示徽章 —— 当前课程卡内浅蓝底圆角小标签。
class HintBadge extends StatelessWidget {
  final IconData icon;
  final String text;
  const HintBadge({super.key, required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.brandTint,
        borderRadius: BorderRadius.circular(AppRadius.chip - 2),
        border: Border.all(color: const Color(0xFFDDE7FF)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x082C6BFF),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.brandSoft),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textBody,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
