import 'dart:math' as math;

import 'package:flutter/material.dart';

/// 学生头像 —— 简化版「卡通男孩」绘制，用于占位还原原型氛围。
///
/// 后续可以把它替换为 `assets/images/avatar_zhang.png` 这类真实素材。
class CartoonBoyAvatar extends StatelessWidget {
  final double size;
  const CartoonBoyAvatar({super.key, this.size = 80});

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: CustomPaint(painter: _BoyPainter()),
    );
  }
}

class _BoyPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final cx = w / 2;
    final cy = h / 2;

    // 1. 背景圆 —— 浅蓝
    canvas.drawCircle(
      Offset(cx, cy),
      w / 2,
      Paint()..color = const Color(0xFFDDE9FF),
    );

    // Clip 后续元素到圆内，避免身体溢出。
    canvas.save();
    canvas.clipPath(Path()..addOval(Rect.fromLTWH(0, 0, w, h)));

    // 2. 身体 / 浅蓝衬衫 —— 从下方探出的椭圆
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(cx, h * 1.05),
        width: w * 1.15,
        height: h * 0.95,
      ),
      Paint()..color = const Color(0xFF9CC0FF),
    );

    // 3. 衣领（白色 V）
    final collar = Path()
      ..moveTo(cx - w * 0.16, h * 0.92)
      ..lineTo(cx, h * 0.78)
      ..lineTo(cx + w * 0.16, h * 0.92)
      ..close();
    canvas.drawPath(collar, Paint()..color = Colors.white);

    canvas.restore();

    // 4. 脸（肤色）
    final faceCenter = Offset(cx, h * 0.5);
    final faceRadius = w * 0.27;
    canvas.drawCircle(
      faceCenter,
      faceRadius,
      Paint()..color = const Color(0xFFFAD9B0),
    );

    // 5. 头发 —— 圆顶 + 前发
    final hairPaint = Paint()..color = const Color(0xFF1F2A55);

    // 圆顶（半圆覆盖头顶）
    canvas.drawArc(
      Rect.fromCenter(
        center: Offset(cx, h * 0.42),
        width: faceRadius * 2.05,
        height: faceRadius * 1.85,
      ),
      math.pi, // 从左侧
      math.pi, // 半圆
      true,
      hairPaint,
    );

    // 前发（小三角，让形象更可爱）
    final fringe = Path()
      ..moveTo(cx - w * 0.06, h * 0.42)
      ..lineTo(cx + w * 0.04, h * 0.45)
      ..lineTo(cx + w * 0.0, h * 0.51)
      ..close();
    canvas.drawPath(fringe, hairPaint);

    // 鬓角左
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(cx - w * 0.245, h * 0.5),
        width: w * 0.06,
        height: h * 0.12,
      ),
      hairPaint,
    );
    // 鬓角右
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(cx + w * 0.245, h * 0.5),
        width: w * 0.06,
        height: h * 0.12,
      ),
      hairPaint,
    );

    // 6. 眼睛（两个黑色椭圆）
    final eye = Paint()..color = const Color(0xFF1F2540);
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(cx - w * 0.1, h * 0.52),
        width: w * 0.05,
        height: h * 0.07,
      ),
      eye,
    );
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(cx + w * 0.1, h * 0.52),
        width: w * 0.05,
        height: h * 0.07,
      ),
      eye,
    );

    // 7. 嘴巴（小弧线）
    final smile = Paint()
      ..color = const Color(0xFF8C5A2E)
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.018
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCenter(
        center: Offset(cx, h * 0.6),
        width: w * 0.12,
        height: h * 0.07,
      ),
      0.25,
      math.pi - 0.5,
      false,
      smile,
    );
  }

  @override
  bool shouldRepaint(covariant _BoyPainter oldDelegate) => false;
}
