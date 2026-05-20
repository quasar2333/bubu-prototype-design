/// 电子课本数据模型。

/// 出版社
enum Publisher {
  pep('人民教育出版社', '人教版'),
  bsd('北京师范大学出版社', '北师大版'),
  su('江苏教育出版社', '苏教版'),
  unknown('未知', '未知');

  final String fullName;
  final String shortName;
  const Publisher(this.fullName, this.shortName);
}

/// 导入状态
enum ImportStatus {
  imported('已导入'),
  pending('待导入'),
  failed('导入失败'),
  notAvailable('不可获取');

  final String label;
  const ImportStatus(this.label);
}

/// 版权状态
enum LicenseStatus {
  licensed('已授权'),
  openAccess('公开获取'),
  pending('待确认'),
  unknown('状态不明');

  final String label;
  const LicenseStatus(this.label);
}

/// 资源类型
enum ResourceType {
  textbook('教材'),
  teachingAid('教辅');

  final String label;
  const ResourceType(this.label);
}

/// 教材资源实体
class TextbookResource {
  final String id;
  final ResourceType resourceType;
  final String subject;
  final int grade;
  final String semester;  // '上册' / '下册'
  final Publisher publisher;
  final String edition;
  final int priority;  // P0..P3
  final String? coverAssetPath;
  final List<String> pageAssets;
  final int pageCount;
  final List<TocEntry> toc;
  final String? sourceUrl;
  final String? sourcePlatform;
  final LicenseStatus licenseStatus;
  final ImportStatus importStatus;
  final String? notes;

  const TextbookResource({
    required this.id,
    this.resourceType = ResourceType.textbook,
    required this.subject,
    required this.grade,
    required this.semester,
    this.publisher = Publisher.pep,
    this.edition = '2024版',
    this.priority = 0,
    this.coverAssetPath,
    this.pageAssets = const [],
    this.pageCount = 0,
    this.toc = const [],
    this.sourceUrl,
    this.sourcePlatform,
    this.licenseStatus = LicenseStatus.pending,
    this.importStatus = ImportStatus.pending,
    this.notes,
  });

  /// 显示名称
  String get displayName => '$subject  ${grade}年级$semester';

  /// 短名
  String get shortName => '$subject ${grade}年级$semester';
}

/// 目录条目
class TocEntry {
  final String title;
  final int page;
  final List<TocEntry> children;

  const TocEntry({
    required this.title,
    required this.page,
    this.children = const [],
  });
}

/// 阅读进度
class ReadingProgress {
  final String textbookId;
  final int currentPage;
  final int totalPages;
  final DateTime lastRead;

  const ReadingProgress({
    required this.textbookId,
    required this.currentPage,
    required this.totalPages,
    required this.lastRead,
  });

  double get percent => totalPages > 0 ? currentPage / totalPages : 0;
}

/// 涂鸦笔迹模型
class DrawingStroke {
  final List<StrokePoint> points;
  final StrokeColor color;
  final double width;
  final StrokeTool tool;
  final int pageIndex;
  final DateTime createdAt;

  const DrawingStroke({
    required this.points,
    required this.color,
    this.width = 3.0,
    this.tool = StrokeTool.pen,
    required this.pageIndex,
    required this.createdAt,
  });
}

class StrokePoint {
  final double x;
  final double y;
  final double pressure;

  const StrokePoint(this.x, this.y, {this.pressure = 1.0});
}

enum StrokeTool {
  pen('笔'),
  highlighter('荧光笔'),
  eraser('橡皮');

  final String label;
  const StrokeTool(this.label);
}

enum StrokeColor {
  blue(0xFF2C6BFF, '蓝'),
  red(0xFFE54D42, '红'),
  green(0xFF23C06B, '绿'),
  orange(0xFFF5943A, '橙'),
  purple(0xFF9D5AF5, '紫');

  final int value;
  final String label;
  const StrokeColor(this.value, this.label);
}
