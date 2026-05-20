import 'dart:async';

import 'package:flutter/material.dart';

import '../../app/tokens.dart';

class BubuPressableState {
  final bool pressed;
  final bool enabled;

  const BubuPressableState({required this.pressed, required this.enabled});

  bool get active => enabled && pressed;
}

typedef BubuPressableBuilder =
    Widget Function(
      BuildContext context,
      BubuPressableState state,
      Widget child,
    );

/// Shared touch press motion for cards and compact controls.
class BubuPressable extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final BorderRadiusGeometry borderRadius;
  final double pressedScale;
  final double pressedOffset;
  final Duration duration;
  final Curve curve;
  final BubuPressableBuilder? builder;

  const BubuPressable({
    super.key,
    required this.child,
    this.onTap,
    this.onLongPress,
    this.borderRadius = const BorderRadius.all(Radius.circular(AppRadius.card)),
    this.pressedScale = 0.985,
    this.pressedOffset = 1.2,
    this.duration = AppMotion.press,
    this.curve = AppMotion.easeOut,
    this.builder,
  });

  @override
  State<BubuPressable> createState() => _BubuPressableState();
}

class _BubuPressableState extends State<BubuPressable> {
  bool _pressed = false;

  bool get _enabled => widget.onTap != null || widget.onLongPress != null;

  void _setPressed(bool value) {
    if (!_enabled || _pressed == value) return;
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final state = BubuPressableState(pressed: _pressed, enabled: _enabled);
    final scale = _enabled && _pressed ? widget.pressedScale : 1.0;
    final offset = _enabled && _pressed ? widget.pressedOffset : 0.0;
    final content =
        widget.builder?.call(context, state, widget.child) ?? widget.child;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: widget.onTap,
      onLongPress: widget.onLongPress,
      onTapDown: _enabled ? (_) => _setPressed(true) : null,
      onTapUp: _enabled ? (_) => _setPressed(false) : null,
      onTapCancel: _enabled ? () => _setPressed(false) : null,
      child: TweenAnimationBuilder<double>(
        tween: Tween<double>(end: offset),
        duration: widget.duration,
        curve: widget.curve,
        child: AnimatedScale(
          scale: scale,
          duration: widget.duration,
          curve: widget.curve,
          child: content,
        ),
        builder: (context, value, child) {
          return Transform.translate(offset: Offset(0, value), child: child);
        },
      ),
    );
  }
}

class BubuPageSwitcher extends StatelessWidget {
  final Object pageKey;
  final Widget child;
  final Duration duration;
  final Offset beginOffset;

  const BubuPageSwitcher({
    super.key,
    required this.pageKey,
    required this.child,
    this.duration = AppMotion.page,
    this.beginOffset = const Offset(0.018, 0),
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: duration,
      switchInCurve: AppMotion.easeOut,
      switchOutCurve: Curves.easeInCubic,
      transitionBuilder: (child, animation) {
        final slide = Tween<Offset>(
          begin: beginOffset,
          end: Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: AppMotion.easeOut));
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(position: slide, child: child),
        );
      },
      child: KeyedSubtree(key: ValueKey(pageKey), child: child),
    );
  }
}

class BubuEntrance extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Offset beginOffset;

  const BubuEntrance({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = AppMotion.page,
    this.beginOffset = const Offset(0, 0.035),
  });

  @override
  State<BubuEntrance> createState() => _BubuEntranceState();
}

class _BubuEntranceState extends State<BubuEntrance>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _opacity;
  late final Animation<Offset> _slide;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    final curved = CurvedAnimation(
      parent: _controller,
      curve: AppMotion.easeOut,
    );
    _opacity = curved;
    _slide = Tween<Offset>(
      begin: widget.beginOffset,
      end: Offset.zero,
    ).animate(curved);
    _timer = Timer(widget.delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(position: _slide, child: widget.child),
    );
  }
}

Route<T> bubuPageRoute<T>({
  required WidgetBuilder builder,
  RouteSettings? settings,
}) {
  return PageRouteBuilder<T>(
    settings: settings,
    transitionDuration: AppMotion.route,
    reverseTransitionDuration: AppMotion.normal,
    pageBuilder: (context, animation, secondaryAnimation) => builder(context),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: AppMotion.easeOut,
      );
      final slide = Tween<Offset>(
        begin: const Offset(0.035, 0),
        end: Offset.zero,
      ).animate(curved);
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(position: slide, child: child),
      );
    },
  );
}
