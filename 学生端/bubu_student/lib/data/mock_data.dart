/// 学生信息（与原型完全一致）。
class StudentProfile {
  final String name;
  final String klass;
  final String avatarAsset;
  const StudentProfile({
    required this.name,
    required this.klass,
    required this.avatarAsset,
  });
}

/// 当前 / 即将开始的课堂信息。
class CurrentClassInfo {
  final int minutesUntilStart; // 距离课堂开始还有 X 分钟
  final String periodLabel; // 例：第1课时 · 数学
  final String chapterTitle; // 例：8.2 一元一次不等式
  final String teacherName; // 例：刘老师
  final String subject; // 例：数学
  final List<String> tips;
  final String illustrationAsset;

  const CurrentClassInfo({
    required this.minutesUntilStart,
    required this.periodLabel,
    required this.chapterTitle,
    required this.teacherName,
    required this.subject,
    required this.tips,
    required this.illustrationAsset,
  });
}

/// 主页 5 个快捷入口。
class HomeShortcut {
  final String title;
  final String subtitle;
  final String iconAsset;

  const HomeShortcut({
    required this.title,
    required this.subtitle,
    required this.iconAsset,
  });
}

class MockData {
  MockData._();

  static const student = StudentProfile(
    name: '张子涵',
    klass: '五年级（3）班',
    avatarAsset: 'assets/images/avatar_zhang.png',
  );

  static const currentClass = CurrentClassInfo(
    minutesUntilStart: 12,
    periodLabel: '第1课时 · 数学',
    chapterTitle: '8.2 一元一次不等式',
    teacherName: '刘老师',
    subject: '数学',
    tips: [
      '上课后将进入课堂受限模式',
      '可提前查看教材与课件',
    ],
    illustrationAsset: 'assets/images/illu_pre_class_materials.png',
  );

  /// 顶部状态栏时间（与原型一致）。
  static const statusTime = '9:41';
  static const statusDate = '5月16日 周五';

  static const shortcuts = <HomeShortcut>[
    HomeShortcut(
      title: '电子课本',
      subtitle: '同步阅读  标注',
      iconAsset: 'assets/images/icon_textbook.png',
    ),
    HomeShortcut(
      title: '课堂笔记',
      subtitle: '随堂记录  回顾',
      iconAsset: 'assets/images/icon_notebook.png',
    ),
    HomeShortcut(
      title: '作业',
      subtitle: '作业查看  提交',
      iconAsset: 'assets/images/icon_homework.png',
    ),
    HomeShortcut(
      title: '错题本',
      subtitle: '错题收集  复习',
      iconAsset: 'assets/images/icon_errorbook.png',
    ),
    HomeShortcut(
      title: '课件查看',
      subtitle: '老师课件  回看',
      iconAsset: 'assets/images/icon_courseware.png',
    ),
  ];
}
