import 'package:flutter/material.dart';

import '../../app/tokens.dart';
import '../../core/widgets/status_chip.dart';
import '../../data/mock_data.dart';
import 'widgets/study_card.dart';

/// S02 学习 Tab 主页。
///
/// 1:1 复刻 `S02_学习主页.png`：
///   - 复用 HomeUserHeader 风格的顶部用户信息
///   - 大标题「学习」+ 副标题
///   - 2×2 卡片入口网格：电子课本 / 课堂笔记 / 课件查看 / 自主学习
class StudyPage extends StatelessWidget {
  final VoidCallback? onTextbookTap;
  final VoidCallback? onCoursewareTap;

  const StudyPage({
    super.key,
    this.onTextbookTap,
    this.onCoursewareTap,
  });

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.pageBg,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.page, AppSpacing.lg, AppSpacing.page, AppSpacing.lg,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // — 顶部用户信息（与首页复用风格）—
            _buildUserHeader(),
            const SizedBox(height: AppSpacing.xxl),
            // — 大标题 —
            const Text(
              '学习',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w800,
                color: AppColors.textTitle,
                height: 1.15,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              '课本、笔记、课件和自主学习',
              style: TextStyle(
                fontSize: 15,
                color: AppColors.textMuted,
                height: 1.3,
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
            // — 2×2 卡片网格 —
            Expanded(child: _buildCardGrid()),
          ],
        ),
      ),
    );
  }

  Widget _buildUserHeader() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox.square(
          dimension: 72,
          child: Image.asset(
            MockData.student.avatarAsset,
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
              MockData.student.name,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.textTitle,
                height: 1.15,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              MockData.student.klass,
              style: const TextStyle(
                fontSize: 13,
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
        _buildTimetableButton(),
      ],
    );
  }

  Widget _buildTimetableButton() {
    return InkWell(
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

  Widget _buildCardGrid() {
    return GridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: AppSpacing.lg,
      crossAxisSpacing: AppSpacing.lg,
      childAspectRatio: 2.1,
      children: [
        StudyCard(
          iconWidget: const TextbookIcon(),
          iconColor: AppColors.subjectBlue,
          iconBgColor: AppColors.subjectBlueBg,
          title: '电子课本',
          subtitle: '查看教材，阅读与标注',
          recentText: '最近阅读：数学  第45页',
          recentColor: AppColors.subjectBlue,
          onTap: onTextbookTap,
        ),
        const StudyCard(
          iconWidget: NotebookIcon(),
          iconColor: AppColors.subjectPurple,
          iconBgColor: AppColors.subjectPurpleBg,
          title: '课堂笔记',
          subtitle: '查看课堂记录和学科笔记',
          recentText: '最近笔记：8.2 一元一次不等式',
          recentColor: AppColors.subjectPurple,
        ),
        StudyCard(
          iconWidget: const CoursewareIcon(),
          iconColor: AppColors.subjectOrange,
          iconBgColor: AppColors.subjectOrangeBg,
          title: '课件查看',
          subtitle: '回看老师同步的课堂课件',
          recentText: '最近课件：数学  第1课时',
          recentColor: AppColors.subjectOrange,
          onTap: onCoursewareTap,
        ),
        const StudyCard(
          iconWidget: SelfStudyIcon(),
          iconColor: AppColors.subjectGreen,
          iconBgColor: AppColors.subjectGreenBg,
          title: '自主学习',
          subtitle: '按学科预习、复习和自测',
          recentText: '推荐：数学基础巩固',
          recentColor: AppColors.subjectGreen,
        ),
      ],
    );
  }
}
