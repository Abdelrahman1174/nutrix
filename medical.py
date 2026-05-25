from __future__ import annotations
import os
# ... rest of your imports

import time
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.medical import MedicalUploadResponse
from app.utils.pdf_parser import extract_biomarkers
from app.services.medical_ml import predict_condition
from app.core.supabase_client import db

router = APIRouter()


@router.post("/upload", response_model=MedicalUploadResponse)
async def upload_medical_report(
    user_id: str = Form(...),
    file:    UploadFile = File(...),
):
    """
    Phase 2 — PDF & Classification.
    Parses the uploaded PDF, runs the ML classifier, persists results.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()

    # --- Insert medical_report record ---
    report_insert = (
        db.table("medical_reports")
        .insert({
            "user_id":          user_id,
            "file_name":        file.filename,
            "status":           "processing",
        })
        .execute()
    )
    report_id = report_insert.data[0]["report_id"]

    # --- Extract biomarkers ---
    import io
    try:
        t0 = time.perf_counter()
        biomarkers = extract_biomarkers(io.BytesIO(file_bytes))
        extraction_ms = int((time.perf_counter() - t0) * 1000)
    except ValueError as exc:
        db.table("medical_reports").update({"status": "failed"}).eq("report_id", report_id).execute()
        raise HTTPException(status_code=422, detail=str(exc))

    # --- Persist medical_values ---
    values_insert = (
        db.table("medical_values")
        .insert({
            "report_id":        report_id,
            "blood_glucose":    biomarkers.get("blood_glucose"),
            "hba1c":            biomarkers.get("hba1c"),
            "systolic_bp":      biomarkers.get("systolic_bp"),
            "diastolic_bp":     biomarkers.get("diastolic_bp"),
            "ldl":              biomarkers.get("ldl"),
            "hdl":              biomarkers.get("hdl"),
            "triglycerides":    biomarkers.get("triglycerides"),
            "haemoglobin":      biomarkers.get("haemoglobin"),
            "mcv":              biomarkers.get("mcv"),
            "extraction_time_ms": extraction_ms,
        })
        .execute()
    )
    record_id = values_insert.data[0]["record_id"]

    # --- ML prediction ---
    ml_input = {k: v for k, v in biomarkers.items() if v is not None}
    try:
        t1 = time.perf_counter()
        condition_label = predict_condition(ml_input)
        prediction_ms   = int((time.perf_counter() - t1) * 1000)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # --- Persist prediction ---
    pred_insert = (
        db.table("predictions")
        .insert({
            "record_id":            record_id,
            "condition_id":         condition_label,
            "prediction_condition": condition_label,
            "prediction_time_ms":   prediction_ms,
        })
        .execute()
    )
    prediction_id = pred_insert.data[0]["prediction_id"]

    # --- Mark report as processed ---
    db.table("medical_reports").update({"status": "processed"}).eq("report_id", report_id).execute()

    return MedicalUploadResponse(
        report_id=report_id,
        record_id=record_id,
        predicted_condition=condition_label,
        prediction_id=prediction_id,
        extracted_values=biomarkers,
    )
