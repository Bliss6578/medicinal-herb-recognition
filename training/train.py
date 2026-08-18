"""Train a medicinal-leaf classifier and export artifacts used by the API.

Run from this directory:
    python train.py --epochs 18
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

import numpy as np
import tensorflow as tf


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET = PROJECT_ROOT / "training/dataset/Medicinal Leaf Dataset/Segmented Medicinal Leaf Images"
DEFAULT_OUTPUT = PROJECT_ROOT / "training/artifacts"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--batch-size", type=int, default=24)
    parser.add_argument("--epochs", type=int, default=18)
    parser.add_argument("--validation-split", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def audit_dataset(dataset: Path) -> dict[str, int]:
    if not dataset.is_dir():
        raise FileNotFoundError(f"Dataset directory not found: {dataset}")
    classes = sorted(path for path in dataset.iterdir() if path.is_dir())
    if len(classes) < 2:
        raise ValueError("The dataset must contain at least two class directories.")
    counts: dict[str, int] = {}
    for class_dir in classes:
        files = [file for file in class_dir.iterdir() if file.suffix.lower() in IMAGE_EXTENSIONS]
        if len(files) < 2:
            raise ValueError(f"{class_dir.name} has fewer than two usable images.")
        counts[class_dir.name] = len(files)
    return counts


def make_model(image_size: int, class_count: int) -> tf.keras.Model:
    augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.08),
        tf.keras.layers.RandomZoom(0.12),
        tf.keras.layers.RandomContrast(0.12),
    ], name="augmentation")
    try:
        backbone = tf.keras.applications.MobileNetV2(
            input_shape=(image_size, image_size, 3), include_top=False, weights="imagenet"
        )
    except Exception as error:
        print(f"Could not load ImageNet weights ({error}); training from scratch instead.")
        backbone = tf.keras.applications.MobileNetV2(
            input_shape=(image_size, image_size, 3), include_top=False, weights=None
        )
    backbone.trainable = False
    inputs = tf.keras.Input(shape=(image_size, image_size, 3), name="image")
    x = augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = backbone(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.30)(x)
    outputs = tf.keras.layers.Dense(class_count, activation="softmax", name="predictions")(x)
    model = tf.keras.Model(inputs, outputs, name="medicinal_leaf_classifier")
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model


def main() -> None:
    args = parse_args()
    tf.keras.utils.set_random_seed(args.seed)
    random.seed(args.seed)
    np.random.seed(args.seed)
    counts = audit_dataset(args.dataset)
    args.output.mkdir(parents=True, exist_ok=True)

    dataset_options = dict(
        directory=args.dataset, labels="inferred", label_mode="int", validation_split=args.validation_split,
        seed=args.seed, image_size=(args.image_size, args.image_size), batch_size=args.batch_size,
    )
    train_ds = tf.keras.utils.image_dataset_from_directory(subset="training", shuffle=True, **dataset_options)
    validation_ds = tf.keras.utils.image_dataset_from_directory(subset="validation", shuffle=False, **dataset_options)
    class_names = train_ds.class_names
    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(512, seed=args.seed).prefetch(autotune)
    validation_ds = validation_ds.cache().prefetch(autotune)

    model = make_model(args.image_size, len(class_names))
    model_path = args.output / "medicinal_leaf_classifier.keras"
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(model_path, monitor="val_accuracy", mode="max", save_best_only=True),
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.35, patience=2, min_lr=1e-6),
    ]
    history = model.fit(train_ds, validation_data=validation_ds, epochs=args.epochs, callbacks=callbacks)
    best_model = tf.keras.models.load_model(model_path)
    loss, accuracy = best_model.evaluate(validation_ds, verbose=0)
    metadata = {
        "class_names": class_names, "image_size": args.image_size, "dataset_counts": counts,
        "validation_split": args.validation_split, "seed": args.seed,
        "validation_loss": round(float(loss), 5), "validation_accuracy": round(float(accuracy), 5),
        "epochs_completed": len(history.history["loss"]),
    }
    (args.output / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata, indent=2))
    print(f"Saved model to {model_path}")


if __name__ == "__main__":
    main()
