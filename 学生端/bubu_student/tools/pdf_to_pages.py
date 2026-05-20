#!/usr/bin/env python3
"""
教材 PDF → PNG 批量转换脚本 (方案 A)

使用方法:
  1. 安装依赖：pip install PyMuPDF Pillow
  2. 将教材 PDF 放到 `input_pdfs/` 目录
  3. 运行：python pdf_to_pages.py
  4. 输出 PNG 到 `assets/images/textbook_pages/` 下

参数可选:
  --input  指定输入目录（默认 input_pdfs）
  --output 指定输出目录（默认 assets/images/textbook_pages）
  --dpi    渲染 DPI（默认 150，平衡清晰度与文件体积）
  --max-width  最大宽度像素（默认 1024，超出自动缩放）
"""

import argparse
import os
import sys

def main():
    parser = argparse.ArgumentParser(description='教材 PDF → PNG 批量转换')
    parser.add_argument('--input', default='input_pdfs', help='PDF 输入目录')
    parser.add_argument('--output', default='assets/images/textbook_pages', help='PNG 输出目录')
    parser.add_argument('--dpi', type=int, default=150, help='渲染 DPI（默认 150）')
    parser.add_argument('--max-width', type=int, default=1024, help='最大宽度像素（默认 1024）')
    parser.add_argument('--format', default='png', choices=['png', 'jpg'], help='输出格式')
    parser.add_argument('--quality', type=int, default=85, help='JPG 质量（默认 85）')
    args = parser.parse_args()

    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("❌ 需要安装 PyMuPDF: pip install PyMuPDF")
        sys.exit(1)

    try:
        from PIL import Image
    except ImportError:
        print("❌ 需要安装 Pillow: pip install Pillow")
        sys.exit(1)

    if not os.path.isdir(args.input):
        print(f"❌ 找不到输入目录: {args.input}")
        print(f"   请创建 '{args.input}/' 并将 PDF 文件放入其中")
        sys.exit(1)

    pdf_files = sorted([
        f for f in os.listdir(args.input)
        if f.lower().endswith('.pdf')
    ])

    if not pdf_files:
        print(f"⚠️  输入目录 '{args.input}/' 中没有 PDF 文件")
        sys.exit(0)

    os.makedirs(args.output, exist_ok=True)

    print(f"📚 找到 {len(pdf_files)} 个 PDF 文件")
    print(f"📁 输出到: {args.output}/")
    print(f"🔧 DPI={args.dpi}, 最大宽度={args.max_width}px, 格式={args.format}")
    print()

    total_pages = 0
    for pdf_file in pdf_files:
        pdf_path = os.path.join(args.input, pdf_file)
        doc = fitz.open(pdf_path)
        page_count = len(doc)
        book_name = os.path.splitext(pdf_file)[0]

        print(f"📖 {pdf_file} ({page_count} 页)")

        for page_idx in range(page_count):
            page = doc[page_idx]
            # 按 DPI 渲染
            zoom = args.dpi / 72.0
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)

            # 转为 PIL Image 处理
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # 如果超过最大宽度，等比缩放
            if img.width > args.max_width:
                ratio = args.max_width / img.width
                new_size = (args.max_width, int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)

            # 输出文件名: page_001.png
            page_num_str = str(total_pages + 1).zfill(3)
            ext = args.format
            out_name = f"page_{page_num_str}.{ext}"
            out_path = os.path.join(args.output, out_name)

            if ext == 'jpg':
                img.save(out_path, 'JPEG', quality=args.quality, optimize=True)
            else:
                img.save(out_path, 'PNG', optimize=True)

            size_kb = os.path.getsize(out_path) / 1024
            print(f"  ✅ {out_name} ({img.width}x{img.height}, {size_kb:.0f}KB)")
            total_pages += 1

        doc.close()

    print()
    print(f"🎉 完成！共转换 {total_pages} 页")
    print(f"   输出位置: {os.path.abspath(args.output)}/")

    # 生成/更新 README
    readme_path = os.path.join(args.output, 'README.md')
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(f"# 教材页面资源\n\n")
        f.write(f"此目录包含 {total_pages} 页教材 PNG/JPG 资源。\n\n")
        f.write(f"## 生成参数\n")
        f.write(f"- DPI: {args.dpi}\n")
        f.write(f"- 最大宽度: {args.max_width}px\n")
        f.write(f"- 格式: {args.format}\n\n")
        f.write(f"## 来源 PDF\n")
        for pdf_file in pdf_files:
            f.write(f"- {pdf_file}\n")
        f.write(f"\n## 使用方式\n")
        f.write(f"将本目录放置到 `学生端/bubu_student/assets/images/textbook_pages/`\n")

if __name__ == '__main__':
    main()
