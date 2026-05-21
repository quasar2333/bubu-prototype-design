import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';

import 'app/app_shell.dart';
import 'app/theme.dart';
import 'core/widgets/tablet_frame.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // 启用触控重采样：将高频触摸事件对齐到帧时序，消除平板拖拽起步抖动
  GestureBinding.instance.resamplingEnabled = true;
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
