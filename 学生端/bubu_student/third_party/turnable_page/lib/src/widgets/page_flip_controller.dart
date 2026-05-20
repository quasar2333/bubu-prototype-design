import 'package:flutter/rendering.dart';

import '../enums/flip_corner.dart';
import '../event/event_object.dart';
import '../model/page_rect.dart';
import '../page/page_flip.dart';

class TurnablePageHit {
  final int pageIndex;
  final Offset localPosition;
  final Size pageSize;

  const TurnablePageHit({
    required this.pageIndex,
    required this.localPosition,
    required this.pageSize,
  });
}

class PageFlipController {
  late PageFlip _pageFlip;

  void initializeController({required PageFlip pageFlip}) {
    _pageFlip = pageFlip;
  }

  /// Internal setter for the PageFlip instance
  set pageFlip(PageFlip pageFlip) => _pageFlip = pageFlip;

  /// Get the current page index (0-based)
  int get currentPageIndex => _pageFlip.getCurrentPageIndex();

  /// Get the total number of pages
  int get pageCount => _pageFlip.getPageCount();

  /// Check if there is a next page available
  bool get hasNextPage =>
      currentPageIndex + (_pageFlip.getSettings.usePortrait ? 0 : 1) <
      (pageCount - 1);

  /// Check if there is a previous page available
  bool get hasPreviousPage => currentPageIndex > 0;

  /// Flip to the next page
  ///
  /// [corner] - The corner to flip from (default: top)
  /// Returns true if the flip was successful, false if already at the last page
  bool nextPage([FlipCorner corner = FlipCorner.top]) {
    if (!hasNextPage) return false;
    _pageFlip.flipNext(corner);

    return true;
  }

  /// Flip to the previous page
  /// [corner] - The corner to flip from (default: top)
  /// Returns true if the flip was successful, false if already at the first page
  bool previousPage([FlipCorner corner = FlipCorner.top]) {
    if (!hasPreviousPage) return false;
    _pageFlip.flipPrev(corner);

    return true;
  }

  /// Go to a specific page
  /// [pageIndex] - The page index to navigate to (0-based)
  /// Returns true if the navigation was successful, false if the page index is invalid
  bool goToPage(int pageIndex) {
    if (pageIndex < 0 || pageIndex >= pageCount) return false;
    _pageFlip.flip(pageIndex, FlipCorner.top);

    return true;
  }

  /// Go to the first page
  bool goToFirstPage() => goToPage(0);

  /// Go to the last page
  bool goToLastPage() => goToPage(pageCount - 1);

  /// Register an event listener
  /// [event] - The event name ('flip', 'changeOrientation', etc.)
  /// [callback] - The callback function to execute
  void addEventListener(String event, EventCallback callback) {
    _pageFlip.on(event, callback);
  }

  /// Remove an event listener
  /// [event] - The event name
  void removeEventListener(String event) {
    _pageFlip.off(event);
  }

  /// Get the underlying PageFlip instance for advanced operations
  /// Use this only when you need direct access to PageFlip methods
  /// not exposed through this controller
  PageFlip? get pageFlipInstance => _pageFlip;

  TurnablePageHit? hitTestVisiblePage(Offset globalPosition) {
    try {
      final renderPage = _pageFlip.getRender();
      final rect = _pageFlip.getBoundsRect();
      if (renderPage is! RenderBox || rect == null) {
        return null;
      }
      final render = renderPage as RenderBox;
      if (!render.hasSize) return null;
      return _hitTestPageInRect(
        globalPosition: globalPosition,
        render: render,
        rect: rect,
      );
    } catch (_) {
      return null;
    }
  }

  TurnablePageHit? _hitTestPageInRect({
    required Offset globalPosition,
    required RenderBox render,
    required PageRect rect,
  }) {
    final local = render.globalToLocal(globalPosition);
    if (local.dx < rect.left ||
        local.dx > rect.right ||
        local.dy < rect.top ||
        local.dy > rect.bottom) {
      return null;
    }

    final localX = local.dx - rect.left;
    final localY = local.dy - rect.top;
    final pageSize = Size(rect.pageWidth, rect.height);

    if (_pageFlip.getSettings.usePortrait) {
      final pageIndex = _pageFlip.getCurrentPageIndex();
      if (pageIndex < 0 || pageIndex >= pageCount) return null;
      final pageLocalX = (localX - rect.pageWidth).clamp(0.0, rect.pageWidth);
      return TurnablePageHit(
        pageIndex: pageIndex,
        localPosition: Offset(pageLocalX, localY),
        pageSize: pageSize,
      );
    }

    final currentPage = _pageFlip.getCurrentPageIndex();
    final isLeftPage = localX < rect.pageWidth;
    final showCover = _pageFlip.getSettings.showCover;

    if (showCover && currentPage == 0) {
      if (isLeftPage) return null;
      return TurnablePageHit(
        pageIndex: 0,
        localPosition: Offset(localX - rect.pageWidth, localY),
        pageSize: pageSize,
      );
    }

    if (showCover && currentPage == pageCount - 1 && currentPage.isOdd) {
      if (!isLeftPage) return null;
      return TurnablePageHit(
        pageIndex: currentPage,
        localPosition: Offset(localX, localY),
        pageSize: pageSize,
      );
    }

    final pageIndex = currentPage + (isLeftPage ? 0 : 1);
    if (pageIndex < 0 || pageIndex >= pageCount) return null;

    return TurnablePageHit(
      pageIndex: pageIndex,
      localPosition: Offset(
        isLeftPage ? localX : localX - rect.pageWidth,
        localY,
      ),
      pageSize: pageSize,
    );
  }
}
