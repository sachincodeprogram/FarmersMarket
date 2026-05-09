import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes spin      { to { transform:rotate(360deg); } }
  @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeSlide { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse     { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.45; transform:scale(.7); } }
  @keyframes shimmer   { to { left:200%; } }
  @keyframes popIn     { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }

  .sap-root {
    min-height:100vh; font-family:'Nunito',sans-serif;
    background:linear-gradient(145deg,#071a09 0%,#0f2d14 45%,#0a2210 75%,#071a09 100%);
    position:relative; overflow-x:hidden;
  }
  .sap-root::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background:
      radial-gradient(ellipse at 15% 20%, rgba(74,222,128,.12) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 80%, rgba(52,211,153,.08) 0%, transparent 50%);
  }

  /* ── HERO ── */
  .sap-hero { padding:36px 24px 44px; position:relative; z-index:1; max-width:1000px; margin:0 auto; }
  .sap-hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15);
    color:rgba(255,255,255,.75); font-size:11px; font-weight:700;
    letter-spacing:.1em; text-transform:uppercase;
    padding:5px 14px; border-radius:100px; margin-bottom:16px;
  }
  .sap-dot {
    width:7px; height:7px; background:#4ade80; border-radius:50%;
    animation:pulse 2s ease-in-out infinite; flex-shrink:0;
  }
  .sap-hero-title {
    font-family:'Playfair Display',serif;
    font-size:clamp(28px,5vw,46px); font-weight:900;
    color:#fff; line-height:1.1; margin-bottom:16px;
  }
  .sap-hero-title span { color:#4ade80; }
  .sap-location-pill {
    display:inline-flex; align-items:center; gap:7px;
    background:rgba(74,222,128,.1); border:1px solid rgba(74,222,128,.25);
    color:#86efac; font-size:13px; font-weight:700;
    padding:7px 18px; border-radius:100px;
  }
  .sap-warn-pill {
    display:inline-flex; align-items:center; gap:7px;
    background:rgba(251,191,36,.08); border:1px solid rgba(251,191,36,.25);
    color:#fcd34d; font-size:13px; font-weight:700;
    padding:7px 18px; border-radius:100px;
  }

  /* ── LAYOUT ── */
  .sap-layout {
    max-width:1000px; margin:0 auto; padding:0 24px 60px;
    display:grid; grid-template-columns:1fr 340px; gap:28px;
    position:relative; z-index:1;
  }
  @media(max-width:820px) { .sap-layout { grid-template-columns:1fr; } }

  /* ── FORM CARD ── */
  .sap-card {
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09);
    border-radius:24px; padding:32px; backdrop-filter:blur(16px);
    animation:fadeUp .4s ease;
  }

  .sap-section { margin-bottom:26px; }

  .sap-label {
    display:flex; align-items:center; gap:8px;
    font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase;
    color:#6ee7b7; margin-bottom:10px;
  }

  .sap-input {
    width:100%; padding:14px 18px;
    background:rgba(255,255,255,.06); border:1.5px solid rgba(255,255,255,.1);
    border-radius:14px; font-size:15px; font-family:'Nunito',sans-serif;
    font-weight:600; color:#f0fdf4; outline:none;
    transition:border-color .2s, background .2s;
  }
  .sap-input::placeholder { color:rgba(255,255,255,.22); }
  .sap-input:focus {
    border-color:rgba(74,222,128,.5);
    background:rgba(74,222,128,.05);
    box-shadow:0 0 0 3px rgba(74,222,128,.08);
  }

  .sap-price-wrap { position:relative; }
  .sap-rupee {
    position:absolute; left:18px; top:50%; transform:translateY(-50%);
    color:#4ade80; font-size:18px; font-weight:800; pointer-events:none;
    font-family:'Nunito',sans-serif;
  }
  .sap-price-input { padding-left:38px; }

  .sap-divider { height:1px; background:rgba(255,255,255,.07); margin:4px 0 26px; }

  /* ── UPLOAD ZONES ── */
  .sap-upload-zone {
    width:100%; border:2px dashed rgba(255,255,255,.13); border-radius:18px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:10px; cursor:pointer; overflow:hidden; position:relative;
    transition:border-color .2s, background .2s;
    min-height:170px; padding:20px;
  }
  .sap-upload-zone:hover, .sap-upload-zone.drag-over {
    border-color:rgba(74,222,128,.45); background:rgba(74,222,128,.04);
  }
  .sap-upload-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; }

  .sap-upload-icon { font-size:38px; opacity:.4; }
  .sap-upload-hint { font-size:13px; color:rgba(255,255,255,.3); text-align:center; line-height:1.55; }
  .sap-upload-hint b { color:rgba(255,255,255,.5); font-weight:700; }
  .sap-upload-hint small { font-size:11px; }

  /* Image preview */
  .sap-img-preview {
    width:100%; height:220px; object-fit:cover;
    border-radius:14px; display:block; animation:popIn .3s ease;
  }
  .sap-img-change-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,.45);
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-size:14px; font-weight:700; opacity:0;
    border-radius:16px; transition:opacity .2s;
    gap:6px;
  }
  .sap-upload-zone:hover .sap-img-change-overlay { opacity:1; }

  /* Video selected */
  .sap-vid-selected {
    width:100%; display:flex; align-items:center; gap:14px;
    background:rgba(74,222,128,.08); border:1px solid rgba(74,222,128,.2);
    border-radius:14px; padding:14px 18px; animation:popIn .3s ease;
  }
  .sap-vid-icon { font-size:30px; flex-shrink:0; }
  .sap-vid-name { font-size:13px; font-weight:700; color:#86efac; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:260px; }
  .sap-vid-size { font-size:11px; color:rgba(255,255,255,.3); margin-top:3px; }
  .sap-vid-change { font-size:11px; color:rgba(74,222,128,.6); margin-top:3px; cursor:pointer; }

  /* ── PROGRESS ── */
  .sap-progress-wrap { margin-bottom:18px; }
  .sap-progress-track { height:5px; background:rgba(255,255,255,.08); border-radius:100px; overflow:hidden; }
  .sap-progress-fill  { height:100%; background:linear-gradient(90deg,#4ade80,#22c55e,#10b981); border-radius:100px; transition:width .3s ease; }
  .sap-progress-txt   { font-size:11px; color:rgba(255,255,255,.3); margin-top:5px; text-align:right; font-weight:700; }

  /* ── MESSAGE ── */
  .sap-msg { padding:13px 18px; border-radius:14px; font-size:14px; font-weight:700; margin-bottom:18px; animation:fadeSlide .3s ease; }
  .sap-msg.success { background:rgba(74,222,128,.1); border:1px solid rgba(74,222,128,.3); color:#86efac; }
  .sap-msg.error   { background:rgba(239,68,68,.1);  border:1px solid rgba(239,68,68,.3);  color:#fca5a5; }

  /* ── SUBMIT BUTTON ── */
  .sap-submit {
    width:100%; padding:17px; border:none; border-radius:16px;
    background:linear-gradient(135deg,#16a34a,#22c55e,#4ade80);
    color:#071a09; font-family:'Nunito',sans-serif; font-size:16px; font-weight:800;
    cursor:pointer; position:relative; overflow:hidden;
    box-shadow:0 6px 24px rgba(74,222,128,.25);
    transition:transform .15s, box-shadow .2s, opacity .2s;
    letter-spacing:.3px;
  }
  .sap-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(74,222,128,.4); }
  .sap-submit:active:not(:disabled) { transform:scale(.98); }
  .sap-submit:disabled { opacity:.5; cursor:not-allowed; }
  .sap-submit-shimmer {
    position:absolute; top:0; left:-100%; width:55%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
    animation:shimmer 2.2s infinite;
  }
  .sap-spinner {
    display:inline-block; width:16px; height:16px;
    border:2px solid rgba(7,26,9,.2); border-top-color:#071a09;
    border-radius:50%; animation:spin .7s linear infinite;
    vertical-align:middle; margin-right:8px;
  }

  /* ── PREVIEW CARD (right column) ── */
  .sap-preview-col { display:flex; flex-direction:column; gap:16px; }

  .sap-preview-sticky { position:sticky; top:90px; }

  .sap-preview-card {
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09);
    border-radius:22px; overflow:hidden; backdrop-filter:blur(16px);
    animation:fadeUp .45s ease;
  }
  .sap-preview-hdr {
    padding:14px 18px; font-size:11px; font-weight:800;
    letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.4);
    border-bottom:1px solid rgba(255,255,255,.07);
    display:flex; align-items:center; gap:8px;
  }
  .sap-preview-img-wrap { position:relative; height:200px; background:rgba(255,255,255,.03); overflow:hidden; }
  .sap-preview-img { width:100%; height:100%; object-fit:cover; animation:popIn .3s ease; }
  .sap-preview-img-placeholder {
    width:100%; height:100%; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:8px;
    color:rgba(255,255,255,.18); font-size:13px;
  }
  .sap-preview-body { padding:16px 18px; }
  .sap-preview-name {
    font-family:'Playfair Display',serif; font-size:19px; font-weight:800;
    color:#f0fdf4; margin-bottom:6px;
    min-height:28px;
  }
  .sap-preview-name.placeholder { color:rgba(255,255,255,.2); font-size:15px; font-family:'Nunito',sans-serif; font-weight:600; }
  .sap-preview-price { font-family:'Playfair Display',serif; font-size:24px; font-weight:800; color:#4ade80; margin-bottom:12px; min-height:32px; }
  .sap-preview-price.placeholder { color:rgba(255,255,255,.18); font-size:15px; font-family:'Nunito',sans-serif; font-weight:600; }

  .sap-preview-tag {
    display:inline-flex; align-items:center; gap:5px;
    background:rgba(74,222,128,.12); border:1px solid rgba(74,222,128,.25);
    color:#86efac; font-size:11px; font-weight:700;
    padding:4px 12px; border-radius:100px; margin-bottom:14px;
  }
  .sap-preview-btn {
    width:100%; padding:12px; border:none; border-radius:12px;
    background:rgba(74,222,128,.15); color:#4ade80;
    font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
    cursor:default; border:1px solid rgba(74,222,128,.2);
  }

  /* Checklist */
  .sap-checklist { display:flex; flex-direction:column; gap:8px; }
  .sap-check-row { display:flex; align-items:center; gap:10px; font-size:13px; font-weight:600; }
  .sap-check-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .sap-check-dot.done   { background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,.5); }
  .sap-check-dot.pending{ background:rgba(255,255,255,.15); }
  .sap-check-label.done   { color:rgba(255,255,255,.8); }
  .sap-check-label.pending{ color:rgba(255,255,255,.3); }

  @media(max-width:820px) {
    .sap-preview-col { order:-1; }
    .sap-preview-sticky { position:static; }
  }
`;

export default function SellerAddProduct() {
  const [name, setName]               = useState("");
  const [price, setPrice]             = useState("");
  const [image, setImage]             = useState(null);
  const [video, setVideo]             = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sellerLocation, setSellerLocation] = useState("");
  const [sellerId, setSellerId]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [msg, setMsg]                 = useState({ text: "", type: "" });
  const [progress, setProgress]       = useState(0);

  const imgRef = useRef();
  const vidRef = useRef();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      setSellerId(u.uid);
      try {
        const res = await axios.get(`${API}/api/users/check/${u.uid}`);
        setSellerLocation(res.data.location || "");
      } catch (err) { console.log(err); }
    });
    return () => unsub();
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleVideoDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) setVideo(file);
  }

  async function handleSubmit() {
    if (!name || !price || !image || !video) {
      setMsg({ text: "Sab fields fill karo — naam, price, photo, video", type: "error" });
      return;
    }
    if (!sellerLocation) {
      setMsg({ text: "Tumhari location set nahi hai. Admin se contact karo.", type: "error" });
      return;
    }
    try {
      setLoading(true);
      setMsg({ text: "", type: "" });
      setProgress(10);

      const formData = new FormData();
      formData.append("name",     name);
      formData.append("price",    price);
      formData.append("image",    image);
      formData.append("video",    video);
      formData.append("sellerId", sellerId);
      formData.append("location", sellerLocation);

      await axios.post(`${API}/api/products/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 80) / e.total)),
      });

      setProgress(100);
      setMsg({ text: "Product successfully add ho gaya! 🎉", type: "success" });
      setName(""); setPrice(""); setImage(null); setVideo(null); setImagePreview(null);
      if (imgRef.current) imgRef.current.value = "";
      if (vidRef.current) vidRef.current.value = "";
      setTimeout(() => setProgress(0), 1800);
    } catch (err) {
      console.log(err);
      setMsg({ text: "Upload fail hua. Internet ya server check karo.", type: "error" });
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }

  // Checklist items for the preview sidebar
  const checks = [
    { label: "Product ka naam",  done: !!name.trim() },
    { label: "Price set ki",      done: !!price && Number(price) > 0 },
    { label: "Photo upload ki",   done: !!image },
    { label: "Video upload ki",   done: !!video },
    { label: "Location set hai",  done: !!sellerLocation },
  ];
  const allDone = checks.every(c => c.done);

  return (
    <>
      <style>{css}</style>
      <div className="sap-root">

        {/* ── HERO ── */}
        <div className="sap-hero">
          <div className="sap-hero-badge">
            <div className="sap-dot" />
            Seller Dashboard
          </div>
          <h1 className="sap-hero-title">
            Apna Product<br /><span>Market Mein Daalo</span>
          </h1>
          {sellerLocation
            ? <div className="sap-location-pill">📍 <strong>{sellerLocation}</strong> Market</div>
            : <div className="sap-warn-pill">⚠️ Location set nahi — Admin se contact karo</div>
          }
        </div>

        {/* ── LAYOUT ── */}
        <div className="sap-layout">

          {/* LEFT — Form */}
          <div className="sap-card">

            {/* Name */}
            <div className="sap-section">
              <div className="sap-label"><span>🌿</span> Product Ka Naam</div>
              <input
                className="sap-input"
                placeholder="Jaise: Tamatar, Aalu, Palak..."
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="sap-section">
              <div className="sap-label"><span>💰</span> Price (Per Kg)</div>
              <div className="sap-price-wrap">
                <span className="sap-rupee">₹</span>
                <input
                  className="sap-input sap-price-input"
                  placeholder="40"
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="sap-divider" />

            {/* Image */}
            <div className="sap-section">
              <div className="sap-label"><span>📸</span> Product Ki Photo</div>
              <div className="sap-upload-zone">
                <input ref={imgRef} type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className="sap-img-preview" />
                    <div className="sap-img-change-overlay">✏️ Photo Badlo</div>
                  </>
                ) : (
                  <>
                    <div className="sap-upload-icon">🖼️</div>
                    <div className="sap-upload-hint">
                      <b>Click karo</b> ya photo drag karo<br />
                      <small>JPG, PNG, WEBP — best quality</small>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Video */}
            <div className="sap-section">
              <div className="sap-label"><span>🎬</span> Product Ka Video</div>
              <div
                className="sap-upload-zone"
                style={{ minHeight: video ? "auto" : 120 }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
                onDragLeave={e => e.currentTarget.classList.remove("drag-over")}
                onDrop={e => { e.currentTarget.classList.remove("drag-over"); handleVideoDrop(e); }}
              >
                <input ref={vidRef} type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} />
                {video ? (
                  <div className="sap-vid-selected">
                    <div className="sap-vid-icon">🎥</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="sap-vid-name">{video.name}</div>
                      <div className="sap-vid-size">{(video.size / (1024 * 1024)).toFixed(1)} MB</div>
                      <div className="sap-vid-change">Video badlne ke liye click karo</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="sap-upload-icon">📹</div>
                    <div className="sap-upload-hint">
                      <b>Video drag karo</b> ya click karo<br />
                      <small>MP4, MOV — max 50MB</small>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Progress */}
            {progress > 0 && (
              <div className="sap-progress-wrap">
                <div className="sap-progress-track">
                  <div className="sap-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="sap-progress-txt">{progress}% uploaded</div>
              </div>
            )}

            {/* Message */}
            {msg.text && (
              <div className={`sap-msg ${msg.type}`}>
                {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
              </div>
            )}

            {/* Submit */}
            <button className="sap-submit" onClick={handleSubmit} disabled={loading}>
              {!loading && <div className="sap-submit-shimmer" />}
              {loading
                ? <><span className="sap-spinner" />Upload ho raha hai...</>
                : "🌿 Product Market Mein Daalo →"
              }
            </button>
          </div>

          {/* RIGHT — Live Preview */}
          <div className="sap-preview-col">
            <div className="sap-preview-sticky">

              {/* Card Preview */}
              <div className="sap-preview-card" style={{ marginBottom: 16 }}>
                <div className="sap-preview-hdr">
                  👁️ Live Preview
                </div>
                <div className="sap-preview-img-wrap">
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="sap-preview-img" />
                    : (
                      <div className="sap-preview-img-placeholder">
                        <span style={{ fontSize: 40 }}>🖼️</span>
                        <span>Photo yahan dikhegi</span>
                      </div>
                    )
                  }
                </div>
                <div className="sap-preview-body">
                  <div className={`sap-preview-tag`}>
                    {sellerLocation ? `📍 ${sellerLocation}` : "📍 Location"}
                  </div>
                  <div className={`sap-preview-name ${!name.trim() ? "placeholder" : ""}`}>
                    {name.trim() || "Product ka naam..."}
                  </div>
                  <div className={`sap-preview-price ${!price ? "placeholder" : ""}`}>
                    {price ? `₹${price}` : "₹ —"}
                    {price && <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"rgba(255,255,255,.3)", fontWeight:600, marginLeft:4 }}>/kg</span>}
                  </div>
                  <button className="sap-preview-btn">🛒 Bag Mein Daalo</button>
                </div>
              </div>

              {/* Checklist */}
              <div className="sap-preview-card">
                <div className="sap-preview-hdr">
                  {allDone ? "✅ " : "📋 "}Upload Checklist
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div className="sap-checklist">
                    {checks.map(c => (
                      <div key={c.label} className="sap-check-row">
                        <div className={`sap-check-dot ${c.done ? "done" : "pending"}`} />
                        <span className={`sap-check-label ${c.done ? "done" : "pending"}`}>{c.label}</span>
                        {c.done && <span style={{ marginLeft:"auto", fontSize:12, color:"#4ade80", fontWeight:800 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                  {allDone && (
                    <div style={{ marginTop:16, padding:"10px 14px", background:"rgba(74,222,128,.1)", border:"1px solid rgba(74,222,128,.25)", borderRadius:12, fontSize:13, fontWeight:700, color:"#86efac", textAlign:"center" }}>
                      🎉 Sab ready hai — submit karo!
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
