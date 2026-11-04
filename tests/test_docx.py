"""Synthetic input tests; no real learner documents or generated lesson content."""
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
import zipfile

script = Path(__file__).resolve().parents[1] / "skills/geometry-teach/scripts/read-docx.py"
spec = importlib.util.spec_from_file_location("read_docx", script)
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)


class DocxInspectionTests(unittest.TestCase):
    def test_body_math_and_media_are_reported_without_extraction(self):
        with tempfile.TemporaryDirectory(prefix="geometry-docx-", dir=os.environ.get("GEOMETRY_QA_TEMP")) as temp:
            doc = Path(temp) / "synthetic.docx"
            with zipfile.ZipFile(doc, "w") as archive:
                archive.writestr("word/document.xml", '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><w:body><w:p><w:r><w:t>Compare shapes</w:t></w:r><m:oMath><m:r><m:t>x</m:t></m:r></m:oMath></w:p></w:body></w:document>')
                archive.writestr("word/media/synthetic.png", b"synthetic")
                archive.writestr("../../do-not-extract.txt", "synthetic")
            result = reader.inspect_docx(doc)
            self.assertEqual(result["paragraphs"], ["Compare shapesx"])
            self.assertEqual(result["equation_count"], 1)
            self.assertEqual(result["embedded_media_count"], 1)
            self.assertTrue(result["requires_visual_review"])
            self.assertEqual(list(Path(temp).iterdir()), [doc])

    def test_macro_and_entities_are_rejected(self):
        with tempfile.TemporaryDirectory(prefix="geometry-docx-", dir=os.environ.get("GEOMETRY_QA_TEMP")) as temp:
            doc = Path(temp) / "synthetic.docx"
            with zipfile.ZipFile(doc, "w") as archive:
                archive.writestr("word/document.xml", "<document/>")
                archive.writestr("word/vbaProject.bin", b"synthetic")
            with self.assertRaisesRegex(ValueError, "Macro"):
                reader.inspect_docx(doc)
            with zipfile.ZipFile(doc, "w") as archive:
                archive.writestr("word/document.xml", '<!DOCTYPE a [<!ENTITY b "test">]><a/>')
            with self.assertRaisesRegex(ValueError, "entities"):
                reader.inspect_docx(doc)


if __name__ == "__main__":
    unittest.main()

