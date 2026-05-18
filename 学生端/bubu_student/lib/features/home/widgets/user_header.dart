import 'package:flutter/material.dart';

import '../../../app/tokens.dart';
import '../../../core/widgets/status_chip.dart';
import '../../../data/mock_data.dart';

/// 主页顶部区域：头像 + 姓名班级 + 三段状态胶囊 + 课表按钮。
class HomeUserHeader extends StatelessWidget {
  final StudentProfile student;
  final VoidCallback? onTimetableTap;

  const HomeUserHeader({
    super.key,
    required this.student,
    this.onTimetableTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox.square(
          dimension: 92,
          child: Image.asset(
            student.avatarAsset,
            fit: BoxFit.contain,
            filterQuality: FilterQuality.high,
          ),
        ),
        const SizedBox(width: AppSpacing.lg),
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              student.name,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: AppColors.textTitle,
                height: 1.15,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              student.klass,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textMuted,
                height: 1.2,
              ),
            ),
          ],
        ),
        const Spacer(),
        const StatusGroupChip(
          items: [
            StatusItem(
              icon: Icons.tablet_mac_rounded,
              label: '平板已连接',
              iconColor: AppColors.brand,
            ),
            StatusItem(
              icon: Icons.wifi_rounded,
              label: '网络良好',
              iconColor: AppColors.success,
            ),
            StatusItem(
              icon: Icons.cloud_done_outlined,
              label: '云同步完成',
              iconColor: AppColors.brandSoft,
            ),
          ],
        ),
        const SizedBox(width: AppSpacing.md),
        _TimetableButton(onTap: onTimetableTap),
      ],
    );
  }
}

class _TimetableButton extends StatelessWidget {
  final VoidCallback? onTap;
  const _TimetableButton({this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.button + 2),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(AppRadius.button + 2),
          border: Border.all(color: AppColors.brand, width: 1.4),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.calendar_today_rounded,
                size: 18, color: AppColors.brand),
            SizedBox(width: 6),
            Text(
              '课表',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.brand,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
