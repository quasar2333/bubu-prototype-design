import 'package:flutter/material.dart';

import '../../app/tokens.dart';
import '../../core/widgets/status_chip.dart';

class CoursewarePage extends StatefulWidget {
  const CoursewarePage({super.key});

  @override
  State<CoursewarePage> createState() => _CoursewarePageState();
}

class _CoursewarePageState extends State<CoursewarePage> {
  int _selectedIndex = 0;

  static const _slides = [
    _CoursewareSlide(
      title: '8.2 一元一次不等式',
      subtitle: '第1课时 · 数学课件',
      bullets: ['理解不等式解集', '掌握移项与合并同类项', '能用数轴表示解集'],
      teacherNote: '课前先回顾等式性质，再对比不等式两边同乘负数时方向会改变。',
    ),
    _CoursewareSlide(
      title: '不等式的性质',
      subtitle: '核心概念',
      bullets: ['两边同时加减同一个数，不等号方向不变', '两边同时乘除正数，不等号方向不变', '两边同时乘除负数，不等号方向改变'],
      teacherNote: '这里是本节易错点，课堂会重点举例说明。',
    ),
    _CoursewareSlide(
      title: '例题讲解',
      subtitle: '解不等式 3x - 5 > 7',
      bullets: ['移项：3x > 12', '系数化为 1：x > 4', '在数轴上画空心点并向右延伸'],
      teacherNote: '演示时可让学生先口算，再打开电子课本做批注。',
    ),
    _CoursewareSlide(
      title: '课堂练习',
      subtitle: '同步检测',
      bullets: ['2x + 1 < 9', '5 - x ≥ 2', '-3x < 12'],
      teacherNote: '完成后自动同步课堂笔记，错题进入错题本。',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_selectedIndex];
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: SafeArea(
        child: Column(
          children: [
            _buildTopBar(context),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.page),
                child: Row(
                  children: [
                    _buildSlideList(),
                    const SizedBox(width: AppSpacing.xl),
                    Expanded(child: _buildSlidePreview(slide)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Container(
      color: AppColors.chromeBg,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        children: [
          InkWell(
            onTap: () => Navigator.of(context).pop(),
            borderRadius: BorderRadius.circular(AppRadius.button),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.subjectOrange,
                borderRadius: BorderRadius.circular(AppRadius.button),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.ondemand_video_rounded,
                      color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text(
                    '课件查看',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 14),
          const StatusGroupChip(
            items: [
              StatusItem(
                icon: Icons.cloud_done_outlined,
                label: '老师课件已同步',
                iconColor: AppColors.success,
              ),
            ],
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          ),
          const Spacer(),
          const StatusGroupChip(
            items: [
              StatusItem(
                icon: Icons.school_rounded,
                label: '刘老师',
                iconColor: AppColors.subjectOrange,
              ),
              StatusItem(
                icon: Icons.timer_rounded,
                label: '课前 12 分钟',
                iconColor: AppColors.warning,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSlideList() {
    return Container(
      width: 240,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '同步课件',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppColors.textTitle,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            '数学 · 第1课时 · 已导入 4 页',
            style: TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
          const SizedBox(height: AppSpacing.lg),
          Expanded(
            child: ListView.separated(
              itemCount: _slides.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (_, index) {
                final selected = index == _selectedIndex;
                final slide = _slides[index];
                return InkWell(
                  onTap: () => setState(() => _selectedIndex = index),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: selected
                          ? AppColors.subjectOrangeBg
                          : AppColors.pageBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: selected
                            ? AppColors.subjectOrange
                            : AppColors.border,
                        width: selected ? 1.6 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Text(
                          '${index + 1}',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: selected
                                ? AppColors.subjectOrange
                                : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            slide.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textBody,
                              fontWeight: FontWeight.w600,
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
        ],
      ),
    );
  }

  Widget _buildSlidePreview(_CoursewareSlide slide) {
    return Container(
      padding: const EdgeInsets.all(34),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.subjectOrangeBg,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              slide.subtitle,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.subjectOrange,
              ),
            ),
          ),
          const SizedBox(height: 28),
          Text(
            slide.title,
            style: const TextStyle(
              fontSize: 38,
              height: 1.15,
              fontWeight: FontWeight.w900,
              color: AppColors.textTitle,
            ),
          ),
          const SizedBox(height: 30),
          ...slide.bullets.map(_buildBullet),
          const Spacer(),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.pageBg,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.edit_note_rounded,
                    color: AppColors.subjectOrange, size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    slide.teacherNote,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textBody,
                      height: 1.45,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 26,
            height: 26,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: AppColors.subjectOrangeBg,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_rounded,
                size: 17, color: AppColors.subjectOrange),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 22,
                color: AppColors.textBody,
                height: 1.4,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CoursewareSlide {
  final String title;
  final String subtitle;
  final List<String> bullets;
  final String teacherNote;

  const _CoursewareSlide({
    required this.title,
    required this.subtitle,
    required this.bullets,
    required this.teacherNote,
  });
}
