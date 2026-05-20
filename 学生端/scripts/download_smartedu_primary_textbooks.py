#!/usr/bin/env python3
import argparse
import concurrent.futures
import csv
import json
import os
import re
import shutil
import sys
import threading
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


VERSION_URL = "https://s-file-2.ykt.cbern.com.cn/zxx/ndrs/resources/tch_material/version/data_version.json"
DETAIL_HOSTS = (
    "https://s-file-2.ykt.cbern.com.cn/zxx/ndrv2/resources/tch_material/details/{id}.json",
    "https://s-file-1.ykt.cbern.com.cn/zxx/ndrv2/resources/tch_material/details/{id}.json",
)
THEMATIC_LIST_URL = "https://s-file-1.ykt.cbern.com.cn/zxx/ndrs/special_edu/thematic_course/{id}/resources/list.json"
SOURCE_PAGE = (
    "https://basic.smartedu.cn/tchMaterial/detail?"
    "contentType={content_type}&contentId={id}&catalogType=tchMaterial&subCatalog=tchMaterial"
)

PRIMARY_STAGES = {"\u5c0f\u5b66", "\u5c0f\u5b66\uff08\u4e94\u2022\u56db\u5b66\u5236\uff09"}
TARGET_GRADES = {
    "\u4e09\u5e74\u7ea7",
    "\u56db\u5e74\u7ea7",
    "\u4e94\u5e74\u7ea7",
    "\u516d\u5e74\u7ea7",
    "\u5b66\u751f\u8bfb\u672c",
}
TEACHER_BOOK = "\u6559\u5e08\u7528\u4e66"
USAGE_NOTE = "\u4f7f\u7528\u8bf4\u660e"

INVALID_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1f]')
SPACES = re.compile(r"\s+")
PRINT_LOCK = threading.Lock()


def fetch_json(url, timeout=60):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def sanitize(value, fallback="未分类", max_len=90):
    value = str(value or fallback)
    value = INVALID_CHARS.sub("_", value)
    value = SPACES.sub(" ", value).strip(" .")
    if not value:
        value = fallback
    return value[:max_len].rstrip(" .")


def tags_map(item):
    tags = {}
    for tag in item.get("tag_list") or []:
        tags[tag.get("tag_dimension_id")] = tag.get("tag_name")
    return tags


def is_target_item(item):
    tags = tags_map(item)
    title = item.get("title") or ""
    return (
        item.get("status") == "ONLINE"
        and tags.get("zxxxd") in PRIMARY_STAGES
        and tags.get("zxxnj") in TARGET_GRADES
        and TEACHER_BOOK not in title
        and TEACHER_BOOK not in (tags.get("zxxnj") or "")
    )


def source_page_url(item):
    content_type = item.get("resource_type_code") or "assets_document"
    return SOURCE_PAGE.format(content_type=content_type, id=item["id"])


def pdf_from_resource(resource):
    candidates = []
    for ti in resource.get("ti_items") or []:
        if (ti.get("ti_format") or "").lower() != "pdf":
            continue
        storages = ti.get("ti_storages") or []
        url = storages[0] if storages else ""
        if not url:
            continue
        candidates.append(
            {
                "url": url,
                "size": int(ti.get("ti_size") or 0),
                "md5": ti.get("ti_md5") or "",
                "is_source": bool(ti.get("ti_is_source_file")),
                "flag": ti.get("ti_file_flag") or "",
            }
        )
    if not candidates:
        return None
    candidates.sort(key=lambda c: (not c["is_source"], c["flag"] != "source", -c["size"]))
    return candidates[0]


def fetch_asset_document(item):
    last_error = None
    for template in DETAIL_HOSTS:
        url = template.format(id=item["id"])
        try:
            detail = fetch_json(url)
            pdf = pdf_from_resource(detail)
            if not pdf:
                raise RuntimeError("detail has no PDF item")
            return detail, pdf
        except Exception as exc:
            last_error = exc
    raise RuntimeError(str(last_error))


def fetch_thematic_document(item):
    resources = fetch_json(THEMATIC_LIST_URL.format(id=item["id"]))
    pdf_resources = []
    for resource in resources:
        props = resource.get("custom_properties") or {}
        title = resource.get("title") or ""
        if resource.get("resource_type_code") != "assets_document":
            continue
        if (props.get("format") or "").lower() != "pdf":
            continue
        if USAGE_NOTE in title:
            continue
        pdf = pdf_from_resource(resource)
        if pdf:
            pdf_resources.append((resource, pdf))
    if not pdf_resources:
        raise RuntimeError("thematic course has no textbook PDF")
    return pdf_resources[0]


def build_record(item, out_dir):
    tags = tags_map(item)
    try:
        if item.get("resource_type_code") == "thematic_course":
            detail, pdf = fetch_thematic_document(item)
        else:
            detail, pdf = fetch_asset_document(item)

        title = detail.get("title") or item.get("title") or item["id"]
        providers = detail.get("provider_list") or item.get("provider_list") or []
        provider = "、".join(p.get("name") for p in providers if p.get("name"))
        stage = tags.get("zxxxd") or ""
        grade = tags.get("zxxnj") or ""
        subject = tags.get("zxxxk") or ""
        version = tags.get("zxxbb") or "未标注版本"
        volume = tags.get("zxxcc") or "未标注册次"

        rel_dir = Path(sanitize(grade)) / sanitize(subject) / sanitize(version)
        filename = f"{sanitize(volume, max_len=24)}_{sanitize(title, max_len=105)}_{detail.get('id', item['id'])[:8]}.pdf"
        file_path = out_dir / rel_dir / filename
        return {
            "status": "pending",
            "error": "",
            "catalog_id": item["id"],
            "resource_id": detail.get("id") or item["id"],
            "stage": stage,
            "grade": grade,
            "subject": subject,
            "version": version,
            "volume": volume,
            "title": title,
            "provider": provider,
            "size_bytes": pdf["size"],
            "md5": pdf["md5"],
            "source_page": source_page_url(item),
            "pdf_url": pdf["url"],
            "file_path": str(file_path),
        }
    except Exception as exc:
        return {
            "status": "metadata_error",
            "error": str(exc),
            "catalog_id": item.get("id") or "",
            "resource_id": "",
            "stage": tags.get("zxxxd") or "",
            "grade": tags.get("zxxnj") or "",
            "subject": tags.get("zxxxk") or "",
            "version": tags.get("zxxbb") or "未标注版本",
            "volume": tags.get("zxxcc") or "未标注册次",
            "title": item.get("title") or "",
            "provider": "",
            "size_bytes": 0,
            "md5": "",
            "source_page": source_page_url(item) if item.get("id") else "",
            "pdf_url": "",
            "file_path": "",
        }


def write_manifests(records, out_dir):
    fields = [
        "status",
        "error",
        "catalog_id",
        "resource_id",
        "stage",
        "grade",
        "subject",
        "version",
        "volume",
        "title",
        "provider",
        "size_bytes",
        "md5",
        "source_page",
        "pdf_url",
        "file_path",
    ]
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = out_dir / "教材清单.csv"
    json_path = out_dir / "教材清单.json"
    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(records)
    with json_path.open("w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    return csv_path, json_path


def download_one(record, retries=3, chunk_size=1024 * 1024):
    url = record["pdf_url"]
    dest = Path(record["file_path"])
    expected = int(record.get("size_bytes") or 0)
    if not url or not dest:
        return "metadata_error", 0, "missing url or path"

    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and (expected <= 0 or dest.stat().st_size == expected):
        return "skipped", dest.stat().st_size, ""

    part = dest.with_suffix(dest.suffix + ".part")
    for attempt in range(1, retries + 1):
        try:
            resume_at = part.stat().st_size if part.exists() else 0
            headers = {"User-Agent": "Mozilla/5.0"}
            if resume_at:
                headers["Range"] = f"bytes={resume_at}-"
            req = Request(url, headers=headers)
            with urlopen(req, timeout=90) as resp:
                if resume_at and getattr(resp, "status", 200) == 200:
                    resume_at = 0
                    part.unlink(missing_ok=True)
                mode = "ab" if resume_at else "wb"
                with part.open(mode) as f:
                    shutil.copyfileobj(resp, f, length=chunk_size)

            actual = part.stat().st_size
            if expected and actual != expected:
                raise RuntimeError(f"size mismatch: got {actual}, expected {expected}")
            os.replace(part, dest)
            return "downloaded", dest.stat().st_size, ""
        except (HTTPError, URLError, TimeoutError, RuntimeError, OSError) as exc:
            if attempt == retries:
                return "download_error", part.stat().st_size if part.exists() else 0, str(exc)
            time.sleep(min(10, 2 * attempt))
    return "download_error", 0, "unknown error"


def download_all(records, workers):
    targets = [r for r in records if r.get("pdf_url")]
    total = len(targets)
    total_bytes = sum(int(r.get("size_bytes") or 0) for r in targets)
    done = 0
    done_bytes = 0
    started = time.time()

    def task(record):
        status, size, error = download_one(record)
        record["status"] = status
        record["error"] = error
        return record, size

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(task, record) for record in targets]
        for future in concurrent.futures.as_completed(futures):
            record, size = future.result()
            done += 1
            done_bytes += size
            elapsed = max(time.time() - started, 1)
            rate = done_bytes / elapsed / 1024 / 1024
            with PRINT_LOCK:
                print(
                    f"[{done}/{total}] {record['status']} "
                    f"{done_bytes/1024/1024/1024:.2f}/{total_bytes/1024/1024/1024:.2f}GB "
                    f"{rate:.1f}MB/s {record['grade']} {record['subject']} {record['version']} {record['volume']}",
                    flush=True,
                )
    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="教材PDF/小学3-6年级_国家平台")
    parser.add_argument("--metadata-workers", type=int, default=16)
    parser.add_argument("--download-workers", type=int, default=4)
    parser.add_argument("--manifest-only", action="store_true")
    args = parser.parse_args()

    out_dir = Path(args.out).resolve()
    print("Fetching official SmartEdu textbook catalog...", flush=True)
    version = fetch_json(VERSION_URL)
    items = []
    for url in version["urls"].split(","):
        items.extend(fetch_json(url))

    selected = [item for item in items if is_target_item(item)]
    print(f"Catalog module version: {version.get('module_version')}", flush=True)
    print(f"Selected catalog entries: {len(selected)}", flush=True)

    records = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.metadata_workers) as pool:
        futures = [pool.submit(build_record, item, out_dir) for item in selected]
        for idx, future in enumerate(concurrent.futures.as_completed(futures), 1):
            records.append(future.result())
            if idx % 50 == 0 or idx == len(selected):
                print(f"Resolved PDF metadata: {idx}/{len(selected)}", flush=True)

    records.sort(key=lambda r: (r["grade"], r["subject"], r["version"], r["volume"], r["title"]))
    csv_path, json_path = write_manifests(records, out_dir)
    ok = sum(1 for r in records if r["status"] == "pending")
    failed = len(records) - ok
    total_gb = sum(int(r.get("size_bytes") or 0) for r in records) / 1024 / 1024 / 1024
    print(f"Manifest written: {csv_path}", flush=True)
    print(f"Metadata ok: {ok}, failed: {failed}, expected size: {total_gb:.2f}GB", flush=True)

    if not args.manifest_only:
        records = download_all(records, args.download_workers)
        write_manifests(records, out_dir)
        downloaded = sum(1 for r in records if r["status"] in {"downloaded", "skipped"})
        errors = sum(1 for r in records if r["status"].endswith("_error"))
        print(f"Finished. Downloaded/skipped: {downloaded}, errors: {errors}", flush=True)


if __name__ == "__main__":
    sys.exit(main())
