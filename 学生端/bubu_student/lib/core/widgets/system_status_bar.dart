import 'package:flutter/material.dart';

import '../../app/tokens.dart';

/// 顶部「系统状态栏」 —— 模拟平板自带的状态栏。
///
/// 左侧：时间 + 日期
/// 右侧：WiFi + 电量
class SystemStatusBar extends StatelessWidget {
  final String time;
  final String date;
  final int batteryPercent;

  const SystemStatusBar({
    super.key,
    required this.time,
    required this.date,
    this.batteryPercent = 100,
  });

  @override
  Widget build(BuildContext context) {
    const textStyle = TextStyle(
      fontSize: 13,
      fontWeight: FontWeight.w500,
      color: AppColors.textTitle,
      height: 1,
    );
    return SizedBox(
      height: 28,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(time, style: textStyle),
            const SizedBox(width: 8),
            Text(date, style: textStyle),
            const Spacer(),
            const Icon(Icons.wifi_rounded, size: 16, color: AppColors.textTitle),
            const SizedBox(width: 6),
            Text('$batteryPercent%', style: textStyle),
            const SizedBox(width: 4),
            const _BatteryGlyph(),
          ],
        ),
      ),
    );
  }
}

class _BatteryGlyph extends StatelessWidget {
  const _BatteryGlyph();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 24,
      height: 12,
      child: CustomPaint(painter: _BatteryPainter()),
    );
  }
}

class _BatteryPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final body = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width - 2, size.height),
      const Radius.circular(3),
    );
    final stroke = Paint()
      ..color = AppColors.textTitle
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    canvas.drawRRect(body, stroke);

    // tip
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width - 2, size.height * 0.25, 2,
            size.height * 0.5),
        const Radius.circular(1),
      ),
      Paint()..color = AppColors.textTitle,
    );

    // fill
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(1.5, 1.5, size.width - 5, size.height - 3),
        const Radius.circular(2),
      ),
      Paint()..color = AppColors.textTitle,
    );
  }

  @override
  bool shouldRepaint(covariant _BatteryPainter oldDelegate) => false;
}
