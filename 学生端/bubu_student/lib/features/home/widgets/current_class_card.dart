import 'package:flutter/material.dart';

import '../../../app/tokens.dart';
import '../../../core/widgets/motion.dart';
import '../../../core/widgets/status_chip.dart';
import '../../../data/mock_data.dart';

/// 主页「当前课程」大卡片。
class CurrentClassCard extends StatelessWidget {
  final CurrentClassInfo info;
  final VoidCallback? onViewMaterials;

  const CurrentClassCard({super.key, required this.info, this.onViewMaterials});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.white, Color(0xFFFBFDFF)],
        ),
        borderRadius: BorderRadius.circular(AppRadius.heroCard),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.lifted,
      ),
      padding: const EdgeInsets.fromLTRB(28, 24, 28, 28),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(child: _LeftSide(info: info)),
          const SizedBox(width: 20),
          _RightSide(
            illustrationAsset: info.illustrationAsset,
            onView: onViewMaterials,
          ),
        ],
      ),
    );
  }
}

class _LeftSide extends StatelessWidget {
  final CurrentClassInfo info;
  const _LeftSide({required this.info});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: AppColors.brandSurface,
                borderRadius: BorderRadius.circular(7),
              ),
              child: const Icon(
                Icons.access_time_rounded,
                size: 16,
                color: AppColors.brand,
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              '当前课程',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.textTitle,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        // 「距离课堂开始还有 12 分钟」 —— 数字蓝色高亮。
        RichText(
          text: TextSpan(
            style: const TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.w800,
              color: AppColors.textTitle,
              height: 1.15,
            ),
            children: [
              const TextSpan(text: '距离课堂开始还有 '),
              TextSpan(
                text: '${info.minutesUntilStart}',
                style: const TextStyle(
                  fontSize: 36,
                  color: AppColors.brand,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const TextSpan(text: ' 分钟'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(
          info.periodLabel,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textMuted,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          info.chapterTitle,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.textTitle,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            const Icon(
              Icons.person_outline,
              size: 16,
              color: AppColors.textMuted,
            ),
            const SizedBox(width: 4),
            Text(
              '${info.teacherName} · ${info.subject}',
              style: const TextStyle(
                fontSize: 13.5,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        Wrap(
          spacing: 10,
          runSpacing: 8,
          children: [
            HintBadge(
              icon: Icons.lock_outline_rounded,
              text: info.tips.isNotEmpty ? info.tips[0] : '',
            ),
            if (info.tips.length > 1)
              HintBadge(icon: Icons.menu_book_rounded, text: info.tips[1]),
          ],
        ),
      ],
    );
  }
}

class _RightSide extends StatelessWidget {
  final String illustrationAsset;
  final VoidCallback? onView;
  const _RightSide({required this.illustrationAsset, this.onView});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 280,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // 「文件 + 时钟」插画 —— 直接用原型切图
          SizedBox(
            width: 260,
            height: 175,
            child: _FloatingIllustration(asset: illustrationAsset),
          ),
          const SizedBox(height: 12),
          _ViewButton(onTap: onView),
        ],
      ),
    );
  }
}

class _ViewButton extends StatelessWidget {
  final VoidCallback? onTap;
  const _ViewButton({this.onTap});

  @override
  Widget build(BuildContext context) {
    return BubuPressable(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.button + 4),
      pressedScale: 0.975,
      builder: (context, state, child) {
        return AnimatedContainer(
          duration: AppMotion.fast,
          curve: AppMotion.easeOut,
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          decoration: BoxDecoration(
            color: state.active ? const Color(0xFFE0EAFF) : AppColors.brandTint,
            borderRadius: BorderRadius.circular(AppRadius.button + 4),
            border: Border.all(
              color: state.active
                  ? const Color(0xFFC9DAFF)
                  : const Color(0xFFD8E4FF),
            ),
            boxShadow: state.active ? AppShadows.control : null,
          ),
          child: child,
        );
      },
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '查看课前资料',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.brand,
            ),
          ),
          SizedBox(width: 8),
          Icon(
            Icons.arrow_forward_ios_rounded,
            size: 14,
            color: AppColors.brand,
          ),
        ],
      ),
    );
  }
}

class _FloatingIllustration extends StatefulWidget {
  final String asset;
  const _FloatingIllustration({required this.asset});

  @override
  State<_FloatingIllustration> createState() => _FloatingIllustrationState();
}

class _FloatingIllustrationState extends State<_FloatingIllustration>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _float;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3200),
    )..repeat(reverse: true);
    _float = CurvedAnimation(parent: _controller, curve: AppMotion.easeInOut);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _float,
      builder: (context, child) {
        final dy = -4 * _float.value;
        return Transform.translate(
          offset: Offset(0, dy),
          child: Transform.scale(scale: 1 + _float.value * 0.01, child: child),
        );
      },
      child: Image.asset(
        widget.asset,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.high,
      ),
    );
  }
}
