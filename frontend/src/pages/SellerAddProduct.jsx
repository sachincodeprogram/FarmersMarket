import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function SellerAddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [sellerLocation, setSellerLocation] = useState("");
  const [sellerId, setSellerId] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [progress, setProgress] = useState(0);

  const imgRef = useRef();
  const vidRef = useRef();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      setSellerId(u.uid);
      try {
        const res = await axios.get(`${API}/api/users/check/${u.uid}`);
        setSellerLocation(res.data.location || "");
      } catch (err) {
        console.log(err);
      }
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
      formData.append("name", name);
      formData.append("price", price);
      formData.append("image", image);
      formData.append("video", video);
      formData.append("sellerId", sellerId);
      formData.append("location", sellerLocation);

      await axios.post(`${API}/api/products/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 80) / e.total);
          setProgress(pct);
        },
      });

      setProgress(100);
      setMsg({ text: "Product successfully add ho gaya!", type: "success" });

      // Reset
      setName("");
      setPrice("");
      setImage(null);
      setVideo(null);
      setImagePreview(null);
      if (imgRef.current) imgRef.current.value = "";
      if (vidRef.current) vidRef.current.value = "";
      setTimeout(() => setProgress(0), 1500);
    } catch (err) {
      console.log(err);
      setMsg({ text: "Upload fail hua. Internet ya Cloudinary check karo.", type: "error" });
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sap-wrap {
          min-height: 100vh;
          background: #0f1a0f;
          background-image:
            radial-gradient(ellipse 80% 50% at 20% 0%, rgba(34,197,94,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(16,185,129,0.08) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          padding: 32px 20px 60px;
        }

        .sap-header {
          max-width: 560px;
          margin: 0 auto 32px;
        }

        .sap-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .sap-dot {
          width: 8px; height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        .sap-eyebrow-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #22c55e;
        }

        .sap-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 6vw, 42px);
          font-weight: 800;
          color: #f0fdf4;
          line-height: 1.1;
        }

        .sap-title span {
          color: #22c55e;
        }

        .sap-location-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          padding: 7px 16px;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: #86efac;
        }

        .sap-warn-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          padding: 7px 16px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: 100px;
          font-size: 13px;
          color: #fcd34d;
        }

        .sap-card {
          max-width: 560px;
          margin: 0 auto;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(20px);
        }

        .sap-section {
          margin-bottom: 28px;
        }

        .sap-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #6ee7b7;
          margin-bottom: 10px;
        }

        .sap-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          font-size: 16px;
          font-family: 'DM Sans', sans-serif;
          color: #f0fdf4;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .sap-input::placeholder { color: rgba(255,255,255,0.2); }

        .sap-input:focus {
          border-color: rgba(34,197,94,0.5);
          background: rgba(34,197,94,0.05);
        }

        .sap-price-wrap {
          position: relative;
        }

        .sap-price-symbol {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #22c55e;
          font-size: 18px;
          font-weight: 700;
          pointer-events: none;
        }

        .sap-price-input {
          padding-left: 36px;
        }

        /* Image upload */
        .sap-img-zone {
          width: 100%;
          min-height: 180px;
          border: 2px dashed rgba(255,255,255,0.12);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          overflow: hidden;
          position: relative;
        }

        .sap-img-zone:hover {
          border-color: rgba(34,197,94,0.4);
          background: rgba(34,197,94,0.03);
        }

        .sap-img-zone input {
          position: absolute; inset: 0; opacity: 0; cursor: pointer;
        }

        .sap-img-preview {
          width: 100%; height: 220px;
          object-fit: cover;
          border-radius: 14px;
        }

        .sap-img-icon {
          font-size: 36px; opacity: 0.4;
        }

        .sap-img-hint {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          text-align: center;
        }

        /* Video upload */
        .sap-vid-zone {
          width: 100%;
          padding: 20px;
          border: 2px dashed rgba(255,255,255,0.12);
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
        }

        .sap-vid-zone:hover, .sap-vid-zone.drag-over {
          border-color: rgba(34,197,94,0.4);
          background: rgba(34,197,94,0.03);
        }

        .sap-vid-zone input {
          position: absolute; inset: 0; opacity: 0; cursor: pointer;
        }

        .sap-vid-selected {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 12px;
        }

        .sap-vid-icon { font-size: 28px; }

        .sap-vid-name {
          font-size: 13px;
          font-weight: 500;
          color: #86efac;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }

        .sap-vid-size {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 2px;
        }

        /* Divider */
        .sap-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0 28px;
        }

        /* Message */
        .sap-msg {
          padding: 14px 18px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          animation: fadeSlide 0.3s ease;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sap-msg.success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          color: #86efac;
        }

        .sap-msg.error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
        }

        /* Progress */
        .sap-progress-wrap {
          margin-bottom: 20px;
        }

        .sap-progress-bar {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 100px;
          overflow: hidden;
        }

        .sap-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #10b981);
          border-radius: 100px;
          transition: width 0.3s ease;
        }

        .sap-progress-text {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 6px;
          text-align: right;
        }

        /* Submit button */
        .sap-btn {
          width: 100%;
          padding: 16px;
          background: #22c55e;
          color: #0a1a0a;
          border: none;
          border-radius: 16px;
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 30px rgba(34,197,94,0.2);
          position: relative;
          overflow: hidden;
        }

        .sap-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(34,197,94,0.35);
        }

        .sap-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .sap-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sap-btn-shimmer {
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          to { left: 200%; }
        }

        .sap-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0a1a0a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="sap-wrap">
        <div className="sap-header">
          <div className="sap-eyebrow">
            <div className="sap-dot" />
            <span className="sap-eyebrow-text">Seller Dashboard</span>
          </div>
          <h1 className="sap-title">
            Apna Product<br />
            <span>Market Mein Daalo</span>
          </h1>

          {sellerLocation ? (
            <div className="sap-location-pill">
              📍 <strong>{sellerLocation}</strong> Market
            </div>
          ) : (
            <div className="sap-warn-pill">
              ⚠️ Location set nahi — Admin se contact karo
            </div>
          )}
        </div>

        <div className="sap-card">

          {/* Product Name */}
          <div className="sap-section">
            <div className="sap-label">
              <span>🌿</span> Product Ka Naam
            </div>
            <input
              className="sap-input"
              placeholder="Jaise: Tamatar, Aalu, Pyaaz..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="sap-section">
            <div className="sap-label">
              <span>💰</span> Price (per kg)
            </div>
            <div className="sap-price-wrap">
              <span className="sap-price-symbol">₹</span>
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
            <div className="sap-label">
              <span>📸</span> Product Ki Photo
            </div>
            <div className="sap-img-zone">
              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="sap-img-preview" />
              ) : (
                <>
                  <div className="sap-img-icon">🖼️</div>
                  <div className="sap-img-hint">
                    Photo chunne ke liye click karo<br />
                    <span style={{ fontSize: 11, opacity: 0.5 }}>JPG, PNG, WEBP</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="sap-section">
            <div className="sap-label">
              <span>🎬</span> Product Ka Video
            </div>
            <div
              className="sap-vid-zone"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
              onDragLeave={e => e.currentTarget.classList.remove("drag-over")}
              onDrop={e => { e.currentTarget.classList.remove("drag-over"); handleVideoDrop(e); }}
            >
              <input
                ref={vidRef}
                type="file"
                accept="video/*"
                onChange={e => setVideo(e.target.files[0])}
              />
              {video ? (
                <div className="sap-vid-selected">
                  <div className="sap-vid-icon">🎥</div>
                  <div>
                    <div className="sap-vid-name">{video.name}</div>
                    <div className="sap-vid-size">
                      {(video.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 30, opacity: 0.35, marginBottom: 8 }}>📹</div>
                  <div className="sap-img-hint">
                    Video drag karo ya click karo<br />
                    <span style={{ fontSize: 11, opacity: 0.5 }}>MP4, MOV — max 50MB</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress */}
          {progress > 0 && (
            <div className="sap-progress-wrap">
              <div className="sap-progress-bar">
                <div className="sap-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="sap-progress-text">{progress}% uploaded</div>
            </div>
          )}

          {/* Message */}
          {msg.text && (
            <div className={`sap-msg ${msg.type}`}>
              {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
            </div>
          )}

          {/* Submit */}
          <button
            className="sap-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {!loading && <div className="sap-btn-shimmer" />}
            {loading ? (
              <><span className="sap-spinner" />Upload ho raha hai...</>
            ) : (
              "Product Market Mein Daalo →"
            )}
          </button>

        </div>
      </div>
    </>
  );
}