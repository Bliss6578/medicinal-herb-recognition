"""FastAPI prediction service for the trained medicinal leaf classifier."""

from __future__ import annotations

import io
import json
import os
from functools import lru_cache
from pathlib import Path

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = Path(os.getenv("MODEL_DIR", PROJECT_ROOT / "training/artifacts"))
MODEL_PATH = ARTIFACT_DIR / "medicinal_leaf_classifier.keras"
METADATA_PATH = ARTIFACT_DIR / "metadata.json"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

app = FastAPI(title="Herbwise Recognition API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@lru_cache
def load_artifacts() -> tuple[tf.keras.Model, dict]:
    if not MODEL_PATH.exists() or not METADATA_PATH.exists():
        raise FileNotFoundError("Model artifacts are missing. Run training/train.py first.")
    return tf.keras.models.load_model(MODEL_PATH), json.loads(METADATA_PATH.read_text(encoding="utf-8"))


@app.get("/health")
def health() -> dict:
    return {"ready": MODEL_PATH.exists() and METADATA_PATH.exists()}


@app.post("/predict")
async def predict(image: UploadFile = File(...)) -> dict:
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(415, "Upload a JPEG, PNG, or WebP image.")
    raw = await image.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image must be 10 MB or smaller.")
    try:
        picture = Image.open(io.BytesIO(raw)).convert("RGB")
    except UnidentifiedImageError as error:
        raise HTTPException(400, "The uploaded file is not a valid image.") from error
    try:
        model, metadata = load_artifacts()
    except FileNotFoundError as error:
        raise HTTPException(503, str(error)) from error
    size = int(metadata["image_size"])
    array = np.asarray(picture.resize((size, size)), dtype=np.float32)[None, ...]
    probabilities = model.predict(array, verbose=0)[0]
    indices = np.argsort(probabilities)[::-1][:3]
    predictions = [{"name": metadata["class_names"][int(index)], "confidence": round(float(probabilities[index]), 5)} for index in indices]
    return {"prediction": predictions[0], "alternatives": predictions[1:], "model_validation_accuracy": metadata["validation_accuracy"]}
