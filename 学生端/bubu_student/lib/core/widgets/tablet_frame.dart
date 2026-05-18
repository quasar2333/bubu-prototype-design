import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../app/tokens.dart';

/// 「平板外框」—— 在 Web / Windows 桌面预览时把 App 渲染在 1024x768 横屏外框里，
/// 以便和原型图视觉对齐。
///
/// 在真实 Android 上（非 Web 且为移动端），直接全屏铺满 child。
class TabletFrame extends StatelessWidget {
  final Widget child;
  const TabletFrame({super.key, required this.child});

  bool get _shouldShowFrame {
    if (kIsWeb) return true;
    // 桌面平台预览也用外框
    return defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.macOS ||
        defaultTargetPlatform == TargetPlatform.linux;
  }

  @override
  Widget build(BuildContext context) {
    if (!_shouldShowFrame) {
      return child;
    }

    return Container(
      color: const Color(0xFFE8EBF2),
      alignment: Alignment.center,
      child: LayoutBuilder(
        builder: (context, constraints) {
          // 1024×768 是设计稿尺寸。
          // ⚠️ 重要：不要向上缩放（>1.0），否则 Flutter Web 会做位图放大 → 模糊。
          // 只在浏览器窗口比设计稿小的时候才缩小；窗口足够大时维持 1:1 像素锐利。
          const targetW = AppDeviceMetrics.designWidth;
          const targetH = AppDeviceMetrics.designHeight;
          const padding = 24.0;
          final availableW = constraints.maxWidth - padding * 2;
          final availableH = constraints.maxHeight - padding * 2;
          final fitScale = (availableW / targetW < availableH / targetH)
              ? availableW / targetW
              : availableH / targetH;
          final scale = fitScale.clamp(0.4, 1.0);

          // scale == 1.0 时跳过 Transform，避免任何不必要的图层。
          final shell = SizedBox(
            width: targetW,
            height: targetH,
            child: _DeviceShell(child: child),
          );
          if (scale >= 0.999) {
            return shell;
          }
          return Transform.scale(scale: scale, child: shell);
        },
      ),
    );
  }
}

class _DeviceShell extends StatelessWidget {
  final Widget child;
  const _DeviceShell({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1F2540),
        borderRadius:
            BorderRadius.circular(AppDeviceMetrics.bezelRadius + 6),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33000000),
            blurRadius: 30,
            offset: Offset(0, 14),
          ),
        ],
      ),
      padding: const EdgeInsets.all(8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppDeviceMetrics.bezelRadius),
        child: ColoredBox(
          color: AppColors.pageBg,
          child: child,
        ),
      ),
    );
  }
}
