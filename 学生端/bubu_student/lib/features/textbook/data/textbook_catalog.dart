import '../models/textbook_resource.dart';
import 'textbook_catalog.generated.dart';

/// 五年级真实教材目录。
class TextbookCatalog {
  TextbookCatalog._();

  static const Map<String, int> subjectColors = {
    '语文': 0xFFE65A3A,
    '数学': 0xFF2C6BFF,
    '英语': 0xFF23C06B,
    '科学': 0xFF36B5C0,
    '道德与法治': 0xFF9D5AF5,
    '美术': 0xFFF5943A,
    '音乐': 0xFFE54D70,
    '信息科技': 0xFF0F8B8D,
  };

  static List<String> get allSubjects {
    final seen = <String>{};
    final subjects = <String>['全部'];
    for (final item in grade5Textbooks) {
      if (seen.add(item.subject)) subjects.add(item.subject);
    }
    return subjects;
  }

  static final List<TextbookResource> grade5Textbooks =
      generatedTextbookManifest.map(_book).toList(growable: false);

  // 兼容现有书架调用点；这里现在代表五年级全部真实教材。
  static List<TextbookResource> get grade5Up => grade5Textbooks;

  static TextbookResource _book(TextbookManifestEntry book) {
    return TextbookResource(
      id: book.id,
      subject: book.subject,
      grade: book.grade,
      semester: book.semester,
      edition: book.edition,
      pageCount: book.pageCount,
      bodyStartPageIndex: book.bodyStartPageIndex,
      coverPageIndex: book.coverPageIndex,
      coverAssetPath: book.cover,
      pageAssets: _pageAssets(book.pagePattern, book.pageCount),
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
      sourcePlatform: '教材素材包',
      notes: book.sourcePdf,
    );
  }

  static List<String> _pageAssets(String pagePattern, int pageCount) {
    return List.generate(
      pageCount,
      (index) => pagePattern.replaceFirst(
        '###',
        (index + 1).toString().padLeft(3, '0'),
      ),
      growable: false,
    );
  }

  static List<TextbookResource> getFiltered({String? subject}) {
    if (subject == null || subject == '全部') return grade5Textbooks;
    return grade5Textbooks.where((t) => t.subject == subject).toList();
  }

  static ReadingProgress get recentReading {
    final textbook = grade5Textbooks.firstWhere(
      (item) => item.id == 'g5-up-shuxue',
      orElse: () => grade5Textbooks.first,
    );
    final currentPage = textbook.bodyPageCount >= 45
        ? 45
        : textbook.bodyPageCount;
    return ReadingProgress(
      textbookId: textbook.id,
      currentPage: currentPage,
      totalPages: textbook.bodyPageCount,
      lastRead: DateTime.now().subtract(const Duration(hours: 2)),
    );
  }

  static final List<TextbookResource> pendingGrades = [
    for (final grade in [4, 6])
      for (final sem in ['上册', '下册'])
        for (final subject in ['语文', '数学', '英语', '科学', '道德与法治', '美术', '音乐'])
          TextbookResource(
            id: 'g$grade-${sem == '上册' ? 'up' : 'down'}-$subject',
            subject: subject,
            grade: grade,
            semester: sem,
            importStatus: ImportStatus.pending,
            notes: '待导入',
          ),
  ];
}
