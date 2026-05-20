import '../models/textbook_resource.dart';

/// Mock 教材目录：五年级上册 8 本 + 其余年级标记 pending。
///
/// 数据遵循 Task.md 要求：
///   - 已有资源明确标记为 imported
///   - 缺失资源标记为 pending / notAvailable
///   - Mock 数据命名明确，不伪装真实导入
class TextbookCatalog {
  TextbookCatalog._();

  // ─── 学科颜色映射 ──────────────────────
  static const Map<String, int> subjectColors = {
    '语文': 0xFFE65A3A,
    '数学': 0xFF2C6BFF,
    '英语': 0xFF23C06B,
    '科学': 0xFF36B5C0,
    '道德与法治': 0xFF9D5AF5,
    '美术': 0xFFF5943A,
    '音乐': 0xFFE54D70,
  };

  static const List<String> allSubjects = [
    '全部',
    '语文',
    '数学',
    '英语',
    '科学',
    '道德与法治',
    '美术',
    '音乐',
  ];

  // ─── 五年级上册（Mock 已导入） ────────────
  static final List<TextbookResource> grade5Up = [
    const TextbookResource(
      id: 'g5-up-yuwen',
      subject: '语文',
      grade: 5,
      semester: '上册',
      pageCount: 138,
      coverAssetPath: 'assets/images/textbook_covers/g5_up_yuwen.jpg',
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
      sourceUrl: 'https://jc.pep.com.cn/',
      sourcePlatform: '人教版官网',
      notes: 'Mock 占位，待替换真实页面',
    ),
    const TextbookResource(
      id: 'g5-up-shuxue',
      subject: '数学',
      grade: 5,
      semester: '上册',
      pageCount: 128,
      coverAssetPath: 'assets/images/textbook_covers/g5_up_shuxue.jpg',
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
      sourceUrl: 'https://jc.pep.com.cn/',
      sourcePlatform: '人教版官网',
    ),
    const TextbookResource(
      id: 'g5-up-yingyu',
      subject: '英语',
      grade: 5,
      semester: '上册',
      pageCount: 96,
      coverAssetPath: 'assets/images/textbook_covers/g5_up_yingyu_pep.jpg',
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
      sourceUrl: 'https://jc.pep.com.cn/',
      sourcePlatform: '人教版官网',
      notes: 'PEP 版',
    ),
    const TextbookResource(
      id: 'g5-up-kexue',
      subject: '科学',
      grade: 5,
      semester: '上册',
      pageCount: 112,
      coverAssetPath: 'assets/images/textbook_covers/g5_up_kexue.jpg',
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
    ),
    const TextbookResource(
      id: 'g5-up-daode',
      subject: '道德与法治',
      grade: 5,
      semester: '上册',
      pageCount: 88,
      coverAssetPath: 'assets/images/textbook_covers/g5_up_daode.jpg',
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
    ),
    const TextbookResource(
      id: 'g5-up-meishu',
      subject: '美术',
      grade: 5,
      semester: '上册',
      pageCount: 64,
      coverAssetPath: 'assets/images/textbook_covers/g5_up_meishu.jpg',
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
    ),
    const TextbookResource(
      id: 'g5-up-yinyue',
      subject: '音乐',
      grade: 5,
      semester: '上册',
      pageCount: 72,
      coverAssetPath: 'assets/images/textbook_covers/g5_up_yinyue_jianpu.jpg',
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
    ),
    const TextbookResource(
      id: 'g5-up-xjp',
      subject: '习近平学生读本',
      grade: 5,
      semester: '上册',
      pageCount: 48,
      coverAssetPath: 'assets/images/textbook_covers/g5_up_xjp.jpg',
      importStatus: ImportStatus.imported,
      licenseStatus: LicenseStatus.openAccess,
      notes: '习近平新时代中国特色社会主义思想学生读本',
    ),
  ];

  /// 获取书架显示用的当前年级教材（带筛选）
  static List<TextbookResource> getFiltered({String? subject}) {
    if (subject == null || subject == '全部') return grade5Up;
    return grade5Up.where((t) => t.subject == subject).toList();
  }

  /// 获取最近阅读记录（Mock）
  static ReadingProgress get recentReading => ReadingProgress(
        textbookId: 'g5-up-shuxue',
        currentPage: 45,
        totalPages: 128,
        lastRead: DateTime.now().subtract(const Duration(hours: 2)),
      );

  // ─── 其余年级（待导入）──────────────────
  static final List<TextbookResource> pendingGrades = [
    for (final grade in [4, 5, 6])
      for (final sem in ['上册', '下册'])
        if (!(grade == 5 && sem == '上册')) // 五年级上册已有
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
