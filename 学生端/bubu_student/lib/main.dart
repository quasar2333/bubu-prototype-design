import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app/app_shell.dart';
import 'app/theme.dart';
import 'core/widgets/tablet_frame.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // 锁定横屏（与 Android Manifest 双重保险，覆盖 hot reload / Web 场景）。
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  runApp(const BubuStudentApp());
}

class BubuStudentApp extends StatelessWidget {
  const BubuStudentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '步步学生端',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: const TabletFrame(child: AppShell()),
    );
  }
}
