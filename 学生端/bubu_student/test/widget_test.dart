import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:bubu_student/main.dart';

void main() {
  testWidgets('home page renders student name and current class info',
      (WidgetTester tester) async {
    // 给一个足够大的「平板」窗口，避免主页内容被压缩到布局错乱
    tester.view.physicalSize = const Size(1024 * 2, 768 * 2);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const BubuStudentApp());
    await tester.pump();

    // 主页关键元素都应该显示
    expect(find.text('张子涵'), findsOneWidget);
    expect(find.text('五年级（3）班'), findsOneWidget);
    expect(find.text('当前课程'), findsOneWidget);
    expect(find.text('8.2 一元一次不等式'), findsOneWidget);
    expect(find.text('电子课本'), findsOneWidget);
    expect(find.text('错题本'), findsOneWidget);
  });
}
