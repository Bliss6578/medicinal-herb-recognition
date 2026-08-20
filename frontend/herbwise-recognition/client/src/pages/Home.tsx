/* Herbwise Field Notes Apothecary: warm paper surfaces, moss ink, clay actions, specimen-card framing, and calm responsive motion. */
import { useEffect, useRef, useState } from "react";
import { Camera, Check, ChevronDown, ImagePlus, Leaf, LoaderCircle, RotateCcw, ScanLine, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";

const specimenImage = "/herb-samples/neem.jpg";
const heroImage = "/herb-samples/pomegranate.jpg";
const predictionApi = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Prediction = { name: string; confidence: number };
type PredictionResponse = { prediction: Prediction; alternatives: Prediction[] };

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="Herbwise home">
      <span className="logo-mark" aria-hidden="true"><Leaf size={19} strokeWidth={2.2} /></span>
      <span>herbwise</span>
    </a>
  );
}

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("No specimen selected");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!cameraOpen || !cameraReady || !video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => toast.error("Camera preview could not start."));
  }, [cameraOpen, cameraReady]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a JPEG, PNG, or WebP image.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setPreviewName(file.name);
    setSelectedFile(file);
    setPrediction(null);
    setApiError(null);
    toast.success("Specimen ready to identify.");
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      toast.error("Camera access requires HTTPS (or localhost) and browser permission.");
      return;
    }
    setCameraOpen(true);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraReady(true);
    } catch {
      setCameraOpen(false);
      toast.error("Camera permission was not granted. You can upload a photo instead.");
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
    setCameraOpen(false);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1200;
    canvas.height = video.videoHeight || 900;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      setPreview(URL.createObjectURL(file));
      setPreviewName(file.name);
      setSelectedFile(file);
      setPrediction(null);
      setApiError(null);
    }, "image/jpeg", 0.9);
    closeCamera();
    toast.success("Capture saved. Ready to identify.");
  };

  const clearPreview = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setPreviewName("No specimen selected");
    setSelectedFile(null);
    setPrediction(null);
    setApiError(null);
  };

  const identifySpecimen = async () => {
    if (!selectedFile) {
      toast.error("Upload or capture a specimen photo first.");
      return;
    }
    setIsIdentifying(true);
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const response = await fetch(`${predictionApi}/predict`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "The specimen could not be identified.");
      setPrediction(data as PredictionResponse);
      toast.success("Identification complete.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reach the recognition service.";
      setApiError(message);
      toast.error(message);
    } finally {
      setIsIdentifying(false);
    }
  };

  return (
    <div id="top" className="app-shell">
      <header className="site-header container">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#field-notes">Field notes</a>
          <a href="#safety">Safety first</a>
        </nav>
        <button className="header-link" onClick={() => toast.info("Your saved specimens will live here soon.")}>My field notes <ChevronDown size={15} /></button>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> medicinal plant recognition <span className="eyebrow-dot" /></div>
            <h1>Name what’s <em>growing.</em></h1>
            <p className="hero-lede">Bring a leaf into focus. Herbwise helps you recognize medicinal plants with a little more confidence—and a lot more curiosity.</p>
            <div className="hero-meta"><span>01 / 03</span><span className="meta-rule" /><span>your pocket field guide</span></div>
          </div>

          <div className="hero-art" aria-label="Botanical specimen">
            <img src={heroImage} alt="A leafy herb specimen beside a field notebook" />
            <div className="art-note note-top">observe closely <span>↗</span></div>
            <div className="art-note note-bottom">field specimen / 001</div>
            <div className="art-ring" />
          </div>
        </section>

        <section className="scan-section" id="scan">
          <div className="scan-shell container">
            <div className="section-marker"><span>02</span><span className="marker-line" /><span>identify a specimen</span></div>
            <div className="scan-grid">
              <div className="scan-intro">
                <p className="kicker">Your next observation</p>
                <h2>What did you <em>find?</em></h2>
                <p>Take a clear photo of the leaf, flower, or stem. A close-up in natural light works best.</p>
                <div className="trust-line"><ShieldCheck size={17} /><span>Built for learning. Always verify before use.</span></div>
              </div>

              <div className="scanner-card">
                <div className="scanner-topline"><span>specimen intake</span><span>herbwise / live</span></div>
                <div className={`specimen-frame ${preview ? "has-preview" : ""}`}>
                  {preview ? <><img src={preview} alt="Selected herb specimen" /><button className="remove-photo" onClick={clearPreview} aria-label="Remove selected photo"><X size={16} /></button><div className="ready-pill"><Check size={14} /> ready to identify</div></> : <><img src={specimenImage} alt="A leafy herb specimen on field note paper" /><div className="frame-wash" /><div className="focus-reticle"><span /><span /><span /><span /></div><div className="frame-empty"><ScanLine size={25} /><span>place specimen inside frame</span></div></>}
                </div>
                <div className="scanner-footer">
                  <div className="file-label"><span>image</span><strong>{previewName}</strong></div>
                  <button className="reset-button" onClick={clearPreview} disabled={!preview} aria-label="Reset specimen"><RotateCcw size={16} /></button>
                </div>
                <div className="action-row">
                  <button className="primary-action" onClick={() => fileRef.current?.click()}><Upload size={18} /> Upload a photo</button>
                  <input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFile(e.target.files?.[0])} />
                  <button className="secondary-action" onClick={openCamera}><Camera size={18} /> Use camera</button>
                </div>
                <button className="identify-action" onClick={identifySpecimen} disabled={!selectedFile || isIdentifying}>
                  {isIdentifying ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
                  {isIdentifying ? "Identifying specimen…" : "Identify this specimen"}
                </button>
                {apiError && <p className="prediction-error" role="alert">Could not identify this image: {apiError}</p>}
                {prediction && <section className="prediction-result" aria-live="polite">
                  <span className="result-label">closest match</span>
                  <strong>{prediction.prediction.name}</strong>
                  <span className="confidence">{Math.round(prediction.prediction.confidence * 100)}% confidence</span>
                  {prediction.alternatives.length > 0 && <p>Also consider: {prediction.alternatives.map((item) => `${item.name} (${Math.round(item.confidence * 100)}%)`).join(" · ")}</p>}
                </section>}
                <p className="format-note"><ImagePlus size={13} /> JPEG, PNG or WebP · up to 10 MB</p>
              </div>
            </div>
          </div>
        </section>

        <section className="how-section container" id="how-it-works">
          <div className="section-marker"><span>03</span><span className="marker-line" /><span>the quiet process</span></div>
          <div className="how-heading"><h2>From looking to <em>learning.</em></h2><p>Recognition is a starting point, not a final answer. We keep the next steps clear.</p></div>
          <div className="steps">
            {[{ n: "01", icon: Camera, title: "Capture", copy: "Frame one healthy leaf in a little daylight." }, { n: "02", icon: Sparkles, title: "Recognize", copy: "Get a considered match and the clues behind it." }, { n: "03", icon: Leaf, title: "Learn", copy: "Explore traditional uses, lookalikes, and care." }].map(({ n, icon: Icon, title, copy }) => <article className="step" key={n}><div className="step-icon"><Icon size={20} /></div><div className="step-number">{n}</div><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section className="field-notes" id="field-notes">
          <div className="container field-inner"><div><p className="kicker">A softer kind of search</p><h2>Keep your eyes<br /><em>on the living world.</em></h2></div><div className="field-copy"><p>Plants have patterns. Veins, edges, scent, season. Herbwise gives you a place to notice them—one specimen at a time.</p><button onClick={() => toast.info("Field notes are coming soon.")}>Explore field notes <span>↗</span></button></div></div>
        </section>

        <section className="safety-section container" id="safety"><div className="safety-mark"><ShieldCheck size={22} /></div><div><p className="kicker">A note from the field</p><h2>Recognition is not a prescription.</h2><p>Use Herbwise as a learning companion. Never consume a plant based only on an image match—confirm with a qualified professional and a trusted local guide.</p></div><span className="safety-index">/ safe practice</span></section>
      </main>

      <footer className="site-footer container"><Logo /><span>Made for curious observers.</span><span>© 2026 Herbwise</span></footer>

      {cameraOpen && <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Take a specimen photo"><div className="camera-panel"><button className="modal-close" onClick={closeCamera} aria-label="Close camera"><X /></button><div className="camera-head"><span className="kicker">camera intake</span><h2>Bring it into <em>focus.</em></h2><p>Center one plant part in the frame.</p></div><div className="video-wrap">{cameraReady ? <video ref={videoRef} autoPlay playsInline muted /> : <div className="camera-fallback"><Camera size={28} /><span>Waiting for camera permission…</span></div>}<div className="video-reticle"><i /><i /><i /><i /></div></div><div className="camera-controls"><button className="secondary-action" onClick={closeCamera}>Cancel</button><button className="capture-button" onClick={capture} disabled={!cameraReady}><span /></button><span className="camera-hint">tap to capture</span></div></div></div>}
    </div>
  );
}
