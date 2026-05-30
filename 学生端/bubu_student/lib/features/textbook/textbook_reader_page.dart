import 'dart:math';
import 'package:flutter/gestures.dart';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:turnable_page/turnable_page.dart';

import '../../app/tokens.dart';
import '../../core/widgets/status_chip.dart';
import 'models/textbook_resource.dart';

/// S02 电子课本阅读器页（3级页面）。
///
/// 1:1 复刻 `S02_电子课本_上课电子书阅读_v2.png`：
///   - 横屏锁定
///   - 顶部状态栏
///   - 双页显示区域
///   - 右侧悬浮球菜单
///   - 底部缩略图预览条
class TextbookReaderPage extends StatefulWidget {
  final TextbookResource textbook;
  final Color subjectColor;

  const TextbookReaderPage({
    super.key,
    required this.textbook,
    this.subjectColor = const Color(0xFF2C6BFF),
  });

  @override
  State<TextbookReaderPage> createState() => _TextbookReaderPageState();
}

class _TextbookReaderPageState extends State<TextbookReaderPage>
    with TickerProviderStateMixin {
  int _currentPageIndex = 0;
  bool _singlePageMode = false;
  bool _fabExpanded = false;
  String? _fabSubmenu;
  bool _thumbnailExpanded = false;
  final ScrollController _thumbnailScrollController = ScrollController();
  final PageFlipController _flipController = PageFlipController();
  final GlobalKey _singlePageKey = GlobalKey();

  // -- 缩放相关 --
  final TransformationController _zoomController = TransformationController();
  double _currentZoom = 1.0;
  final Map<int, Offset> _activeTouchPositions = {};

  // — 悬浮球拖动位置 —
  Offset _fabPosition = const Offset(-1, -1); // -1 表示未初始化
  bool _fabDragging = false;

  // — 涂鸦相关 —
  bool _drawingMode = false;
  bool _eraserMode = false;
  Color _penColor = const Color(0xFF2C6BFF);
  double _penWidth = 3.0;
  final Map<int, List<_DrawStroke>> _strokes = {};
  List<_StrokePoint> _currentPoints = [];
  int? _activeDrawPage;
  int? _activePenPointer;
  int? _lastEditedPage;
  // 撤销/重做栈（按页）
  final Map<int, List<_DrawStroke>> _undoStack = {};
  static final Map<String, Map<int, List<_DrawStroke>>> _savedStrokesByBook =
      {};

  static const List<Color> _colorOptions = [
    Color(0xFF2C6BFF),
    Color(0xFFE54D42),
    Color(0xFF23C06B),
    Color(0xFFF5943A),
    Color(0xFF9D5AF5),
  ];
  static const List<double> _widthOptions = [2.0, 4.0, 8.0];
  static const double _fabButtonSize = 64.0;
  static const double _fabOuterRingRadius = 130.0;
  static const double _fabTotalSize = _fabOuterRingRadius * 2 + 20;
  static const double _fabDockInset = (_fabTotalSize - _fabButtonSize) / 2;
  static const double _singlePageAspectRatio = 1274 / 1800;

  late final AnimationController _fabAnimController;
  late final Animation<double> _fabExpandAnimation;

  bool get _annotationMode => _drawingMode || _eraserMode;

  int get _totalPages => widget.textbook.pageCount;

  bool get _shouldAbsorbPageInput =>
      _annotationMode ||
      _currentZoom > 1.01 ||
      _activeTouchPositions.length > 1;

  @override
  void initState() {
    super.initState();
    // 锁定横屏
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

    _fabAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _fabExpandAnimation = CurvedAnimation(
      parent: _fabAnimController,
      curve: Curves.easeOutBack,
    );
    final savedStrokes = _savedStrokesByBook[_annotationKey];
    if (savedStrokes != null) {
      _strokes.addAll(_cloneStrokeMap(savedStrokes));
    }
  }

  @override
  void dispose() {
    _fabAnimController.dispose();
    _thumbnailScrollController.dispose();
    _zoomController.dispose();
    // 恢复方向
    SystemChrome.setPreferredOrientations(DeviceOrientation.values);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _precachePagesAround(_currentPageIndex);
  }

  String get _annotationKey => widget.textbook.id;

  String _pageAssetPath(int pageNum) {
    return widget.textbook.pageAssets[pageNum];
  }

  Map<int, List<_DrawStroke>> _cloneStrokeMap(
    Map<int, List<_DrawStroke>> source,
  ) {
    return source.map((page, strokes) => MapEntry(page, List.of(strokes)));
  }

  void _saveStrokes() {
    _savedStrokesByBook[_annotationKey] = _cloneStrokeMap(_strokes);
  }

  void _precachePagesAround(int pageIndex) {
    if (!mounted) return;
    for (final page in <int>[
      pageIndex - 2,
      pageIndex - 1,
      pageIndex,
      pageIndex + 1,
      pageIndex + 2,
      pageIndex + 3,
    ]) {
      if (page >= 0 && page < _totalPages) {
        precacheImage(AssetImage(_pageAssetPath(page)), context);
      }
    }
  }

  bool _isTouchEvent(PointerEvent event) =>
      event.kind == PointerDeviceKind.touch;

  bool _isNativePenEvent(PointerEvent event) {
    if (event.kind == PointerDeviceKind.stylus ||
        event.kind == PointerDeviceKind.invertedStylus ||
        event.kind == PointerDeviceKind.mouse ||
        event.kind == PointerDeviceKind.unknown) {
      return true;
    }
    if (event.kind != PointerDeviceKind.touch || !_annotationMode) return false;

    final stylusButtons = kPrimaryStylusButton | kSecondaryStylusButton;
    return (event.buttons & stylusButtons) != 0 || event.pressureMax > 1.0;
  }

  bool _shouldUsePointerForInk(PointerDownEvent event) {
    if (!_annotationMode) return false;
    return _isNativePenEvent(event);
  }

  double _pressureFromEvent(PointerEvent event) {
    final pressure = event.pressure;
    if (pressure.isNaN || pressure <= 0) return 1.0;
    final maxPressure = event.pressureMax;
    final normalized = maxPressure.isFinite && maxPressure > 1.0
        ? pressure / maxPressure
        : pressure;
    return normalized.clamp(0.12, 1.0).toDouble();
  }

  _PageHit? _pageHitFromGlobal(Offset globalPosition) {
    if (_singlePageMode) {
      return _singlePageHitFromGlobal(globalPosition);
    }
    final hit = _flipController.hitTestVisiblePage(globalPosition);
    if (hit == null) return null;
    const pageInset = 4.0;
    final pageSize = Size(
      max(1.0, hit.pageSize.width - pageInset * 2),
      max(1.0, hit.pageSize.height - pageInset * 2),
    );
    return _PageHit(
      pageNum: hit.pageIndex,
      localPosition: Offset(
        (hit.localPosition.dx - pageInset)
            .clamp(0.0, pageSize.width)
            .toDouble(),
        (hit.localPosition.dy - pageInset)
            .clamp(0.0, pageSize.height)
            .toDouble(),
      ),
      pageSize: pageSize,
    );
  }

  _PageHit? _singlePageHitFromGlobal(Offset globalPosition) {
    if (_totalPages <= 0) return null;
    final context = _singlePageKey.currentContext;
    if (context == null) return null;
    final render = context.findRenderObject();
    if (render is! RenderBox || !render.hasSize) return null;
    final local = render.globalToLocal(globalPosition);
    if (local.dx < 0 ||
        local.dy < 0 ||
        local.dx > render.size.width ||
        local.dy > render.size.height) {
      return null;
    }

    const pageInset = 4.0;
    final pageSize = Size(
      max(1.0, render.size.width - pageInset * 2),
      max(1.0, render.size.height - pageInset * 2),
    );
    return _PageHit(
      pageNum: _currentPageIndex.clamp(0, _totalPages - 1).toInt(),
      localPosition: Offset(
        (local.dx - pageInset).clamp(0.0, pageSize.width).toDouble(),
        (local.dy - pageInset).clamp(0.0, pageSize.height).toDouble(),
      ),
      pageSize: pageSize,
    );
  }

  _StrokePoint _strokePointFromHit(_PageHit hit, PointerEvent event) {
    return _StrokePoint(
      (hit.localPosition.dx / hit.pageSize.width).clamp(0.0, 1.0).toDouble(),
      (hit.localPosition.dy / hit.pageSize.height).clamp(0.0, 1.0).toDouble(),
      pressure: _pressureFromEvent(event),
    );
  }

  void _storeCurrentStroke() {
    if (_currentPoints.isEmpty || _activeDrawPage == null) return;
    final page = _activeDrawPage!;
    final pageStrokes = _strokes[page] ?? [];
    pageStrokes.add(
      _DrawStroke(
        points: List.of(_currentPoints),
        color: _penColor,
        width: _penWidth,
      ),
    );
    _strokes[page] = pageStrokes;
    _lastEditedPage = page;
    _undoStack[page]?.clear();
  }

  void _finishCurrentStroke() {
    if (_currentPoints.isEmpty || _activeDrawPage == null) {
      _currentPoints = [];
      _activeDrawPage = null;
      return;
    }
    setState(() {
      _storeCurrentStroke();
      _currentPoints = [];
      _activeDrawPage = null;
    });
    _saveStrokes();
  }

  Offset _currentPanOffset() {
    final matrix = _zoomController.value;
    return Offset(matrix.storage[12], matrix.storage[13]);
  }

  Offset _clampPanOffset(Offset offset, double scale, Size viewportSize) {
    if (scale <= 1.0) return Offset.zero;
    final maxX = viewportSize.width * (scale - 1);
    final maxY = viewportSize.height * (scale - 1);
    return Offset(
      offset.dx.clamp(-maxX, 0.0).toDouble(),
      offset.dy.clamp(-maxY, 0.0).toDouble(),
    );
  }

  void _setViewerTransform(double scale, Offset offset, Size viewportSize) {
    final nextScale = scale.clamp(1.0, 3.0).toDouble();
    final nextOffset = _clampPanOffset(offset, nextScale, viewportSize);
    _currentZoom = nextScale;
    _zoomController.value = Matrix4.identity()
      ..translateByDouble(nextOffset.dx, nextOffset.dy, 0, 1)
      ..scaleByDouble(nextScale, nextScale, 1, 1);
  }

  void _settleViewerTransform(Size viewportSize) {
    setState(() {
      if (_currentZoom < 1.02) {
        _setViewerTransform(1.0, Offset.zero, viewportSize);
      } else {
        _setViewerTransform(_currentZoom, _currentPanOffset(), viewportSize);
      }
    });
  }

  Offset _clampFabPosition(Offset position, Size layoutSize) {
    final halfButton = _fabButtonSize / 2;
    final maxX = max(halfButton, layoutSize.width - halfButton);
    final maxY = max(halfButton, layoutSize.height - halfButton);
    return Offset(
      position.dx.clamp(halfButton, maxX).toDouble(),
      position.dy.clamp(halfButton, maxY).toDouble(),
    );
  }

  void _handleTouchDown(PointerDownEvent event) {
    setState(() {
      _activeTouchPositions[event.pointer] = event.localPosition;
    });
  }

  void _handleTouchMove(PointerMoveEvent event, Size viewportSize) {
    if (!_activeTouchPositions.containsKey(event.pointer)) return;
    final previous = Map<int, Offset>.of(_activeTouchPositions);
    setState(() {
      _activeTouchPositions[event.pointer] = event.localPosition;
      if (_annotationMode) {
        _applyTouchTransform(previous, _activeTouchPositions, viewportSize);
      }
    });
  }

  void _handleTouchEnd(PointerEvent event, Size viewportSize) {
    if (!_activeTouchPositions.containsKey(event.pointer)) return;
    setState(() {
      _activeTouchPositions.remove(event.pointer);
      if (_annotationMode) {
        _setViewerTransform(_currentZoom, _currentPanOffset(), viewportSize);
      }
    });
  }

  void _applyTouchTransform(
    Map<int, Offset> previous,
    Map<int, Offset> current,
    Size viewportSize,
  ) {
    if (current.isEmpty) return;
    if (current.length == 1) {
      final id = current.keys.first;
      final oldPosition = previous[id];
      if (oldPosition == null || _currentZoom <= 1.0) return;
      final delta = current[id]! - oldPosition;
      _setViewerTransform(
        _currentZoom,
        _currentPanOffset() + delta,
        viewportSize,
      );
      return;
    }

    final ids = current.keys.take(2).toList();
    final oldA = previous[ids[0]] ?? current[ids[0]]!;
    final oldB = previous[ids[1]] ?? current[ids[1]]!;
    final newA = current[ids[0]]!;
    final newB = current[ids[1]]!;
    final oldDistance = (oldA - oldB).distance;
    final newDistance = (newA - newB).distance;
    if (oldDistance < 1 || newDistance < 1) return;

    final oldFocal = Offset.lerp(oldA, oldB, 0.5)!;
    final newFocal = Offset.lerp(newA, newB, 0.5)!;
    final oldScale = _currentZoom;
    final nextScale = (oldScale * (newDistance / oldDistance))
        .clamp(1.0, 3.0)
        .toDouble();
    final oldOffset = _currentPanOffset();
    final sceneFocal = (oldFocal - oldOffset) / oldScale;
    final nextOffset = newFocal - sceneFocal * nextScale;
    _setViewerTransform(nextScale, nextOffset, viewportSize);
  }

  void _handleReaderPointerDown(PointerDownEvent event, Size viewportSize) {
    if (_shouldUsePointerForInk(event)) {
      if (_activePenPointer != null && _activePenPointer != event.pointer) {
        return;
      }
      final hit = _pageHitFromGlobal(event.position);
      if (hit == null) return;
      final point = _strokePointFromHit(hit, event);
      _activePenPointer = event.pointer;
      if (_eraserMode) {
        _eraseAtPoint(hit.pageNum, point, hit.pageSize);
        return;
      }
      setState(() {
        _activeDrawPage = hit.pageNum;
        _currentPoints = [point];
      });
      return;
    }
    if (_isTouchEvent(event)) {
      _handleTouchDown(event);
    }
  }

  void _handleReaderPointerMove(PointerMoveEvent event, Size viewportSize) {
    if (!_annotationMode || _activePenPointer != event.pointer) {
      if (_isTouchEvent(event)) {
        _handleTouchMove(event, viewportSize);
      }
      return;
    }
    final hit = _pageHitFromGlobal(event.position);
    if (hit == null) return;
    final point = _strokePointFromHit(hit, event);
    if (_eraserMode) {
      _eraseAtPoint(hit.pageNum, point, hit.pageSize);
      return;
    }
    if (_activeDrawPage != null && _activeDrawPage != hit.pageNum) {
      setState(() {
        _storeCurrentStroke();
        _activeDrawPage = hit.pageNum;
        _currentPoints = [point];
      });
      _saveStrokes();
      return;
    }
    setState(() {
      _activeDrawPage = hit.pageNum;
      _currentPoints.add(point);
    });
  }

  void _handleReaderPointerEnd(PointerEvent event, Size viewportSize) {
    if (_activePenPointer == event.pointer) {
      _finishCurrentStroke();
      _activePenPointer = null;
      return;
    }
    if (_isTouchEvent(event)) {
      _handleTouchEnd(event, viewportSize);
    }
  }

  void _toggleFab() {
    setState(() {
      _fabExpanded = !_fabExpanded;
      if (!_fabExpanded) _fabSubmenu = null;
    });
    if (_fabExpanded) {
      _fabAnimController.forward();
    } else {
      _fabAnimController.reverse();
    }
  }

  void _goToPage(int index) {
    if (_totalPages <= 0) return;
    final target = index.clamp(0, _totalPages - 1).toInt();
    final displayStart = _displayStartForPage(target);
    if (displayStart == _currentPageIndex) return;
    setState(() {
      _currentPageIndex = displayStart;
    });
    if (!_singlePageMode) {
      _flipController.goToPage(target);
    }
    _precachePagesAround(displayStart);
  }

  void _flipLeft() {
    if (_singlePageMode) {
      _goToPage(_currentPageIndex - 1);
      return;
    }
    if (_flipController.hasPreviousPage) {
      _flipController.previousPage();
    }
  }

  void _flipRight() {
    if (_singlePageMode) {
      _goToPage(_currentPageIndex + 1);
      return;
    }
    if (_flipController.hasNextPage) {
      _flipController.nextPage();
    }
  }

  int _targetAnnotationPage() {
    final visiblePages = _visiblePageIndexes();
    if (_activeDrawPage != null && visiblePages.contains(_activeDrawPage)) {
      return _activeDrawPage!;
    }
    if (_lastEditedPage != null && visiblePages.contains(_lastEditedPage)) {
      return _lastEditedPage!;
    }
    return visiblePages.first;
  }

  int _spreadStartForPage(int pageIndex) {
    if (pageIndex <= 0) return 0;
    return pageIndex.isEven ? max(1, pageIndex - 1) : pageIndex;
  }

  int _displayStartForPage(int pageIndex) {
    return _singlePageMode ? pageIndex : _spreadStartForPage(pageIndex);
  }

  List<int> _visiblePageIndexes() {
    if (_totalPages <= 0) return const [];
    if (_singlePageMode) {
      return [_currentPageIndex.clamp(0, _totalPages - 1).toInt()];
    }
    if (_currentPageIndex <= 0) return const [0];
    final rightPage = _currentPageIndex + 1;
    if (rightPage < _totalPages) {
      return [_currentPageIndex, rightPage];
    }
    return [_currentPageIndex];
  }

  String _currentPageRangeLabel() {
    final pages = _visiblePageIndexes();
    return widget.textbook.pageRangeLabel(pages);
  }

  EdgeInsets _readerContentPadding() {
    if (!_singlePageMode) return EdgeInsets.zero;
    return EdgeInsets.only(
      left: 52,
      right: 52,
      top: 48,
      bottom: _thumbnailExpanded ? 150 : 64,
    );
  }

  void _setSinglePageMode(bool value) {
    if (_singlePageMode == value) return;
    if (_totalPages <= 0) return;
    final currentVisiblePage = _targetAnnotationPage();
    final nextPage = value
        ? currentVisiblePage
        : _spreadStartForPage(currentVisiblePage);

    setState(() {
      _singlePageMode = value;
      _currentPageIndex = nextPage;
      _currentZoom = 1.0;
      _activeTouchPositions.clear();
      _zoomController.value = Matrix4.identity();
    });
    _precachePagesAround(nextPage);
  }

  void _undo() {
    final page = _targetAnnotationPage();
    final list = _strokes[page];
    if (list != null && list.isNotEmpty) {
      final removed = list.removeLast();
      _undoStack.putIfAbsent(page, () => []).add(removed);
      _lastEditedPage = page;
      _saveStrokes();
      setState(() {});
    }
  }

  void _redo() {
    final page = _targetAnnotationPage();
    final stack = _undoStack[page];
    if (stack != null && stack.isNotEmpty) {
      final restored = stack.removeLast();
      _strokes.putIfAbsent(page, () => []).add(restored);
      _lastEditedPage = page;
      _saveStrokes();
      setState(() {});
    }
  }

  /// 橡皮擦：移除触碰点附近 20px 内的笔画
  void _eraseAtPoint(int pageNum, _StrokePoint point, Size pageSize) {
    final list = _strokes[pageNum];
    if (list == null || list.isEmpty) return;
    final threshold = (26.0 / _currentZoom).clamp(6.0, 26.0).toDouble();
    final target = point.toOffset(pageSize);
    bool removed = false;
    for (int i = list.length - 1; i >= 0; i--) {
      for (final p in list[i].points) {
        if ((p.toOffset(pageSize) - target).distance < threshold) {
          _undoStack.putIfAbsent(pageNum, () => []).add(list.removeAt(i));
          _lastEditedPage = pageNum;
          removed = true;
          break;
        }
      }
    }
    if (removed) {
      _saveStrokes();
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F0EB),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final layoutW = constraints.maxWidth;
          final layoutH = constraints.maxHeight;
          final viewportSize = Size(layoutW, layoutH);
          // 初始化悬浮球位置（用布局约束而非 MediaQuery，确保在 TabletFrame 内部）
          if (_fabPosition.dx < 0) {
            _fabPosition = _clampFabPosition(
              Offset(layoutW - 200, layoutH * 0.3),
              viewportSize,
            );
          }
          final readerPadding = _readerContentPadding();
          return Stack(
            clipBehavior: Clip.none,
            children: [
              // ===== 最底层：TurnablePage + 缩放 =====
              Positioned.fill(
                child: Listener(
                  behavior: HitTestBehavior.opaque,
                  onPointerDown: (event) =>
                      _handleReaderPointerDown(event, viewportSize),
                  onPointerMove: (event) =>
                      _handleReaderPointerMove(event, viewportSize),
                  onPointerUp: (event) =>
                      _handleReaderPointerEnd(event, viewportSize),
                  onPointerCancel: (event) =>
                      _handleReaderPointerEnd(event, viewportSize),
                  onPointerSignal: (event) {
                    if (event is PointerScrollEvent &&
                        (HardwareKeyboard.instance.logicalKeysPressed.contains(
                              LogicalKeyboardKey.controlLeft,
                            ) ||
                            HardwareKeyboard.instance.logicalKeysPressed
                                .contains(LogicalKeyboardKey.controlRight))) {
                      final delta = event.scrollDelta.dy;
                      setState(() {
                        final oldScale = _currentZoom;
                        final oldOffset = _currentPanOffset();
                        final nextScale = (_currentZoom - delta * 0.001)
                            .clamp(1.0, 3.0)
                            .toDouble();
                        final focal = event.localPosition;
                        final sceneFocal = (focal - oldOffset) / oldScale;
                        final nextOffset = focal - sceneFocal * nextScale;
                        _setViewerTransform(
                          nextScale,
                          nextOffset,
                          viewportSize,
                        );
                      });
                    }
                  },
                  child: Padding(
                    padding: readerPadding,
                    child: InteractiveViewer(
                      transformationController: _zoomController,
                      minScale: 1.0,
                      maxScale: 3.0,
                      panEnabled: !_annotationMode && _currentZoom > 1.05,
                      scaleEnabled: !_annotationMode,
                      onInteractionUpdate: (details) {
                        setState(
                          () => _currentZoom = _zoomController.value
                              .getMaxScaleOnAxis(),
                        );
                      },
                      onInteractionEnd: (_) =>
                          _settleViewerTransform(viewportSize),
                      child: _singlePageMode
                          ? _buildSinglePageStage()
                          : AbsorbPointer(
                              absorbing: _shouldAbsorbPageInput,
                              child: TurnablePage(
                                key: const ValueKey('reader-double-page'),
                                controller: _flipController,
                                pageCount: _totalPages,
                                pageViewMode: PageViewMode.double,
                                autoResponseSize: true,
                                paperBoundaryDecoration:
                                    PaperBoundaryDecoration.vintage,
                                settings: FlipSettings(
                                  startPageIndex: _currentPageIndex,
                                  usePortrait: false,
                                  showCover: true,
                                  drawShadow: !(_drawingMode || _eraserMode),
                                  maxShadowOpacity: 0.6,
                                  flippingTime: 600,
                                  showPageCorners:
                                      !(_drawingMode || _eraserMode),
                                  enableUserInteraction:
                                      !_shouldAbsorbPageInput,
                                ),
                                builder: (context, index, constraints) {
                                  return _buildPage(index);
                                },
                                onPageChanged: (leftPageIndex, rightPageIndex) {
                                  setState(() {
                                    _currentPageIndex = leftPageIndex;
                                  });
                                  _precachePagesAround(leftPageIndex);
                                },
                              ),
                            ),
                    ),
                  ),
                ),
              ),

              // ===== 浮层：左翻页箭头 =====
              Positioned(
                left: 0,
                top: 60,
                bottom: 60,
                child: _buildPageArrow(
                  icon: Icons.chevron_left_rounded,
                  label: '上一页',
                  onTap: _flipLeft,
                ),
              ),

              // ===== 浮层：右翻页箭头 =====
              Positioned(
                right: 0,
                top: 60,
                bottom: 60,
                child: _buildPageArrow(
                  icon: Icons.chevron_right_rounded,
                  label: '下一页',
                  onTap: _flipRight,
                ),
              ),

              // ===== 浮层：顶部状态栏（半透明） =====
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: _buildTopBar(context),
              ),

              // ===== 浮层：底部缩略图条（浮动卡片） =====
              Positioned(
                bottom: 12,
                left: 0,
                right: 0,
                child: Center(child: _buildThumbnailBar()),
              ),

              // — 右侧悬浮球（可拖动） —
              Positioned(
                left: _fabPosition.dx - _fabDockInset,
                top: _fabPosition.dy - _fabDockInset,
                child: GestureDetector(
                  onPanStart: (_) => setState(() => _fabDragging = true),
                  onPanUpdate: (d) {
                    setState(() {
                      _fabPosition = _clampFabPosition(
                        _fabPosition + d.delta,
                        viewportSize,
                      );
                    });
                  },
                  onPanEnd: (_) => setState(() => _fabDragging = false),
                  onPanCancel: () => setState(() => _fabDragging = false),
                  child: _buildRadialFab(),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // 电子课本按钮
            InkWell(
              onTap: () => Navigator.of(context).pop(),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: AppColors.brand,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(
                      Icons.menu_book_rounded,
                      size: 16,
                      color: Colors.white,
                    ),
                    SizedBox(width: 6),
                    Text(
                      '电子课本',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 16),
            // 上课状态
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.success.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.circle, size: 8, color: AppColors.success),
                  const SizedBox(width: 6),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 360),
                    child: Text(
                      '${widget.textbook.displayName} · ${widget.textbook.pageCountLabel}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.success,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.warning.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(
                    Icons.lock_outline_rounded,
                    size: 14,
                    color: AppColors.warning,
                  ),
                  SizedBox(width: 4),
                  Text(
                    '课堂受限中',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            _buildReaderModeToggle(),
            const SizedBox(width: 10),
            const StatusGroupChip(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              items: [
                StatusItem(
                  icon: Icons.tablet_mac_rounded,
                  label: '平板已连接',
                  iconColor: AppColors.brand,
                ),
                StatusItem(
                  icon: Icons.cloud_done_outlined,
                  label: '云同步完成',
                  iconColor: AppColors.brandSoft,
                ),
              ],
            ),
          ], // Row.children
        ), // Row
      ), // SafeArea
    ); // Container
  }

  Widget _buildReaderModeToggle() {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.control,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildModeButton(
            icon: Icons.auto_stories_rounded,
            label: '双页',
            selected: !_singlePageMode,
            onTap: () => _setSinglePageMode(false),
          ),
          _buildModeButton(
            icon: Icons.crop_portrait_rounded,
            label: '单页',
            selected: _singlePageMode,
            onTap: () => _setSinglePageMode(true),
          ),
        ],
      ),
    );
  }

  Widget _buildModeButton({
    required IconData icon,
    required String label,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return Tooltip(
      message: selected ? '$label显示' : '切换到$label显示',
      child: InkWell(
        onTap: selected ? null : onTap,
        borderRadius: BorderRadius.circular(15),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: selected ? AppColors.brand : Colors.transparent,
            borderRadius: BorderRadius.circular(15),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 16,
                color: selected ? Colors.white : AppColors.textMuted,
              ),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: selected ? Colors.white : AppColors.textBody,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPageArrow({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 44,
        color: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 28, color: AppColors.textHint),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textHint,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSinglePageStage() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final pageHeight = min(
          constraints.maxHeight,
          constraints.maxWidth / _singlePageAspectRatio,
        );
        final pageWidth = pageHeight * _singlePageAspectRatio;
        return Center(
          child: SizedBox(
            key: _singlePageKey,
            width: pageWidth,
            height: pageHeight,
            child: _buildPage(_currentPageIndex),
          ),
        );
      },
    );
  }

  Widget _buildPage(int pageNum) {
    final currentPoints = _activeDrawPage == pageNum
        ? _currentPoints
        : const <_StrokePoint>[];
    return Container(
      margin: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(4),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Stack(
        children: [
          _buildRealPageOrFallback(pageNum),
          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: _StrokePainter(
                  strokes: _strokes[pageNum] ?? const [],
                  currentPoints: currentPoints,
                  currentColor: _penColor,
                  currentWidth: _penWidth,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRealPageOrFallback(int pageNum) {
    final assetPath = _pageAssetPath(pageNum);
    return Positioned.fill(
      child: Image.asset(
        assetPath,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.high,
        gaplessPlayback: true,
        errorBuilder: (_, _, _) => _buildMissingPage(pageNum),
      ),
    );
  }

  Widget _buildMissingPage(int pageNum) {
    return Center(
      child: Text(
        '${widget.textbook.pageDisplayLabel(pageNum)}未导入',
        style: const TextStyle(
          fontSize: 14,
          color: AppColors.textMuted,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildThumbnailBar() {
    final visiblePages = _visiblePageIndexes();
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: _thumbnailExpanded ? 700 : 320),
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: 16,
          vertical: _thumbnailExpanded ? 12 : 10,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 12,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 头部行：手势区域（上滑/下滑/点击切换展开收起）
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onVerticalDragEnd: (details) {
                final velocity = details.primaryVelocity ?? 0;
                if (velocity < -80) {
                  setState(() => _thumbnailExpanded = true);
                } else if (velocity > 80) {
                  setState(() => _thumbnailExpanded = false);
                }
              },
              onTap: () =>
                  setState(() => _thumbnailExpanded = !_thumbnailExpanded),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _thumbnailExpanded
                        ? Icons.keyboard_arrow_down_rounded
                        : Icons.keyboard_arrow_up_rounded,
                    size: 16,
                    color: AppColors.textHint,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _thumbnailExpanded ? '下滑收起预览' : '上滑预览页面',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textHint,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.border.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Text(
                      _currentPageRangeLabel(),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textBody,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // 缩略图预览区域（独立手势空间，支持左右拖动滚动 + 点击跳页）
            if (_thumbnailExpanded) ...[
              const SizedBox(height: 10),
              SizedBox(
                height: 110,
                child: ScrollConfiguration(
                  behavior: ScrollConfiguration.of(context).copyWith(
                    dragDevices: {
                      PointerDeviceKind.touch,
                      PointerDeviceKind.mouse,
                    },
                  ),
                  child: ListView.builder(
                    controller: _thumbnailScrollController,
                    scrollDirection: Axis.horizontal,
                    itemCount: _totalPages,
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    itemBuilder: (_, i) {
                      final isSelected = visiblePages.contains(i);
                      return GestureDetector(
                        onTap: () => _goToPage(i),
                        child: Container(
                          width: 76,
                          height: 100,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.brand
                                  : AppColors.border.withValues(alpha: 0.3),
                              width: isSelected ? 2.5 : 1.0,
                            ),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: Stack(
                            children: [
                              Positioned.fill(
                                child: _buildThumbnailContent(i, isSelected),
                              ),
                              Positioned(
                                bottom: 0,
                                left: 0,
                                right: 0,
                                child: Container(
                                  color: Colors.black.withValues(alpha: 0.45),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 2,
                                  ),
                                  child: Text(
                                    widget.textbook.pageDisplayLabel(
                                      i,
                                      compact: true,
                                    ),
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildThumbnailContent(int pageNum, bool isSelected) {
    final assetPath = _pageAssetPath(pageNum);
    return Image.asset(
      assetPath,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.medium,
      errorBuilder: (_, _, _) => _buildThumbnailPlaceholder(isSelected),
    );
  }

  Widget _buildThumbnailPlaceholder(bool isSelected) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: double.infinity,
          height: 5,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.brand : AppColors.border,
            borderRadius: BorderRadius.circular(999),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          height: 5,
          decoration: BoxDecoration(
            color: AppColors.border.withValues(alpha: 0.72),
            borderRadius: BorderRadius.circular(999),
          ),
        ),
        const SizedBox(height: 6),
        FractionallySizedBox(
          widthFactor: 0.72,
          child: Container(
            height: 5,
            decoration: BoxDecoration(
              color: AppColors.border.withValues(alpha: 0.72),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
        ),
      ],
    );
  }

  // — 饼状悬浮球（内圈扇区分割 + 中心品牌按钮） —
  Widget _buildRadialFab() {
    final sectors = [
      _FabItem(
        icon: Icons.touch_app_rounded,
        label: '选择',
        color: const Color(0xFF555555),
      ),
      _FabItem(
        icon: Icons.category_rounded,
        label: '图形',
        color: const Color(0xFF555555),
      ),
      _FabItem(
        icon: Icons.auto_fix_high_rounded,
        label: '板擦',
        color: const Color(0xFF555555),
      ),
      _FabItem(
        icon: Icons.camera_alt_rounded,
        label: '拍照',
        color: const Color(0xFF555555),
      ),
      _FabItem(
        icon: Icons.more_horiz_rounded,
        label: '更多',
        color: const Color(0xFF555555),
      ),
      _FabItem(
        icon: Icons.cast_for_education_rounded,
        label: '授课',
        color: const Color(0xFF555555),
      ),
      _FabItem(
        icon: Icons.photo_camera_front_rounded,
        label: '高拍',
        color: const Color(0xFF555555),
      ),
      _FabItem(icon: Icons.edit_rounded, label: '笔', color: AppColors.brand),
    ];
    const double innerR = 90;
    const double centerR = 34;
    final outerRingR = _fabOuterRingRadius;
    final totalSize = _fabTotalSize;
    final int count = sectors.length;
    final double sectorAngle = 2 * pi / count;
    final showPenRing = _fabSubmenu == '笔' || _drawingMode;

    return AnimatedBuilder(
      animation: _fabExpandAnimation,
      builder: (_, _) {
        final expand = _fabExpandAnimation.value;
        if (expand < 0.01) {
          return SizedBox(
            width: totalSize,
            height: totalSize,
            child: Center(
              child: GestureDetector(
                onTap: _fabDragging ? null : _toggleFab,
                child: _buildCenterBtn(false),
              ),
            ),
          );
        }
        return SizedBox(
          width: totalSize,
          height: totalSize,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.center,
            children: [
              // 白色圆盘 + 扇区分割线
              Transform.scale(
                scale: expand,
                child: Opacity(
                  opacity: expand.clamp(0.0, 1.0).toDouble(),
                  child: CustomPaint(
                    size: Size(totalSize, totalSize),
                    painter: _PieRingPainter(
                      sectorCount: count,
                      innerRadius: centerR + 2,
                      outerRadius: innerR,
                    ),
                  ),
                ),
              ),
              // _OuterToolRingPainter 已移除（蓝色弧线）
              if (showPenRing) ..._buildOuterPenControls(totalSize, outerRingR),
              // 扇区图标
              ...List.generate(count, (i) {
                final angle = -pi / 2 + i * sectorAngle + sectorAngle / 2;
                final r = (centerR + innerR) / 2 + 4;
                final dx = r * cos(angle);
                final dy = r * sin(angle);
                final item = sectors[i];
                final isActive =
                    (item.label == '笔' && _drawingMode) ||
                    (item.label == '板擦' && _eraserMode);
                return Positioned(
                  left: totalSize / 2 + dx - 22,
                  top: totalSize / 2 + dy - 20,
                  child: Transform.scale(
                    scale: expand,
                    child: Opacity(
                      opacity: expand.clamp(0.0, 1.0).toDouble(),
                      child: GestureDetector(
                        onTap: () => _handleFabAction(item.label),
                        child: SizedBox(
                          width: 52,
                          height: 48,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                item.icon,
                                size: 22,
                                color: isActive ? AppColors.brand : item.color,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                item.label,
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: isActive
                                      ? FontWeight.w700
                                      : FontWeight.w400,
                                  color: isActive
                                      ? AppColors.brand
                                      : item.color,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }),
              // 中心按钮
              GestureDetector(
                onTap: _fabDragging ? null : _toggleFab,
                child: _buildCenterBtn(true),
              ),
            ],
          ),
        );
      },
    );
  }

  List<Widget> _buildOuterPenControls(double totalSize, double radius) {
    final controls = <Widget>[];
    final center = totalSize / 2;

    // 弧带1：颜色选择（右上方，角度 -90° 到 -210°，即从上方到左方）
    controls.add(
      Positioned.fill(
        child: IgnorePointer(
          child: CustomPaint(
            painter: _ArcBandPainter(
              center: Offset(center, center),
              radius: radius + 4,
              startAngle: -210 * pi / 180,
              sweepAngle: (_colorOptions.length - 1) * 24 * pi / 180 + 0.3,
              bandWidth: 36,
            ),
          ),
        ),
      ),
    );

    const colorStart = -210.0;
    const colorStep = 24.0;
    for (var i = 0; i < _colorOptions.length; i++) {
      final color = _colorOptions[i];
      final angle = (colorStart + i * colorStep) * pi / 180;
      controls.add(
        _buildOuterControl(
          totalSize: totalSize,
          radius: radius + 4,
          angle: angle,
          child: Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(
                color: _penColor == color ? Colors.white : Colors.transparent,
                width: 3,
              ),
              boxShadow: [
                BoxShadow(color: color.withValues(alpha: 0.4), blurRadius: 8),
              ],
            ),
          ),
          onTap: () => setState(() {
            _penColor = color;
            _drawingMode = true;
            _eraserMode = false;
            _fabSubmenu = '笔';
          }),
        ),
      );
    }

    // 弧带2：粗细选择（右下方）
    controls.add(
      Positioned.fill(
        child: IgnorePointer(
          child: CustomPaint(
            painter: _ArcBandPainter(
              center: Offset(center, center),
              radius: radius + 4,
              startAngle: 26 * pi / 180,
              sweepAngle: (_widthOptions.length - 1) * 26 * pi / 180 + 0.3,
              bandWidth: 36,
            ),
          ),
        ),
      ),
    );

    const widthStart = 26.0;
    const widthStep = 26.0;
    for (var i = 0; i < _widthOptions.length; i++) {
      final width = _widthOptions[i];
      final angle = (widthStart + i * widthStep) * pi / 180;
      controls.add(
        _buildOuterControl(
          totalSize: totalSize,
          radius: radius + 4,
          angle: angle,
          child: Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: _penWidth == width ? AppColors.brand : AppColors.border,
                width: _penWidth == width ? 2.5 : 1,
              ),
            ),
            child: Center(
              child: Container(
                width: width + 4,
                height: width + 4,
                decoration: BoxDecoration(
                  color: _penColor,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
          onTap: () => setState(() {
            _penWidth = width;
            _drawingMode = true;
            _eraserMode = false;
            _fabSubmenu = '笔';
          }),
        ),
      );
    }

    controls
      ..add(
        _buildOuterControl(
          totalSize: totalSize,
          radius: radius + 4,
          angle: 104 * pi / 180,
          child: Tooltip(
            message: '撤销',
            child: _buildOuterActionButton(Icons.undo_rounded),
          ),
          onTap: _undo,
        ),
      )
      ..add(
        _buildOuterControl(
          totalSize: totalSize,
          radius: radius + 4,
          angle: 128 * pi / 180,
          child: Tooltip(
            message: '重做',
            child: _buildOuterActionButton(Icons.redo_rounded),
          ),
          onTap: _redo,
        ),
      );

    return controls;
  }

  Widget _buildOuterActionButton(IconData icon) {
    return Container(
      width: 30,
      height: 30,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Icon(icon, size: 18, color: AppColors.textMuted),
    );
  }

  Widget _buildOuterControl({
    required double totalSize,
    required double radius,
    required double angle,
    required Widget child,
    required VoidCallback onTap,
  }) {
    final dx = radius * cos(angle);
    final dy = radius * sin(angle);
    return Positioned(
      left: totalSize / 2 + dx - 14,
      top: totalSize / 2 + dy - 14,
      child: GestureDetector(onTap: onTap, child: child),
    );
  }

  Widget _buildCenterBtn(bool expanded) {
    return Container(
      width: _fabButtonSize,
      height: _fabButtonSize,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: AppShadows.float,
        gradient: expanded
            ? LinearGradient(colors: [AppColors.brand, AppColors.brandSoft])
            : const SweepGradient(
                colors: [
                  Color(0xFF4285F4),
                  Color(0xFF34A853),
                  Color(0xFFFBBC05),
                  Color(0xFFEA4335),
                  Color(0xFF4285F4),
                ],
              ),
      ),
      child: Container(
        margin: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          color: expanded ? null : Colors.white,
          shape: BoxShape.circle,
          gradient: expanded
              ? LinearGradient(colors: [AppColors.brand, AppColors.brandSoft])
              : null,
        ),
        child: Center(
          child: expanded
              ? const Icon(Icons.close_rounded, size: 28, color: Colors.white)
              : const Text(
                  'Ai',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF333333),
                  ),
                ),
        ),
      ),
    );
  }

  void _handleFabAction(String label) {
    switch (label) {
      case '笔':
        setState(() {
          final wasDrawing = _drawingMode && _fabSubmenu == '笔';
          _drawingMode = !wasDrawing;
          _eraserMode = false;
          _fabSubmenu = wasDrawing ? null : '笔';
        });
        break;
      case '板擦':
        setState(() {
          final wasErasing = _eraserMode;
          _eraserMode = !wasErasing;
          _drawingMode = false;
          _fabSubmenu = null;
        });
        break;
      default:
        _toggleFab();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$label 功能即将上线'),
            duration: const Duration(seconds: 1),
          ),
        );
        break;
    }
  }
}

class _FabItem {
  final IconData icon;
  final String label;
  final Color color;
  const _FabItem({
    required this.icon,
    required this.label,
    required this.color,
  });
}

/// 饼状圆盘 Painter：白底圆环 + 扇形分割线
class _PieRingPainter extends CustomPainter {
  final int sectorCount;
  final double innerRadius;
  final double outerRadius;

  _PieRingPainter({
    required this.sectorCount,
    required this.innerRadius,
    required this.outerRadius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);

    // 白色圆盘背景
    final bgPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, outerRadius, bgPaint);

    // 外圈描边
    final borderPaint = Paint()
      ..color = const Color(0xFFE0E0E0)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(center, outerRadius, borderPaint);

    // 内圈描边（中心区域边界）
    canvas.drawCircle(center, innerRadius, borderPaint);

    // 扇形分割线
    final linePaint = Paint()
      ..color = const Color(0xFFE8E8E8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    final sectorAngle = 2 * pi / sectorCount;
    for (int i = 0; i < sectorCount; i++) {
      final angle = -pi / 2 + i * sectorAngle;
      final inner = Offset(
        center.dx + innerRadius * cos(angle),
        center.dy + innerRadius * sin(angle),
      );
      final outer = Offset(
        center.dx + outerRadius * cos(angle),
        center.dy + outerRadius * sin(angle),
      );
      canvas.drawLine(inner, outer, linePaint);
    }

    // 外圈阴影
    final shadowPaint = Paint()
      ..color = const Color(0x15000000)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);
    canvas.drawCircle(center, outerRadius + 2, shadowPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ArcBandPainter extends CustomPainter {
  final Offset center;
  final double radius;
  final double startAngle;
  final double sweepAngle;
  final double bandWidth;

  const _ArcBandPainter({
    required this.center,
    required this.radius,
    required this.startAngle,
    required this.sweepAngle,
    this.bandWidth = 36,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromCircle(center: center, radius: radius);
    // 阴影
    final shadowPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = bandWidth + 4
      ..strokeCap = StrokeCap.round
      ..color = Colors.black.withValues(alpha: 0.08)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawArc(rect, startAngle, sweepAngle, false, shadowPaint);
    // 白色弧带
    final bandPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = bandWidth
      ..strokeCap = StrokeCap.round
      ..color = Colors.white;
    canvas.drawArc(rect, startAngle, sweepAngle, false, bandPaint);
  }

  @override
  bool shouldRepaint(covariant _ArcBandPainter old) =>
      center != old.center ||
      radius != old.radius ||
      startAngle != old.startAngle ||
      sweepAngle != old.sweepAngle;
}

class _DrawStroke {
  final List<_StrokePoint> points;
  final Color color;
  final double width;
  const _DrawStroke({
    required this.points,
    required this.color,
    required this.width,
  });
}

class _StrokePoint {
  final double x;
  final double y;
  final double pressure;

  const _StrokePoint(this.x, this.y, {this.pressure = 1.0});

  Offset toOffset(Size size) => Offset(x * size.width, y * size.height);
}

class _PageHit {
  final int pageNum;
  final Offset localPosition;
  final Size pageSize;

  const _PageHit({
    required this.pageNum,
    required this.localPosition,
    required this.pageSize,
  });
}

class _StrokePainter extends CustomPainter {
  final List<_DrawStroke> strokes;
  final List<_StrokePoint> currentPoints;
  final Color currentColor;
  final double currentWidth;

  _StrokePainter({
    required this.strokes,
    required this.currentPoints,
    required this.currentColor,
    required this.currentWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final s in strokes) {
      _drawPath(canvas, size, s.points, s.color, s.width);
    }
    if (currentPoints.isNotEmpty) {
      _drawPath(canvas, size, currentPoints, currentColor, currentWidth);
    }
  }

  void _drawPath(
    Canvas canvas,
    Size size,
    List<_StrokePoint> points,
    Color color,
    double width,
  ) {
    if (points.isEmpty) return;
    final baseWidth =
        width * (size.shortestSide / 720).clamp(0.75, 1.45).toDouble();
    final paint = Paint()
      ..color = color
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;
    if (points.length == 1) {
      final point = points.first.toOffset(size);
      paint.style = PaintingStyle.fill;
      canvas.drawCircle(
        point,
        _widthForPressure(baseWidth, points.first.pressure) / 2,
        paint,
      );
      return;
    }
    for (var i = 0; i < points.length - 1; i++) {
      final a = points[i];
      final b = points[i + 1];
      paint.strokeWidth = _widthForPressure(
        baseWidth,
        (a.pressure + b.pressure) / 2,
      );
      canvas.drawLine(a.toOffset(size), b.toOffset(size), paint);
    }
  }

  double _widthForPressure(double baseWidth, double pressure) {
    return baseWidth * (0.55 + pressure.clamp(0.0, 1.0).toDouble() * 0.65);
  }

  @override
  bool shouldRepaint(covariant _StrokePainter old) => true;
}
