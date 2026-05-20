import argparse
import concurrent.futures
import glob
import json
import os
import re
import shutil
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import fitz
from PIL import Image


DEFAULT_MANIFEST = Path(__file__).with_name("textbook_import_manifest.json")
ASSET_MANIFEST = Path("assets/images/textbook_manifest.json")
GENERATED_CATALOG = Path(
    "lib/features/textbook/data/textbook_catalog.generated.dart"
)


@dataclass(frozen=True)
class BookSpec:
    id: str
    source_pdf: str
    subject: str
    grade: int
    semester: str
    edition: str
    pdf_index: int | None = None
    body_start_page_index: int | None = None
    cover_page_index: int = 0


@dataclass(frozen=True)
class RenderJob:
    spec: BookSpec
    pdf_path: Path
    source_pdf: str
    pages_dir: Path
    covers_dir: Path
    render_scale: float
    max_edge: int
    quality: int
    lossless: bool


def _normalized_path(value: str) -> str:
    return value.replace("\\", "/").strip("/")


def _slug(value: str) -> str:
    return re.sub(r"[^0-9A-Za-z_.-]+", "_", value).strip("_")


def _dart_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def find_default_source() -> Path:
    patterns = [
        r"D:\Downloads\教材素材包 (2).zip",
        r"D:\Downloads\教材素材包*.zip",
        r"D:\Downloads\*(2).zip",
    ]
    for pattern in patterns:
        matches = sorted(glob.glob(pattern), key=lambda p: Path(p).stat().st_mtime)
        if matches:
            return Path(matches[-1])
    raise FileNotFoundError(
        "No textbook source was provided and no textbook ZIP was found in D:\\Downloads"
    )


def load_specs(manifest_path: Path) -> list[BookSpec]:
    raw = json.loads(manifest_path.read_text(encoding="utf-8"))
    books = raw["books"] if isinstance(raw, dict) else raw
    specs: list[BookSpec] = []
    for index, item in enumerate(books):
        source_pdf = item.get("sourcePdf") or item.get("source") or ""
        pdf_index = item.get("pdfIndex", item.get("pdf_index"))
        specs.append(
            BookSpec(
                id=item["id"],
                source_pdf=source_pdf,
                subject=item["subject"],
                grade=int(item.get("grade", 5)),
                semester=item["semester"],
                edition=item.get("edition", ""),
                pdf_index=int(pdf_index) if pdf_index is not None else index,
                body_start_page_index=item.get("bodyStartPageIndex"),
                cover_page_index=int(item.get("coverPageIndex", 0)),
            )
        )
    return specs


def match_pdf(spec: BookSpec, pdf_names: list[str]) -> str:
    requested = _normalized_path(spec.source_pdf)
    if requested:
        for name in pdf_names:
            normalized = _normalized_path(name)
            if normalized == requested or normalized.endswith(requested):
                return name
        requested_name = Path(requested).name
        for name in pdf_names:
            if Path(name).name == requested_name:
                return name
    if spec.pdf_index is not None and 0 <= spec.pdf_index < len(pdf_names):
        return pdf_names[spec.pdf_index]
    raise FileNotFoundError(f"Could not match a PDF for {spec.id}")


def prepare_pdf_sources(
    source_path: Path,
    specs: list[BookSpec],
) -> tuple[tempfile.TemporaryDirectory[str] | None, list[tuple[BookSpec, str, Path]]]:
    if source_path.is_file() and source_path.suffix.lower() == ".zip":
        temp_dir = tempfile.TemporaryDirectory(prefix="bubu-textbooks-")
        temp_path = Path(temp_dir.name)
        resolved: list[tuple[BookSpec, str, Path]] = []
        with zipfile.ZipFile(source_path) as archive:
            pdf_names = [
                name
                for name in archive.namelist()
                if not name.endswith("/") and name.lower().endswith(".pdf")
            ]
            for spec in specs:
                pdf_name = match_pdf(spec, pdf_names)
                extracted = temp_path / f"{_slug(spec.id)}.pdf"
                extracted.write_bytes(archive.read(pdf_name))
                resolved.append((spec, pdf_name, extracted))
        return temp_dir, resolved

    if source_path.is_dir():
        pdf_paths = sorted(source_path.rglob("*.pdf"))
        rel_names = {
            _normalized_path(str(path.relative_to(source_path))): path
            for path in pdf_paths
        }
        resolved = []
        rel_name_list = list(rel_names.keys())
        for spec in specs:
            matched_name = match_pdf(spec, rel_name_list)
            resolved.append((spec, matched_name, rel_names[matched_name]))
        return None, resolved

    if source_path.is_file() and source_path.suffix.lower() == ".pdf":
        if len(specs) != 1:
            raise ValueError("A single PDF source can only be used with one --only book")
        return None, [(specs[0], source_path.name, source_path)]

    raise FileNotFoundError(f"Unsupported textbook source: {source_path}")


def render_page(page: fitz.Page, render_scale: float, max_edge: int) -> Image.Image:
    pix = page.get_pixmap(
        matrix=fitz.Matrix(render_scale, render_scale),
        alpha=False,
        colorspace=fitz.csRGB,
    )
    image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    if max_edge > 0:
        scale = min(1.0, max_edge / max(image.size))
        if scale < 1.0:
            image = image.resize(
                (round(image.width * scale), round(image.height * scale)),
                Image.Resampling.LANCZOS,
            )
    return image


def _footer_numbers(page: fitz.Page) -> list[tuple[int, float]]:
    page_dict = page.get_text("dict")
    height = page.rect.height
    numbers: list[tuple[int, float]] = []
    digit_map = str.maketrans("０１２３４５６７８９", "0123456789")
    for block in page_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            text = "".join(span.get("text", "") for span in line.get("spans", []))
            text = text.strip().translate(digit_map)
            if not re.fullmatch(r"\d{1,3}", text):
                continue
            bbox = line.get("bbox") or block.get("bbox")
            if not bbox:
                continue
            center_y = (bbox[1] + bbox[3]) / 2
            if center_y > height * 0.78:
                numbers.append((int(text), center_y))
    return numbers


def infer_body_start_page_index(doc: fitz.Document) -> int:
    for page_index in range(min(20, doc.page_count)):
        numbers = _footer_numbers(doc.load_page(page_index))
        plausible = [(number, y) for number, y in numbers if 1 <= number <= 4]
        if not plausible:
            continue
        number, _ = max(plausible, key=lambda item: item[1])
        return max(0, page_index - (number - 1))
    return 1 if doc.page_count > 1 else 0


def render_book(job: RenderJob) -> dict[str, Any]:
    doc = fitz.open(str(job.pdf_path))
    page_count = doc.page_count
    body_start = (
        job.spec.body_start_page_index
        if job.spec.body_start_page_index is not None
        else infer_body_start_page_index(doc)
    )
    body_start = max(0, min(int(body_start), max(0, page_count - 1)))
    cover_page = max(0, min(job.spec.cover_page_index, max(0, page_count - 1)))

    for page_index in range(page_count):
        image = render_page(doc.load_page(page_index), job.render_scale, job.max_edge)
        output = job.pages_dir / f"{job.spec.id}_page_{page_index + 1:03d}.webp"
        save_kwargs: dict[str, Any] = {"method": 6}
        if job.lossless:
            save_kwargs["lossless"] = True
        else:
            save_kwargs["quality"] = job.quality
        image.save(output, "WEBP", **save_kwargs)
        if page_index == cover_page:
            shutil.copyfile(output, job.covers_dir / f"{job.spec.id}.webp")

    return {
        "id": job.spec.id,
        "subject": job.spec.subject,
        "grade": job.spec.grade,
        "semester": job.spec.semester,
        "edition": job.spec.edition,
        "pageCount": page_count,
        "bodyStartPageIndex": body_start,
        "coverPageIndex": cover_page,
        "bodyPageCount": max(0, page_count - body_start),
        "cover": f"assets/images/textbook_covers/{job.spec.id}.webp",
        "pagePattern": f"assets/images/textbook_pages/{job.spec.id}_page_###.webp",
        "sourcePdf": job.source_pdf,
        "renderScale": job.render_scale,
        "maxEdge": job.max_edge,
        "quality": job.quality if not job.lossless else None,
        "lossless": job.lossless,
    }


def clean_book_assets(project_root: Path, book_ids: list[str]) -> None:
    pages_dir = project_root / "assets/images/textbook_pages"
    covers_dir = project_root / "assets/images/textbook_covers"
    for book_id in book_ids:
        for path in pages_dir.glob(f"{book_id}_page_*.webp"):
            path.unlink()
        cover_path = covers_dir / f"{book_id}.webp"
        if cover_path.exists():
            cover_path.unlink()


def merge_manifest(
    project_root: Path,
    rendered: list[dict[str, Any]],
    preserve_existing: bool,
) -> list[dict[str, Any]]:
    manifest_path = project_root / ASSET_MANIFEST
    if not preserve_existing or not manifest_path.exists():
        return rendered

    existing = json.loads(manifest_path.read_text(encoding="utf-8"))
    by_id = {item["id"]: item for item in existing}
    for item in rendered:
        by_id[item["id"]] = item

    ordered_ids = [item["id"] for item in existing]
    for item in rendered:
        if item["id"] not in ordered_ids:
            ordered_ids.append(item["id"])
    return [by_id[book_id] for book_id in ordered_ids]


def write_generated_catalog(project_root: Path, manifest: list[dict[str, Any]]) -> None:
    lines = [
        "// GENERATED CODE - DO NOT EDIT BY HAND.",
        "// Run `python tool/import_textbooks.py --sync-catalog-only` after changing",
        "// assets/images/textbook_manifest.json or tool/textbook_import_manifest.json.",
        "",
        "class TextbookManifestEntry {",
        "  final String id;",
        "  final String subject;",
        "  final int grade;",
        "  final String semester;",
        "  final String edition;",
        "  final int pageCount;",
        "  final int bodyStartPageIndex;",
        "  final int coverPageIndex;",
        "  final String cover;",
        "  final String pagePattern;",
        "  final String sourcePdf;",
        "",
        "  const TextbookManifestEntry({",
        "    required this.id,",
        "    required this.subject,",
        "    required this.grade,",
        "    required this.semester,",
        "    required this.edition,",
        "    required this.pageCount,",
        "    required this.bodyStartPageIndex,",
        "    required this.coverPageIndex,",
        "    required this.cover,",
        "    required this.pagePattern,",
        "    required this.sourcePdf,",
        "  });",
        "}",
        "",
        "const List<TextbookManifestEntry> generatedTextbookManifest = [",
    ]
    for item in manifest:
        lines.extend(
            [
                "  TextbookManifestEntry(",
                f"    id: {_dart_string(item['id'])},",
                f"    subject: {_dart_string(item['subject'])},",
                f"    grade: {int(item.get('grade', 5))},",
                f"    semester: {_dart_string(item['semester'])},",
                f"    edition: {_dart_string(item.get('edition', ''))},",
                f"    pageCount: {int(item['pageCount'])},",
                f"    bodyStartPageIndex: {int(item.get('bodyStartPageIndex', 0))},",
                f"    coverPageIndex: {int(item.get('coverPageIndex', 0))},",
                f"    cover: {_dart_string(item['cover'])},",
                f"    pagePattern: {_dart_string(item['pagePattern'])},",
                f"    sourcePdf: {_dart_string(item.get('sourcePdf', ''))},",
                "  ),",
            ]
        )
    lines.extend(["];", ""])
    output = project_root / GENERATED_CATALOG
    output.write_text("\n".join(lines), encoding="utf-8")


def write_manifests(project_root: Path, manifest: list[dict[str, Any]]) -> None:
    asset_manifest_path = project_root / ASSET_MANIFEST
    asset_manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_generated_catalog(project_root, manifest)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import textbook PDFs into Flutter assets with high-quality rendering."
    )
    parser.add_argument("source", nargs="?", help="Textbook ZIP, PDF directory, or one PDF")
    parser.add_argument("--zip", dest="legacy_zip", help="Deprecated alias for source")
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    parser.add_argument("--only", nargs="*", help="Import only the listed textbook ids")
    parser.add_argument("--workers", type=int, default=max(1, min((os.cpu_count() or 4) // 2, 6)))
    parser.add_argument("--render-scale", type=float, default=4.0)
    parser.add_argument("--max-edge", type=int, default=3200)
    parser.add_argument("--quality", type=int, default=96)
    parser.add_argument("--lossless", action="store_true")
    parser.add_argument("--allow-low-quality", action="store_true")
    parser.add_argument("--preserve-existing", action="store_true")
    parser.add_argument("--no-clean", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--sync-catalog-only",
        action="store_true",
        help="Regenerate the Dart catalog from assets/images/textbook_manifest.json.",
    )
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[1]

    if args.sync_catalog_only:
        manifest = json.loads((project_root / ASSET_MANIFEST).read_text(encoding="utf-8"))
        write_generated_catalog(project_root, manifest)
        print(f"Regenerated {project_root / GENERATED_CATALOG}")
        return

    if args.max_edge and args.max_edge < 2400 and not args.allow_low_quality:
        raise ValueError(
            "--max-edge below 2400 can make textbook text fuzzy. "
            "Use --allow-low-quality only for fast smoke tests."
        )

    manifest_path = Path(args.manifest)
    if not manifest_path.is_absolute():
        manifest_path = project_root / manifest_path
    specs = load_specs(manifest_path)
    if args.only:
        selected = set(args.only)
        specs = [spec for spec in specs if spec.id in selected]
        missing = selected.difference({spec.id for spec in specs})
        if missing:
            raise ValueError(f"Unknown textbook ids: {', '.join(sorted(missing))}")
    if not specs:
        raise ValueError("No textbooks selected")

    source_arg = args.source or args.legacy_zip
    source_path = Path(source_arg) if source_arg else find_default_source()
    source_path = source_path.expanduser().resolve()

    print(f"Source: {source_path}")
    print(f"Books: {len(specs)}")
    print(
        "Render: "
        f"scale={args.render_scale}, maxEdge={args.max_edge}, "
        f"quality={'lossless' if args.lossless else args.quality}, "
        f"workers={args.workers}"
    )

    temp_dir, resolved = prepare_pdf_sources(source_path, specs)
    try:
        for spec, pdf_name, _ in resolved:
            print(f"  {spec.id}: {pdf_name}")
        if args.dry_run:
            print("Dry run complete; no files were changed.")
            return

        pages_dir = project_root / "assets/images/textbook_pages"
        covers_dir = project_root / "assets/images/textbook_covers"
        pages_dir.mkdir(parents=True, exist_ok=True)
        covers_dir.mkdir(parents=True, exist_ok=True)

        if not args.no_clean:
            clean_book_assets(project_root, [spec.id for spec, _, _ in resolved])

        jobs = [
            RenderJob(
                spec=spec,
                pdf_path=pdf_path,
                source_pdf=pdf_name,
                pages_dir=pages_dir,
                covers_dir=covers_dir,
                render_scale=args.render_scale,
                max_edge=args.max_edge,
                quality=args.quality,
                lossless=args.lossless,
            )
            for spec, pdf_name, pdf_path in resolved
        ]

        rendered: list[dict[str, Any]] = []
        with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers) as pool:
            future_to_id = {pool.submit(render_book, job): job.spec.id for job in jobs}
            for future in concurrent.futures.as_completed(future_to_id):
                book_id = future_to_id[future]
                item = future.result()
                rendered.append(item)
                print(
                    f"Imported {book_id}: {item['pageCount']} images, "
                    f"body starts at asset {item['bodyStartPageIndex'] + 1}"
                )

        order = {spec.id: index for index, spec in enumerate(specs)}
        rendered.sort(key=lambda item: order.get(item["id"], 9999))
        preserve = args.preserve_existing or bool(args.only)
        manifest = merge_manifest(project_root, rendered, preserve_existing=preserve)
        write_manifests(project_root, manifest)

        total_pages = sum(item["pageCount"] for item in rendered)
        print(f"Imported {len(rendered)} textbooks / {total_pages} page images")
        print(f"Wrote {project_root / ASSET_MANIFEST}")
        print(f"Wrote {project_root / GENERATED_CATALOG}")
    finally:
        if temp_dir is not None:
            temp_dir.cleanup()


if __name__ == "__main__":
    main()
