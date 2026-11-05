"""Read DOCX body text locally without macros, external URLs, or writing output files.

Usage: python read-docx.py PATH
Output may contain PRIVATE homework/PII. Use only in private agent context;
never redirect it to this public repository or commit logs/output.
Does not render equations, images, geometry marks, headers, or comments.
"""
import argparse
import json
from pathlib import Path
import sys
import zipfile
from xml.etree import ElementTree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
M = "http://schemas.openxmlformats.org/officeDocument/2006/math"
MAX_BYTES = 16 * 1024 * 1024


def inspect_docx(path):
    path = Path(path)
    if path.suffix.lower() != ".docx":
        raise ValueError("Only .docx is supported; use a safe native reader for other formats.")
    with zipfile.ZipFile(path) as archive:
        infos = archive.infolist()
        if len(infos) > 5000 or sum(i.file_size for i in infos) > MAX_BYTES:
            raise ValueError("Document exceeds local inspection limits.")
        names = {i.filename for i in infos}
        if any("vbaproject" in n.lower() for n in names):
            raise ValueError("Macro content is not supported.")
        raw = archive.read("word/document.xml")
        if b"<!DOCTYPE" in raw.upper() or b"<!ENTITY" in raw.upper():
            raise ValueError("XML declarations with entities are not supported.")
        root = ET.fromstring(raw)
        paragraphs = []
        for p in root.iter(f"{{{W}}}p"):
            fragments = []
            for el in p.iter():
                if el.tag in (f"{{{W}}}t", f"{{{M}}}t"):
                    fragments.append(el.text or "")
                elif el.tag == f"{{{W}}}tab":
                    fragments.append("\t")
                elif el.tag in (f"{{{W}}}br", f"{{{W}}}cr"):
                    fragments.append("\n")
            if fragments:
                paragraphs.append("".join(fragments))
        return {
            "paragraphs": paragraphs,
            "requires_visual_review": True,
            "embedded_media_count": sum(n.startswith("word/media/") for n in names),
            "equation_count": sum(1 for _ in root.iter(f"{{{M}}}oMath")),
            "warning": "Text inspection only. Visually inspect diagrams, equations, marks, tables, and layout before teaching."
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path")
    args = parser.parse_args()
    try:
        result = inspect_docx(args.path)
        sys.stdout.reconfigure(encoding="utf-8")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (ValueError, OSError, KeyError, zipfile.BadZipFile, ET.ParseError) as exc:
        print(f"Cannot inspect DOCX safely: {exc}", file=sys.stderr)
        sys.exit(1)

