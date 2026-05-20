import 'dart:math';
import 'dart:ui' as ui;
import 'package:flutter/gestures.dart';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:turnable_page/turnable_page.dart';

import '../../app/tokens.dart';
import '../../core/widgets/status_chip.dart';

/// S02 电子课本阅读器页（3级页面）。
///
/// 1:1 复刻 `S02_电子课本_上课电子书阅读_v2.png`：
///   - 横屏锁定
///   - 顶部状态栏
///   - 双页显示区域
///   - 右侧悬浮球菜单
///   - 底部缩略图预览条
class TextbookReaderPage extends StatefulWidget {
  final String subjectName;
  final Color subjectColor;

  const TextbookReaderPage({
    super.key,
    this.subjectName = '数学',
    this.subjectColor = const Color(0xFF2C6BFF),
  });

  @override
  State<TextbookReaderPage> createState() => _TextbookReaderPageState();
}

class _TextbookReaderPageState extends State<TextbookReaderPage>
    with TickerProviderStateMixin {
  int _currentPageIndex = 22;
  final int _totalPages = 124;
  bool _fabExpanded = false;
  String? _fabSubmenu;
  bool _thumbnailExpanded = false;
  double _pageDragDx = 0;
  double _dragRatio = 0.0; // 0~1 实时拖拽翻页进度
  bool _isDragFlipping = false;
  Offset _pullPoint = Offset.zero; // 拉点在右页内的坐标
  final ScrollController _thumbnailScrollController = ScrollController();
  final PageFlipController _flipController = PageFlipController();

  // -- 缩放相关 --
  final TransformationController _zoomController = TransformationController();
  double _currentZoom = 1.0;

  // — 悬浮球拖动位置 —
  Offset _fabPosition = const Offset(-1, -1); // -1 表示未初始化
  bool _fabDragging = false;

  // — 涂鸦相关 —
  bool _drawingMode = false;
  bool _eraserMode = false;
  Color _penColor = const Color(0xFF2C6BFF);
  double _penWidth = 3.0;
  final Map<int, List<_DrawStroke>> _strokes = {};
  List<Offset> _currentPoints = [];
  int? _activeDrawPage;
  int _lastFlipDirection = 1;
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
  static const int _demoRealPageCount = 60;

  late final AnimationController _fabAnimController;
  late final Animation<double> _fabExpandAnimation;

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
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 预加载当前页前后3页的图片到缓存
    _precacheNearbyPages(_currentPageIndex);
  }

  /// 预加载指定翻页索引前后各3页的图片
  void _precacheNearbyPages(int spreadIndex) {
    final leftPage = spreadIndex * 2;
    for (int i = -3; i <= 4; i++) {
      final pageNum = leftPage + i;
      if (pageNum >= 0 && pageNum < _demoRealPageCount) {
        precacheImage(
          AssetImage(_pageAssetPath(pageNum)),
          context,
        );
      }
    }
  }

  @override
  void dispose() {
    _fabAnimController.dispose();
    _thumbnailScrollController.dispose();
    // 恢复方向
    SystemChrome.setPreferredOrientations(DeviceOrientation.values);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  String get _annotationKey => '${widget.subjectName}-demo-reader';

  String _pageAssetPath(int pageNum) {
    final page = (pageNum + 1).toString().padLeft(3, '0');
    return 'assets/images/textbook_pages/page_$page.png';
  }

  Map<int, List<_DrawStroke>> _cloneStrokeMap(
    Map<int, List<_DrawStroke>> source,
  ) {
    return source.map((page, strokes) => MapEntry(page, List.of(strokes)));
  }

  void _saveStrokes() {
    _savedStrokesByBook[_annotationKey] = _cloneStrokeMap(_strokes);
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
    final maxIndex = _totalPages ~/ 2 - 1;
    final target = index.clamp(0, maxIndex).toInt();
    if (target == _currentPageIndex) return;
    setState(() {
      _lastFlipDirection = target > _currentPageIndex ? 1 : -1;
      _currentPageIndex = target;
    });
    // 同步告知翻页控制器跳到对应页
    _flipController.goToPage(target * 2);
  }

  void _flipLeft() {
    if (_flipController.hasPreviousPage) {
      _flipController.previousPage();
    }
  }

  void _flipRight() {
    if (_flipController.hasNextPage) {
      _flipController.nextPage();
    }
  }

  void _undo() {
    final page = _currentPageIndex * 2;
    final list = _strokes[page];
    if (list != null && list.isNotEmpty) {
      final removed = list.removeLast();
      _undoStack.putIfAbsent(page, () => []).add(removed);
      _saveStrokes();
      setState(() {});
    }
  }

  void _redo() {
    final page = _currentPageIndex * 2;
    final stack = _undoStack[page];
    if (stack != null && stack.isNotEmpty) {
      final restored = stack.removeLast();
      _strokes.putIfAbsent(page, () => []).add(restored);
      _saveStrokes();
      setState(() {});
    }
  }

  /// 橡皮擦：移除触碰点附近 20px 内的笔画
  void _eraseAtPoint(int pageNum, Offset point) {
    final list = _strokes[pageNum];
    if (list == null || list.isEmpty) return;
    const double threshold = 20.0;
    bool removed = false;
    for (int i = list.length - 1; i >= 0; i--) {
      for (final p in list[i].points) {
        if ((p - point).distance < threshold) {
          _undoStack.putIfAbsent(pageNum, () => []).add(list.removeAt(i));
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
          // 初始化悬浮球位置（用布局约束而非 MediaQuery，确保在 TabletFrame 内部）
          if (_fabPosition.dx < 0) {
            _fabPosition = Offset(layoutW - 200, layoutH * 0.3);
          }
          final leftPage = _currentPageIndex * 2;
          final rightPage = leftPage + 1;
          return Stack(
            clipBehavior: Clip.none,
            children: [
              // ===== 最底层：TurnablePage + 缩放 =====
              Positioned.fill(
                child: Listener(
                  onPointerSignal: (event) {
                    if (event is PointerScrollEvent &&
                        (RawKeyboard.instance.keysPressed.contains(LogicalKeyboardKey.controlLeft) ||
                         RawKeyboard.instance.keysPressed.contains(LogicalKeyboardKey.controlRight))) {
                      final delta = event.scrollDelta.dy;
                      setState(() {
                        _currentZoom = (_currentZoom - delta * 0.001).clamp(1.0, 3.0);
                        _zoomController.value = Matrix4.identity()..scale(_currentZoom);
                      });
                    }
                  },
                  child: InteractiveViewer(
                    transformationController: _zoomController,
                    minScale: 1.0,
                    maxScale: 3.0,
                    panEnabled: _currentZoom > 1.05,
                    scaleEnabled: !(_drawingMode || _eraserMode),
                    onInteractionUpdate: (details) {
                      setState(() => _currentZoom = _zoomController.value.getMaxScaleOnAxis());
                    },
                    child: AbsorbPointer(
                      absorbing: _drawingMode || _eraserMode,
                      child: TurnablePage(
                        controller: _flipController,
                        pageCount: _totalPages,
                        pageViewMode: PageViewMode.double,
                        autoResponseSize: true,
                        paperBoundaryDecoration: PaperBoundaryDecoration.vintage,
                        settings: FlipSettings(
                          startPageIndex: _currentPageIndex,
                          usePortrait: false,
                          drawShadow: !(_drawingMode || _eraserMode),
                          maxShadowOpacity: 0.6,
                          flippingTime: 600,
                          showPageCorners: !(_drawingMode || _eraserMode),
                        ),
                        builder: (context, index, constraints) {
                          return _buildPage(index);
                        },
                        onPageChanged: (leftPageIndex, rightPageIndex) {
                          final newSpread = leftPageIndex ~/ 2;
                          setState(() {
                            _currentPageIndex = newSpread;
                          });
                          // 翻页后预加载前后页面
                          _precacheNearbyPages(newSpread);
                        },
                      ),
                    ),
                  ),
                ),
              ),

          // ===== 涂鸦覆盖层（仅涂鸦/橡皮擦模式） =====
          if (_drawingMode || _eraserMode)
            Positioned.fill(
              child: LayoutBuilder(
                builder: (context, overlayConstraints) {
                  final halfW = overlayConstraints.maxWidth / 2;
                  return GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onPanStart: (d) {
                      final isRight = d.localPosition.dx > halfW;
                      final pageNum = _currentPageIndex * 2 + (isRight ? 1 : 0);
                      final localX = isRight ? d.localPosition.dx - halfW : d.localPosition.dx;
                      final localPos = Offset(localX, d.localPosition.dy);
                      if (_eraserMode) {
                        _eraseAtPoint(pageNum, localPos);
                      } else {
                        setState(() {
                          _activeDrawPage = pageNum;
                          _currentPoints = [localPos];
                        });
                      }
                    },
                    onPanUpdate: (d) {
                      final isRight = d.localPosition.dx > halfW;
                      final pageNum = _currentPageIndex * 2 + (isRight ? 1 : 0);
                      final localX = isRight ? d.localPosition.dx - halfW : d.localPosition.dx;
                      final localPos = Offset(localX, d.localPosition.dy);
                      if (_eraserMode) {
                        _eraseAtPoint(pageNum, localPos);
                      } else {
                        setState(() {
                          _activeDrawPage = pageNum;
                          _currentPoints = [..._currentPoints, localPos];
                        });
                      }
                    },
                    onPanEnd: (_) {
                      if (!_eraserMode && _currentPoints.isNotEmpty && _activeDrawPage != null) {
                        final pageStrokes = _strokes[_activeDrawPage!] ?? [];
                        pageStrokes.add(_DrawStroke(
                          points: List.from(_currentPoints),
                          color: _penColor,
                          width: _penWidth,
                        ));
                        _strokes[_activeDrawPage!] = pageStrokes;
                        _undoStack[_activeDrawPage!]?.clear();
                        _currentPoints = [];
                        _activeDrawPage = null;
                        _saveStrokes();
                        setState(() {});
                      }
                      _activeDrawPage = null;
                    },
                    child: CustomPaint(
                      size: Size.infinite,
                      painter: _OverlayStrokePainter(
                        activeDrawPage: _activeDrawPage,
                        currentPoints: _currentPoints,
                        penColor: _penColor,
                        penWidth: _penWidth,
                        halfWidth: halfW,
                        leftPageNum: _currentPageIndex * 2,
                      ),
                    ),
                  );
                },
              ),
            ),

          // ===== 浮层：左翻页箭头 =====
          Positioned(
            left: 0, top: 60, bottom: 60,
            child: _buildPageArrow(
              icon: Icons.chevron_left_rounded,
              label: '上一页',
              onTap: _flipLeft,
            ),
          ),

          // ===== 浮层：右翻页箭头 =====
          Positioned(
            right: 0, top: 60, bottom: 60,
            child: _buildPageArrow(
              icon: Icons.chevron_right_rounded,
              label: '下一页',
              onTap: _flipRight,
            ),
          ),

          // ===== 浮层：顶部状态栏（半透明） =====
          Positioned(
            top: 0, left: 0, right: 0,
            child: _buildTopBar(context),
          ),

          // ===== 浮层：底部缩略图条（浮动卡片） =====
          Positioned(
            bottom: 12, left: 0, right: 0,
            child: Center(child: _buildThumbnailBar()),
          ),

          // — 右侧悬浮球（可拖动） —
          Positioned(
            left: _fabExpanded
                ? _fabPosition.dx - 116
                : _fabPosition.dx,
            top: _fabExpanded
                ? _fabPosition.dy - 116
                : _fabPosition.dy,
            child: GestureDetector(
              onPanStart: _fabExpanded ? null : (_) => setState(() => _fabDragging = true),
              onPanUpdate: _fabExpanded ? null : (d) {
                setState(() {
                  _fabPosition = Offset(
                    (_fabPosition.dx + d.delta.dx).clamp(0, layoutW - 70),
                    (_fabPosition.dy + d.delta.dy).clamp(0, layoutH - 70),
                  );
                });
              },
              onPanEnd: _fabExpanded ? null : (_) => setState(() => _fabDragging = false),
              child: _buildRadialFab(),
            ),
          ),

          // — 涂鸦工具栏（画笔模式时显示） —
          if (_drawingMode || _eraserMode)
            Positioned(
              bottom: 100,
              left: layoutW / 2 - 160,
              child: _buildDrawingToolbar(),
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
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.brand,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.menu_book_rounded,
                            size: 16, color: Colors.white),
                        SizedBox(width: 6),
                        Text('电子课本',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            )),
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
                        color: AppColors.success.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.circle, size: 8, color: AppColors.success),
                      SizedBox(width: 6),
                      Text('上课中 · 跟随老师第45页',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.success,
                          )),
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
                        color: AppColors.warning.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.lock_outline_rounded,
                          size: 14, color: AppColors.warning),
                      SizedBox(width: 4),
                      Text('课堂受限中',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppColors.warning,
                          )),
                    ],
                  ),
                ),
                const Spacer(),
                const StatusGroupChip(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  items: [
                    StatusItem(
                        icon: Icons.tablet_mac_rounded,
                        label: '平板已连接',
                        iconColor: AppColors.brand),
                    StatusItem(
                        icon: Icons.cloud_done_outlined,
                        label: '云同步完成',
                        iconColor: AppColors.brandSoft),
                  ],
                ),
          ],  // Row.children
        ),    // Row
      ),      // SafeArea
    );        // Container
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
                  fontSize: 10, color: AppColors.textHint, height: 1.3),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(int pageNum) {
    final header = pageNum % 2 == 0 ? '人民教育出版社' : '';
    final pageStrokes = _strokes[pageNum];
    final hasStrokes = pageStrokes != null && pageStrokes.isNotEmpty;
    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.all(4),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(4)),
          // 简化阴影：使用 spreadRadius 代替高 blurRadius
          boxShadow: [
            BoxShadow(
                color: Color(0x08000000), blurRadius: 4, offset: Offset(0, 1)),
          ],
        ),
        child: Stack(
          children: [
            _buildRealPageOrFallback(pageNum, header),
            // 仅在有笔迹时才创建 CustomPaint，完全避免空绘制开销
            if (hasStrokes)
              CustomPaint(
                size: Size.infinite,
                painter: _StrokePainter(
                  strokes: pageStrokes!,
                  currentPoints: const [],
                  currentColor: _penColor,
                  currentWidth: _penWidth,
                ),
              ),
            // 页码
            Positioned(
              bottom: 12,
              left: 0,
              right: 0,
              child: Center(
                child: Text(
                  '${pageNum + 1}',
                  style: const TextStyle(
                      fontSize: 12, color: AppColors.textMuted),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRealPageOrFallback(int pageNum, String header) {
    final assetPath = _pageAssetPath(pageNum);
    final showAssetSlot = pageNum < _demoRealPageCount;

    if (showAssetSlot) {
      return Positioned.fill(
        child: Image.asset(
          assetPath,
          fit: BoxFit.contain,
          filterQuality: FilterQuality.medium,
          // 启用图片缓存标记
          gaplessPlayback: true,
          errorBuilder: (_, _, _) => _buildFallbackTextbookPage(
            pageNum,
            header,
          ),
        ),
      );
    }

    return _buildFallbackTextbookPage(pageNum, header);
  }

  Widget _buildFallbackTextbookPage(int pageNum, String header) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (header.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                header,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textHint,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: widget.subjectColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: widget.subjectColor.withValues(alpha: 0.2),
              ),
            ),
            child: Text(
              '2. 5，5，3 的倍数',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: widget.subjectColor,
              ),
            ),
          ),
          const SizedBox(height: 20),
          Expanded(child: _buildTextbookPageContent(pageNum)),
        ],
      ),
    );
  }

  Widget _buildTextbookPageContent(int pageNum) {
    final isLeft = pageNum.isEven;
    final sectionColor = widget.subjectColor;
    final content = isLeft
        ? [
            '观察下面这些数：10、25、30、45、60、75。',
            '个位上是 0 或 5 的数，都是 5 的倍数。',
            '各位上数的和是 3 的倍数，这个数就是 3 的倍数。',
            '同时是 2、5 的倍数的数，个位一定是 0。',
          ]
        : [
            '做一做',
            '1. 圈出 2 的倍数：18、27、34、45、60、73。',
            '2. 写出三个同时是 2 和 5 的倍数的两位数。',
            '3. 判断 126、315、420 是否是 3 的倍数，并说出理由。',
          ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isLeft ? '学习目标' : '课堂练习',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: sectionColor,
          ),
        ),
        const SizedBox(height: 10),
        ...content.map((line) => _buildTextbookLine(line, sectionColor)),
        const SizedBox(height: 8),
        if (isLeft)
          _buildRuleCard(
            title: '倍数特征',
            body: '2 的倍数看个位，5 的倍数看个位，3 的倍数看各位数字和。',
            color: sectionColor,
          )
        else
          _buildExerciseGrid(sectionColor),
        const Spacer(),
        Row(
          children: [
            Icon(Icons.auto_awesome_rounded, size: 16, color: sectionColor),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                isLeft ? '同步教材页已导入演示内容，可在页面上直接批注。' : '批注会保留在当前教材中，返回书架再进入仍可看到。',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textMuted,
                  height: 1.35,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTextbookLine(String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 6,
            height: 6,
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 15,
                color: AppColors.textBody,
                height: 1.65,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRuleCard({
    required String title,
    required String body,
    required Color color,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textBody,
              height: 1.55,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExerciseGrid(Color color) {
    final items = ['30', '42', '75', '90'];
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: items.map((item) {
        return Container(
          width: 70,
          height: 44,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withValues(alpha: 0.24)),
          ),
          child: Text(
            item,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildThumbnailBar() {
    final leftPage = _currentPageIndex * 2;
    final rightPage = leftPage + 1;
    return ConstrainedBox(
      constraints: BoxConstraints(
        maxWidth: _thumbnailExpanded ? 700 : 320,
      ),
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
              onTap: () => setState(() => _thumbnailExpanded = !_thumbnailExpanded),
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
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      '${leftPage + 1} / $_totalPages',
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
                    final isSelected = i == leftPage || i == rightPage;
                    return GestureDetector(
                      onTap: () => _goToPage(i ~/ 2),
                      child: Container(
                        width: 76,
                        height: 100,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isSelected ? AppColors.brand : AppColors.border.withValues(alpha: 0.3),
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
                              bottom: 0, left: 0, right: 0,
                              child: Container(
                                color: Colors.black.withValues(alpha: 0.45),
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Text(
                                  '${i + 1}',
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
    if (pageNum < _demoRealPageCount) {
      return Image.asset(
        assetPath,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.low,
        errorBuilder: (_, _, _) => _buildThumbnailPlaceholder(isSelected),
      );
    }
    return _buildThumbnailPlaceholder(isSelected);
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
      _FabItem(icon: Icons.touch_app_rounded, label: '选择', color: const Color(0xFF555555)),
      _FabItem(icon: Icons.category_rounded, label: '图形', color: const Color(0xFF555555)),
      _FabItem(icon: Icons.auto_fix_high_rounded, label: '板擦', color: const Color(0xFF555555)),
      _FabItem(icon: Icons.camera_alt_rounded, label: '拍照', color: const Color(0xFF555555)),
      _FabItem(icon: Icons.more_horiz_rounded, label: '更多', color: const Color(0xFF555555)),
      _FabItem(icon: Icons.cast_for_education_rounded, label: '授课', color: const Color(0xFF555555)),
      _FabItem(icon: Icons.photo_camera_front_rounded, label: '高拍', color: const Color(0xFF555555)),
      _FabItem(icon: Icons.edit_rounded, label: '笔', color: AppColors.brand),
    ];
    const double innerR = 90;
    const double centerR = 34;
    const double outerRingR = 130;
    const double totalSize = outerRingR * 2 + 20;
    final int count = sectors.length;
    final double sectorAngle = 2 * pi / count;
    final showPenRing = _fabSubmenu == '笔' || _drawingMode;

    return AnimatedBuilder(
      animation: _fabExpandAnimation,
      builder: (_, _) {
        final expand = _fabExpandAnimation.value;
        if (expand < 0.01) {
          return GestureDetector(
            onTap: _fabDragging ? null : _toggleFab,
            child: _buildCenterBtn(false),
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
                  opacity: expand.clamp(0.0, 1.0),
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
                final isActive = (item.label == '笔' && _drawingMode) ||
                    (item.label == '板擦' && _eraserMode);
                return Positioned(
                  left: totalSize / 2 + dx - 22,
                  top: totalSize / 2 + dy - 20,
                  child: Transform.scale(
                    scale: expand,
                    child: Opacity(
                      opacity: expand.clamp(0.0, 1.0),
                      child: GestureDetector(
                        onTap: () => _handleFabAction(item.label),
                        child: SizedBox(
                          width: 52,
                          height: 48,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(item.icon, size: 22,
                                  color: isActive ? AppColors.brand : item.color),
                              const SizedBox(height: 2),
                              Text(item.label,
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
                                    color: isActive ? AppColors.brand : item.color,
                                  )),
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
    controls.add(Positioned.fill(
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
    ));

    const colorStart = -210.0;
    const colorStep = 24.0;
    for (var i = 0; i < _colorOptions.length; i++) {
      final color = _colorOptions[i];
      final angle = (colorStart + i * colorStep) * pi / 180;
      controls.add(_buildOuterControl(
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
      ));
    }

    // 弧带2：粗细选择（右下方）
    controls.add(Positioned.fill(
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
    ));

    const widthStart = 26.0;
    const widthStep = 26.0;
    for (var i = 0; i < _widthOptions.length; i++) {
      final width = _widthOptions[i];
      final angle = (widthStart + i * widthStep) * pi / 180;
      controls.add(_buildOuterControl(
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
              decoration: BoxDecoration(color: _penColor, shape: BoxShape.circle),
            ),
          ),
        ),
        onTap: () => setState(() {
          _penWidth = width;
          _drawingMode = true;
          _eraserMode = false;
          _fabSubmenu = '笔';
        }),
      ));
    }

    return controls;
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
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: AppShadows.float,
        gradient: expanded
            ? LinearGradient(colors: [AppColors.brand, AppColors.brandSoft])
            : const SweepGradient(
                colors: [Color(0xFF4285F4), Color(0xFF34A853), Color(0xFFFBBC05), Color(0xFFEA4335), Color(0xFF4285F4)],
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
              : const Text('Ai',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF333333))),
        ),
      ),
    );
  }

  void _handleFabAction(String label) {
    switch (label) {
      case '笔':
        setState(() {
          _drawingMode = true;
          _eraserMode = false;
          _fabSubmenu = '笔';
        });
        break;
      case '板擦':
        setState(() {
          _eraserMode = true;
          _drawingMode = false;
          _fabSubmenu = '板擦';
        });
        break;
      default:
        _toggleFab();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$label 功能即将上线'), duration: const Duration(seconds: 1)),
        );
        break;
    }
  }

  // — 涂鸦工具栏 —
  Widget _buildDrawingToolbar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppShadows.float,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 颜色选择
          ...List.generate(_colorOptions.length, (i) {
            final c = _colorOptions[i];
            final selected = _penColor == c && !_eraserMode;
            return GestureDetector(
              onTap: () => setState(() {
                _penColor = c;
                _drawingMode = true;
                _eraserMode = false;
              }),
              child: Container(
                width: 28,
                height: 28,
                margin: const EdgeInsets.only(right: 6),
                decoration: BoxDecoration(
                  color: c,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: selected ? Colors.white : Colors.transparent,
                    width: 3,
                  ),
                  boxShadow: selected
                      ? [BoxShadow(color: c.withValues(alpha: 0.5), blurRadius: 6)]
                      : null,
                ),
              ),
            );
          }),
          const SizedBox(width: 8),
          Container(width: 1, height: 24, color: AppColors.border),
          const SizedBox(width: 8),
          // 粗细选择
          ...List.generate(_widthOptions.length, (i) {
            final w = _widthOptions[i];
            final selected = _penWidth == w;
            return GestureDetector(
              onTap: () => setState(() => _penWidth = w),
              child: Container(
                width: 28,
                height: 28,
                margin: const EdgeInsets.only(right: 6),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: selected ? AppColors.brand : AppColors.border,
                    width: selected ? 2 : 1,
                  ),
                ),
                child: Center(
                  child: Container(
                    width: w + 2,
                    height: w + 2,
                    decoration: BoxDecoration(
                      color: _eraserMode ? AppColors.textHint : _penColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ),
            );
          }),
          const SizedBox(width: 8),
          Container(width: 1, height: 24, color: AppColors.border),
          const SizedBox(width: 8),
          // 撤销/重做
          IconButton(
            icon: const Icon(Icons.undo_rounded, size: 20),
            onPressed: _undo,
            tooltip: '撤销',
            color: AppColors.textMuted,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          IconButton(
            icon: const Icon(Icons.redo_rounded, size: 20),
            onPressed: _redo,
            tooltip: '重做',
            color: AppColors.textMuted,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          const SizedBox(width: 8),
          // 关闭涂鸦
          IconButton(
            icon: const Icon(Icons.close_rounded, size: 20),
            onPressed: () => setState(() {
              _drawingMode = false;
              _eraserMode = false;
            }),
            tooltip: '关闭涂鸦',
            color: AppColors.danger,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
        ],
      ),
    );
  }
}

class _FabItem {
  final IconData icon;
  final String label;
  final Color color;
  const _FabItem(
      {required this.icon, required this.label, required this.color});
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

class _OuterToolRingPainter extends CustomPainter {
  final Color selectedColor;
  final List<Color> colors;

  const _OuterToolRingPainter({
    required this.selectedColor,
    required this.colors,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    const radius = 100.0;
    const strokeWidth = 16.0;
    final rect = Rect.fromCircle(center: center, radius: radius);

    final basePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..color = Colors.white.withValues(alpha: 0.94);
    canvas.drawArc(rect, -225 * pi / 180, 120 * pi / 180, false, basePaint);
    canvas.drawArc(rect, 18 * pi / 180, 88 * pi / 180, false, basePaint);

    final colorPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;
    for (var i = 0; i < colors.length; i++) {
      colorPaint.color = colors[i].withValues(alpha: 0.82);
      canvas.drawArc(
        rect,
        (-220 + i * 24) * pi / 180,
        16 * pi / 180,
        false,
        colorPaint,
      );
    }

    final selectedPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5
      ..strokeCap = StrokeCap.round
      ..color = selectedColor;
    canvas.drawArc(rect, -224 * pi / 180, 104 * pi / 180, false, selectedPaint);
  }

  @override
  bool shouldRepaint(covariant _OuterToolRingPainter oldDelegate) {
    return selectedColor != oldDelegate.selectedColor ||
        colors != oldDelegate.colors;
  }
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
      center != old.center || radius != old.radius ||
      startAngle != old.startAngle || sweepAngle != old.sweepAngle;
}

class _PageCurlPainter extends CustomPainter {
  final double progress;
  final int direction;

  const _PageCurlPainter({
    required this.progress,
    required this.direction,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0.02 || progress >= 0.98) return;

    // 翻折强度：动画中间最明显，两端消失
    final t = Curves.easeInOutQuad.transform(
      1.0 - (2 * progress - 1).abs(),
    );
    if (t < 0.01) return;

    final isNext = direction >= 0;
    // 折角大小（最大为宽高的 18%）
    final maxFold = size.width * 0.18;
    final foldSize = maxFold * t;

    // 折角位置：翻下一页从右上角折，翻上一页从左上角折
    final cornerX = isNext ? size.width : 0.0;
    const cornerY = 0.0;

    // 三角形翻折路径
    final foldPath = Path();
    if (isNext) {
      // 右上角折
      foldPath
        ..moveTo(cornerX - foldSize * 1.2, cornerY)
        ..quadraticBezierTo(
          cornerX - foldSize * 0.5, cornerY + foldSize * 0.15,
          cornerX, cornerY + foldSize * 1.2,
        )
        ..lineTo(cornerX, cornerY)
        ..close();
    } else {
      // 左上角折
      foldPath
        ..moveTo(cornerX + foldSize * 1.2, cornerY)
        ..quadraticBezierTo(
          cornerX + foldSize * 0.5, cornerY + foldSize * 0.15,
          cornerX, cornerY + foldSize * 1.2,
        )
        ..lineTo(cornerX, cornerY)
        ..close();
    }

    // 阴影
    final shadowPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.12 * t)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);
    canvas.drawPath(
      foldPath.shift(Offset(isNext ? -4 : 4, 3)),
      shadowPaint,
    );

    // 翻折面（纸张背面渐变）
    final gradient = LinearGradient(
      begin: isNext ? Alignment.topRight : Alignment.topLeft,
      end: isNext ? Alignment.bottomLeft : Alignment.bottomRight,
      colors: const [
        Color(0xFFD4C5A9), // 纸张边缘色
        Color(0xFFF0E8D8), // 纸张内侧
        Color(0xFFFAF6EF), // 接近白色
      ],
      stops: const [0.0, 0.4, 1.0],
    );
    final foldPaint = Paint()
      ..shader = gradient.createShader(
        Rect.fromLTWH(
          isNext ? cornerX - foldSize * 1.4 : cornerX,
          cornerY,
          foldSize * 1.4,
          foldSize * 1.4,
        ),
      );
    canvas.drawPath(foldPath, foldPaint);

    // 折痕线
    final creasePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.8
      ..color = Colors.black.withValues(alpha: 0.08);
    canvas.drawPath(foldPath, creasePaint);
  }

  @override
  bool shouldRepaint(covariant _PageCurlPainter oldDelegate) {
    return progress != oldDelegate.progress ||
        direction != oldDelegate.direction;
  }
}

class _DrawStroke {
  final List<Offset> points;
  final Color color;
  final double width;
  const _DrawStroke({
    required this.points,
    required this.color,
    required this.width,
  });
}

class _StrokePainter extends CustomPainter {
  final List<_DrawStroke> strokes;
  final List<Offset> currentPoints;
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
      _drawPath(canvas, s.points, s.color, s.width);
    }
    if (currentPoints.isNotEmpty) {
      _drawPath(canvas, currentPoints, currentColor, currentWidth);
    }
  }

  void _drawPath(
      Canvas canvas, List<Offset> points, Color color, double width) {
    if (points.length < 2) return;
    final paint = Paint()
      ..color = color
      ..strokeWidth = width
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;
    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (var i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _StrokePainter old) => true;
}

/// 涂鸦覆盖层画笔：在全屏覆盖层中渲染正在绘制的实时笔迹
/// 根据 activeDrawPage 确定在左半还是右半偏移渲染
class _OverlayStrokePainter extends CustomPainter {
  final int? activeDrawPage;
  final List<Offset> currentPoints;
  final Color penColor;
  final double penWidth;
  final double halfWidth;
  final int leftPageNum;

  _OverlayStrokePainter({
    required this.activeDrawPage,
    required this.currentPoints,
    required this.penColor,
    required this.penWidth,
    required this.halfWidth,
    required this.leftPageNum,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (activeDrawPage == null || currentPoints.length < 2) return;
    // 判断当前绘制的页是左页还是右页
    final isRight = activeDrawPage == leftPageNum + 1;
    final offsetX = isRight ? halfWidth : 0.0;
    final paint = Paint()
      ..color = penColor
      ..strokeWidth = penWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;
    final path = Path()
      ..moveTo(currentPoints[0].dx + offsetX, currentPoints[0].dy);
    for (var i = 1; i < currentPoints.length; i++) {
      path.lineTo(currentPoints[i].dx + offsetX, currentPoints[i].dy);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _OverlayStrokePainter old) => true;
}

/// 贝塞尔曲线折页裁剪器
/// keepCornerSide=false → 保留折痕左侧（未翻起的当前页）
/// keepCornerSide=true  → 保留折痕右侧（翻起的折回区域）
class _BezierFoldClipper extends CustomClipper<Path> {
  final Offset foldA, foldB, ctrlPt;
  final bool keepCornerSide;
  final double pageW, pageH;

  _BezierFoldClipper({
    required this.foldA,
    required this.foldB,
    required this.ctrlPt,
    required this.keepCornerSide,
    required this.pageW,
    required this.pageH,
  });

  @override
  Path getClip(Size size) {
    // 折痕曲线路径（foldA → ctrlPt → foldB 的二次贝塞尔）
    final curvePath = Path()
      ..moveTo(foldA.dx, foldA.dy)
      ..quadraticBezierTo(ctrlPt.dx, ctrlPt.dy, foldB.dx, foldB.dy);

    if (!keepCornerSide) {
      // 保留远离角落一侧（当前页未翻起部分）
      // 从foldB沿页面边缘**顺时针**远离角落回到foldA
      final path = Path()..addPath(curvePath, Offset.zero);
      _walkEdgesClockwise(path, foldB, foldA, size);
      path.close();
      return path;
    } else {
      // 保留角落侧（折回区域）
      // 从foldB沿边缘**逆时针**朝角落回到foldA
      final path = Path()..addPath(curvePath, Offset.zero);
      _walkEdgesCounterClockwise(path, foldB, foldA, size);
      path.close();
      return path;
    }
  }

  /// 从 start 沿页面边缘逆时针走到 end（用于左侧裁剪）
  void _walkEdgesCounterClockwise(Path path, Offset start, Offset end, Size size) {
    // 简化：收集角点按逆时针顺序 (BL, TL, TR, BR 从左下开始)
    // 但更简单的方法：从foldB的边缘位置开始，依次走过左下、左上等角
    final corners = [
      Offset(0, size.height),   // 左下
      Offset(0, 0),             // 左上
      Offset(size.width, 0),    // 右上
      Offset(size.width, size.height), // 右下
    ];
    // 找start和end所在的边
    final startEdge = _getEdgeIndex(start, size);
    final endEdge = _getEdgeIndex(end, size);

    // 从start出发，逆时针遍历角点直到到达end所在边
    int idx = startEdge;
    for (int i = 0; i < 4; i++) {
      path.lineTo(corners[idx].dx, corners[idx].dy);
      if (idx == endEdge) break;
      idx = (idx + 1) % 4;
    }
    path.lineTo(end.dx, end.dy);
  }

  /// 从 start 沿页面边缘顺时针走到 end（用于右侧裁剪）
  void _walkEdgesClockwise(Path path, Offset start, Offset end, Size size) {
    final corners = [
      Offset(size.width, size.height), // 右下
      Offset(size.width, 0),           // 右上
      Offset(0, 0),                    // 左上
      Offset(0, size.height),          // 左下
    ];
    final startEdge = _getEdgeIndexCW(start, size);
    final endEdge = _getEdgeIndexCW(end, size);

    int idx = startEdge;
    for (int i = 0; i < 4; i++) {
      path.lineTo(corners[idx].dx, corners[idx].dy);
      if (idx == endEdge) break;
      idx = (idx + 1) % 4;
    }
    path.lineTo(end.dx, end.dy);
  }

  /// 逆时针边索引: 0=底边, 1=左边, 2=顶边, 3=右边
  int _getEdgeIndex(Offset p, Size size) {
    if (p.dy >= size.height - 0.5) return 0; // 底边
    if (p.dx <= 0.5) return 1;               // 左边
    if (p.dy <= 0.5) return 2;               // 顶边
    return 3;                                 // 右边
  }

  /// 顺时针边索引: 0=右边, 1=顶边, 2=左边, 3=底边
  int _getEdgeIndexCW(Offset p, Size size) {
    if (p.dx >= size.width - 0.5) return 0;  // 右边
    if (p.dy <= 0.5) return 1;               // 顶边
    if (p.dx <= 0.5) return 2;               // 左边
    return 3;                                 // 底边
  }

  @override
  bool shouldReclip(covariant _BezierFoldClipper old) =>
      foldA != old.foldA || foldB != old.foldB || ctrlPt != old.ctrlPt ||
      keepCornerSide != old.keepCornerSide;
}

/// 折页投影阴影绘制器：沿折痕画渐变阴影
class _PageShadowPainter extends CustomPainter {
  final Offset foldA, foldB, ctrlPt;
  final double cornerX, cornerY;

  _PageShadowPainter({
    required this.foldA,
    required this.foldB,
    required this.ctrlPt,
    required this.cornerX,
    required this.cornerY,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 沿折痕的中心线方向画阴影带
    final foldMidX = (foldA.dx + foldB.dx) / 2;
    final foldMidY = (foldA.dy + foldB.dy) / 2;

    // 阴影方向：从角落指向折痕（在底层页面上）
    final shadowDirX = foldMidX - cornerX;
    final shadowDirY = foldMidY - cornerY;
    final shadowLen = sqrt(shadowDirX * shadowDirX + shadowDirY * shadowDirY);
    if (shadowLen < 1) return;

    final normX = shadowDirX / shadowLen;
    final normY = shadowDirY / shadowLen;

    // 阴影带宽度
    const shadowW = 25.0;

    // 沿折痕画阴影条带
    final shadowPath = Path()
      ..moveTo(foldA.dx, foldA.dy)
      ..quadraticBezierTo(ctrlPt.dx, ctrlPt.dy, foldB.dx, foldB.dy)
      ..lineTo(foldB.dx - normX * shadowW, foldB.dy - normY * shadowW)
      ..quadraticBezierTo(
        ctrlPt.dx - normX * shadowW,
        ctrlPt.dy - normY * shadowW,
        foldA.dx - normX * shadowW,
        foldA.dy - normY * shadowW,
      )
      ..close();

    final shadowPaint = Paint()
      ..shader = ui.Gradient.linear(
        Offset(foldMidX, foldMidY),
        Offset(foldMidX - normX * shadowW, foldMidY - normY * shadowW),
        [
          Colors.black.withValues(alpha: 0.30),
          Colors.transparent,
        ],
      );

    canvas.drawPath(shadowPath, shadowPaint);
  }

  @override
  bool shouldRepaint(covariant _PageShadowPainter old) =>
      foldA != old.foldA || foldB != old.foldB;
}
