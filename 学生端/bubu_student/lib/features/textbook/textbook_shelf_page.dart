import 'package:flutter/material.dart';

import '../../app/tokens.dart';
import '../../core/widgets/status_chip.dart';
import '../../core/widgets/tablet_frame.dart';
import 'data/textbook_catalog.dart';
import 'models/textbook_resource.dart';
import 'textbook_reader_page.dart';

/// S02 电子课本书架页。
///
/// 本页归当前 Codex 负责：书架视觉、真实封面、catalog 数据接入。
/// 阅读器细节由 Antigravity 并行推进，避免同时修改 reader 文件。
class TextbookShelfPage extends StatefulWidget {
  const TextbookShelfPage({super.key});

  @override
  State<TextbookShelfPage> createState() => _TextbookShelfPageState();
}

class _TextbookShelfPageState extends State<TextbookShelfPage> {
  int _selectedSubjectIndex = 0;

  List<String> get _subjects => TextbookCatalog.allSubjects;

  String get _selectedSubject => _subjects[_selectedSubjectIndex];

  List<TextbookResource> get _visibleTextbooks =>
      TextbookCatalog.getFiltered(subject: _selectedSubject);

  TextbookResource get _recentTextbook => TextbookCatalog.grade5Up.firstWhere(
        (item) => item.id == TextbookCatalog.recentReading.textbookId,
        orElse: () => TextbookCatalog.grade5Up.first,
      );

  void _openReader(TextbookResource textbook) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => TabletFrame(
          child: TextbookReaderPage(
            subjectName: textbook.subject,
            subjectColor: _subjectColor(textbook),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: SafeArea(
        top: false,
        bottom: false,
        child: Column(
          children: [
            _buildTopBar(context),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.page),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: AppSpacing.lg),
                    _buildTitleRow(),
                    const SizedBox(height: AppSpacing.lg),
                    _buildSubjectTabs(),
                    const SizedBox(height: AppSpacing.lg),
                    Expanded(child: _buildTextbookGrid()),
                  ],
                ),
              ),
            ),
            _buildRecentReadingBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Container(
      color: AppColors.chromeBg,
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.page,
          vertical: 12,
        ),
        child: Row(
          children: [
            InkWell(
              onTap: () => Navigator.of(context).pop(),
              borderRadius: BorderRadius.circular(8),
              child: const Padding(
                padding: EdgeInsets.all(4),
                child: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 20,
                  color: AppColors.textBody,
                ),
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '电子课本',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textTitle,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  '五年级（3）班 · 人教版',
                  style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
              ],
            ),
            const Spacer(),
            const StatusGroupChip(
              padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              items: [
                StatusItem(
                  icon: Icons.tablet_mac_rounded,
                  label: '平板已连接',
                  iconColor: AppColors.brand,
                ),
                StatusItem(
                  icon: Icons.wifi_rounded,
                  label: '网络良好',
                  iconColor: AppColors.success,
                ),
                StatusItem(
                  icon: Icons.cloud_done_outlined,
                  label: '云同步完成',
                  iconColor: AppColors.brandSoft,
                ),
              ],
            ),
            const SizedBox(width: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(AppRadius.button),
                border: Border.all(color: AppColors.brand, width: 1.3),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.calendar_today_rounded,
                    size: 16,
                    color: AppColors.brand,
                  ),
                  SizedBox(width: 5),
                  Text(
                    '课表',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.brand,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitleRow() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        const Text(
          '五年级电子课本',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: AppColors.textTitle,
          ),
        ),
        const SizedBox(width: 12),
        const Text(
          '非上课时段，可自由选择教材阅读',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textMuted,
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: AppColors.brandSurface,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            '已接入 ${TextbookCatalog.grade5Up.length} 本真实封面',
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.brand,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubjectTabs() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(_subjects.length, (index) {
          final selected = index == _selectedSubjectIndex;
          final subject = _subjects[index];
          final count = TextbookCatalog.getFiltered(subject: subject).length;
          return Padding(
            padding: EdgeInsets.only(right: index < _subjects.length - 1 ? 10 : 0),
            child: InkWell(
              onTap: () => setState(() => _selectedSubjectIndex = index),
              borderRadius: BorderRadius.circular(20),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  color: selected ? AppColors.brand : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: selected ? null : Border.all(color: AppColors.border),
                  boxShadow: selected ? AppShadows.card : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      subject,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: selected ? Colors.white : AppColors.textBody,
                      ),
                    ),
                    if (count > 0) ...[
                      const SizedBox(width: 6),
                      Text(
                        '$count',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: selected
                              ? Colors.white.withValues(alpha: 0.82)
                              : AppColors.textHint,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildTextbookGrid() {
    final visibleTextbooks = _visibleTextbooks;
    return GridView.builder(
      padding: const EdgeInsets.only(bottom: AppSpacing.lg),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 16,
        crossAxisSpacing: 18,
        childAspectRatio: 0.68,
      ),
      itemCount: visibleTextbooks.length,
      itemBuilder: (_, index) {
        final textbook = visibleTextbooks[index];
        return _TextbookCoverCard(
          textbook: textbook,
          color: _subjectColor(textbook),
          onTap: () => _openReader(textbook),
        );
      },
    );
  }

  Widget _buildRecentReadingBar() {
    final progress = TextbookCatalog.recentReading;
    final textbook = _recentTextbook;
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.page,
        vertical: 14,
      ),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.brandSurface,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.access_time_rounded, size: 18, color: AppColors.brand),
                SizedBox(width: 6),
                Text(
                  '最近阅读',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brand,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          _CoverThumb(textbook: textbook, color: _subjectColor(textbook)),
          const SizedBox(width: 12),
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${textbook.subject}  ${textbook.grade}年级${textbook.semester} · 第${progress.currentPage}页',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textTitle,
                ),
              ),
              const SizedBox(height: 3),
              const Text(
                '上次阅读：今天 09:30',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
            ],
          ),
          const Spacer(),
          SizedBox(
            width: 180,
            child: LinearProgressIndicator(
              value: progress.percent.clamp(0, 1),
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation(AppColors.brand),
              borderRadius: BorderRadius.circular(999),
              minHeight: 5,
            ),
          ),
          const SizedBox(width: 18),
          FilledButton(
            onPressed: () => _openReader(textbook),
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999),
              ),
            ),
            child: const Text('继续阅读  >'),
          ),
        ],
      ),
    );
  }

  Color _subjectColor(TextbookResource textbook) {
    return Color(TextbookCatalog.subjectColors[textbook.subject] ?? 0xFF2C6BFF);
  }
}

class _TextbookCoverCard extends StatelessWidget {
  final TextbookResource textbook;
  final Color color;
  final VoidCallback onTap;

  const _TextbookCoverCard({
    required this.textbook,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final hasProgress = textbook.id == TextbookCatalog.recentReading.textbookId ||
        textbook.subject == '语文';
    final progressText = textbook.id == TextbookCatalog.recentReading.textbookId
        ? '最近阅读  第${TextbookCatalog.recentReading.currentPage}页'
        : hasProgress
            ? '最近阅读  第32页'
            : '未开始';

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.card - 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Hero(
              tag: 'textbook-${textbook.id}',
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(AppRadius.card - 4),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppShadows.card,
                ),
                clipBehavior: Clip.antiAlias,
                child: _buildCover(),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            textbook.displayName,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textTitle,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            progressText,
            style: TextStyle(
              fontSize: 12,
              color: hasProgress ? AppColors.success : AppColors.textMuted,
              fontWeight: hasProgress ? FontWeight.w500 : FontWeight.w400,
            ),
          ),
          if (hasProgress) ...[
            const SizedBox(height: 4),
            LinearProgressIndicator(
              value: textbook.id == TextbookCatalog.recentReading.textbookId
                  ? TextbookCatalog.recentReading.percent.clamp(0, 1)
                  : 0.23,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation(AppColors.brand),
              borderRadius: BorderRadius.circular(3),
              minHeight: 4,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCover() {
    final assetPath = textbook.coverAssetPath;
    if (assetPath != null && assetPath.isNotEmpty) {
      return Image.asset(
        assetPath,
        fit: BoxFit.cover,
        filterQuality: FilterQuality.high,
      );
    }

    return Container(
      color: color,
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.menu_book_rounded,
            size: 40,
            color: Colors.white.withValues(alpha: 0.9),
          ),
          const SizedBox(height: 8),
          Text(
            textbook.subject,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _CoverThumb extends StatelessWidget {
  final TextbookResource textbook;
  final Color color;

  const _CoverThumb({required this.textbook, required this.color});

  @override
  Widget build(BuildContext context) {
    final assetPath = textbook.coverAssetPath;
    return Container(
      width: 36,
      height: 48,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: assetPath == null
          ? Icon(Icons.menu_book, size: 20, color: color)
          : Image.asset(assetPath, fit: BoxFit.cover),
    );
  }
}
