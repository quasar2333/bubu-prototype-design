import 'package:flutter/material.dart';

import '../core/widgets/bottom_tab_bar.dart';
import '../core/widgets/system_status_bar.dart';
import '../data/mock_data.dart';
import '../features/home/home_page.dart';
import 'tokens.dart';

/// 学生端整体壳：上 系统状态栏 + 中 业务页面 + 下 底部 Tab。
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const HomePage(),
      const _ComingSoonPage(label: '学习'),
      const _ComingSoonPage(label: '作业'),
      const _ComingSoonPage(label: '我的'),
    ];

    return Material(
      color: AppColors.pageBg,
      child: SafeArea(
        top: false,
        bottom: false,
        child: Column(
          children: [
            const SystemStatusBar(
              time: MockData.statusTime,
              date: MockData.statusDate,
            ),
            Expanded(child: pages[_index]),
            BubuBottomTabBar(
              currentIndex: _index,
              onTap: (i) => setState(() => _index = i),
            ),
          ],
        ),
      ),
    );
  }
}

class _ComingSoonPage extends StatelessWidget {
  final String label;
  const _ComingSoonPage({required this.label});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.construction_outlined,
              size: 56, color: AppColors.textHint),
          const SizedBox(height: 16),
          Text(
            '$label · 待复刻',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.textBody,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            '请先确认主页效果，再决定继续复刻其它页面',
            style: TextStyle(fontSize: 13, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}
