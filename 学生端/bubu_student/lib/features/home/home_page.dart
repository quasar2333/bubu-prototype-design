import 'package:flutter/material.dart';

import '../../app/tokens.dart';
import '../../data/mock_data.dart';
import '../textbook/textbook_shelf_page.dart';
import 'widgets/current_class_card.dart';
import 'widgets/shortcut_grid.dart';
import 'widgets/user_header.dart';

/// S01 学生端主页。
///
/// 与 `学生端原型图/S01_学生端主页.png` 完全对齐：
///   - 顶部用户信息 + 状态胶囊 + 课表
///   - 当前课程大卡（左信息 + 右插画/查看课前资料）
///   - 5 个快捷入口（电子课本 / 课堂笔记 / 作业 / 错题本 / 课件查看）
///
/// 布局策略：用 `spaceBetween` 把三段内容均匀分布到可用高度，避免
/// 出现底部大块空白。
class HomePage extends StatelessWidget {
  final VoidCallback? onTextbookTap;
  final VoidCallback? onCoursewareTap;

  const HomePage({
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
          AppSpacing.page,
          AppSpacing.lg,
          AppSpacing.page,
          AppSpacing.lg,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const HomeUserHeader(student: MockData.student),
            CurrentClassCard(
              info: MockData.currentClass,
              onViewMaterials: onCoursewareTap,
            ),
            HomeShortcutGrid(
              shortcuts: MockData.shortcuts,
              onTap: (shortcut) {
                if (shortcut.title == '电子课本') {
                  if (onTextbookTap != null) {
                    onTextbookTap!();
                  } else {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const TextbookShelfPage(),
                      ),
                    );
                  }
                } else if (shortcut.title == '课件查看') {
                  onCoursewareTap?.call();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${shortcut.title} 功能即将上线'),
                      duration: const Duration(seconds: 1),
                    ),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
