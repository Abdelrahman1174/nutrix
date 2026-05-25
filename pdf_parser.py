"""
pdf_parser.py — Extracts numeric biomarker values from a blood-test PDF.

Placeholder implementation.  Replace the body of `extract_biomarkers` with
real pdfplumber logic once PDFs are available for testing.
"""
from __future__ import annotations
import os
# ... rest of your imports
import io
import re
from typing import BinaryIO

# Keys returned here match the _KEY_NORMALIZER aliases in medical_ml.py
_PATTERNS: dict[str, list[str]] = {
    "blood_glucose":  ["blood glucose", "glucose", "fasting glucose"],
    "hba1c":          ["hba1c", "hb a1c", "a1c", "glycated haemoglobin"],
    "haemoglobin":    ["haemoglobin", "hemoglobin", "hgb", "hb"],
    "mcv":            ["mcv", "mean corpuscular volume"],
    "ldl":            ["ldl", "ldl cholesterol", "low density"],
    "hdl":            ["hdl", "hdl cholesterol", "high density"],
    "triglycerides":  ["triglycerides", "triglyceride", "tg"],
    "systolic_bp":    ["systolic", "systolic bp", "sbp"],
    "diastolic_bp":   ["diastolic", "diastolic bp", "dbp"],
}


def _parse_text(text: str) -> dict[str, float ]:
    results: dict[str, float ] = {k: None for k in _PATTERNS}
    lines = text.lower().splitlines()

    for line in lines:
        for key, aliases in _PATTERNS.items():
            if results[key] is not None:
                continue
            if any(alias in line for alias in aliases):
                numbers = re.findall(r"\d+\.?\d*", line)
                if numbers:
                    results[key] = float(numbers[0])

    return results


def extract_biomarkers(file: BinaryIO) -> dict[str, float ]:
    """
    Attempt to extract biomarker values from an uploaded PDF file object.
    Returns a dict of biomarker_key → float .
    Raises ValueError if the file cannot be parsed.
    """
    try:
        import pdfplumber
    except ImportError as exc:
        raise RuntimeError("pdfplumber is not installed.") from exc

    try:
        with pdfplumber.open(file) as pdf:
            full_text = "\n".join(
                page.extract_text() or "" for page in pdf.pages
            )
    except Exception as exc:
        raise ValueError(f"Could not read PDF: {exc}") from exc

    if not full_text.strip():
        raise ValueError("PDF appears to be empty or image-only (no extractable text).")

    return _parse_text(full_text)
