# Medicinal herb recognition

The dataset contains 30 leaf classes. Training does not modify the source images; it performs deterministic 80/20 train-validation splitting, image resizing, MobileNetV2 preprocessing, and training-time augmentation.

## Train

Create a clean Python 3.10+ environment, then run:

```bash
cd training
pip install -r requirements.txt
python train.py --epochs 18
```

The exported backend artifacts are `training/artifacts/medicinal_leaf_classifier.keras` and `training/artifacts/metadata.json`.

## Serve predictions

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Send `multipart/form-data` with an `image` field to `POST /predict`. The interactive API docs are available at `/docs`.

## Deploy with GitHub Pages and Render

1. Create a new empty GitHub repository, then add it as this folder's `origin` remote and push the `main` branch.
2. In Render, choose **New → Blueprint** and select the GitHub repository. Render will use `render.yaml` and deploy the FastAPI service with the bundled model artifact.
3. Copy the deployed Render URL (for example, `https://herbwise-api.onrender.com`). In GitHub, open **Settings → Secrets and variables → Actions → Variables** and add `API_BASE_URL` with that URL.
4. In GitHub, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push a new commit to deploy the frontend.
5. In Render, set `CORS_ORIGINS` to your Pages URL: `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME`.

The source dataset is deliberately excluded from Git. The trained model in `training/artifacts/` is included because the deployed API needs it.
