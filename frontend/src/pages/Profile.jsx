import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100% { box-shadow:0 0 0 0 rgba(22,163,74,.35); } 50% { box-shadow:0 0 0 10px rgba(22,163,74,0); } }

  .pf-wrap {
    min-height: 100vh;
    background: linear-gradient(145deg, #0a1f0d 0%, #133a1c 45%, #0f2d1a 100%);
    font-family: 'Nunito', sans-serif;
    position: relative; overflow: hidden;
  }
  .pf-wrap::before {
    content: ''; position: absolute; top: -80px; right: -80px;
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(52,211,153,.15) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none;
  }

  /* HERO */
  .pf-hero {
    padding: 36px 24px 80px;
    text-align: center; position: relative; z-index: 1;
  }
  .pf-hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
    color: #d1fae5; font-size: 12px; font-weight: 700; letter-spacing: .06em;
    padding: 5px 14px; border-radius: 100px; margin-bottom: 20px;
  }
  .pf-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 4vw, 34px); font-weight: 800;
    color: #fff; margin-bottom: 6px;
  }
  .pf-hero-sub { color: rgba(255,255,255,.55); font-size: 14px; }

  /* AVATAR */
  .pf-avatar-ring {
    position: relative; display: inline-block;
    margin-top: 28px;
  }
  .pf-avatar {
    width: 100px; height: 100px; border-radius: 50%;
    border: 4px solid #4ade80;
    object-fit: cover;
    box-shadow: 0 0 0 6px rgba(74,222,128,.2);
    display: block;
  }
  .pf-avatar-edit {
    position: absolute; bottom: 2px; right: 2px;
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    border: 2px solid #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 13px;
    box-shadow: 0 2px 8px rgba(0,0,0,.25);
    transition: transform .15s;
  }
  .pf-avatar-edit:hover { transform: scale(1.15); }

  /* CARD */
  .pf-card {
    background: #fff; border-radius: 28px 28px 0 0;
    padding: 36px 28px 48px;
    margin-top: -40px; position: relative; z-index: 2;
    box-shadow: 0 -8px 40px rgba(0,0,0,.15);
    max-width: 560px; margin-left: auto; margin-right: auto;
    animation: fadeUp .4s ease;
    min-height: calc(100vh - 280px);
  }

  .pf-card-handle {
    width: 40px; height: 4px; background: #e5e7eb;
    border-radius: 4px; margin: 0 auto 28px;
  }

  /* FIELD */
  .pf-field { margin-bottom: 18px; }
  .pf-label {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 800; color: #6b7280;
    letter-spacing: .05em; text-transform: uppercase; margin-bottom: 8px;
  }
  .pf-label-icon { font-size: 14px; }
  .pf-input {
    width: 100%; padding: 14px 16px;
    border: 1.5px solid #e5e7eb; border-radius: 14px;
    font-family: 'Nunito', sans-serif; font-size: 15px; color: #1a1a1a;
    outline: none; transition: border .2s, box-shadow .2s;
    background: #fafafa;
  }
  .pf-input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,.12);
    background: #fff;
  }
  .pf-input::placeholder { color: #9ca3af; }
  .pf-textarea {
    resize: vertical; min-height: 90px; line-height: 1.5;
  }

  /* GPS BUTTON */
  .pf-gps-btn {
    width: 100%; padding: 13px 16px; margin-bottom: 18px;
    border: 2px dashed #16a34a; border-radius: 14px;
    background: #f0fdf4; color: #15803d;
    font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background .2s, transform .15s;
  }
  .pf-gps-btn:hover { background: #dcfce7; transform: translateY(-1px); }

  /* MAP */
  .pf-map {
    width: 100%; height: 200px; border: none;
    border-radius: 16px; margin-bottom: 18px;
    box-shadow: 0 4px 16px rgba(0,0,0,.1);
    animation: fadeUp .4s ease;
  }

  /* DIVIDER */
  .pf-divider { height: 1px; background: #f0f0f0; margin: 22px 0; }

  /* SAVE BUTTON */
  .pf-save-btn {
    width: 100%; padding: 17px;
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: #fff; border: none; border-radius: 16px;
    font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 800;
    cursor: pointer; letter-spacing: .3px;
    box-shadow: 0 6px 20px rgba(22,163,74,.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform .15s, box-shadow .2s;
    animation: pulse 2.5s ease-in-out infinite;
  }
  .pf-save-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(22,163,74,.45); animation: none; }

  /* LOADING */
  .pf-loading {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px;
    background: linear-gradient(145deg, #0a1f0d 0%, #133a1c 100%);
    color: rgba(255,255,255,.6); font-family: 'Nunito', sans-serif; font-size: 15px;
  }
  .pf-spinner {
    width: 42px; height: 42px; border: 4px solid rgba(255,255,255,.15);
    border-top-color: #4ade80; border-radius: 50%;
    animation: spin .75s linear infinite;
  }

  /* USER INFO PILL */
  .pf-email-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    color: #15803d; font-size: 13px; font-weight: 700;
    padding: 6px 14px; border-radius: 100px; margin-bottom: 24px;
    max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  @media (max-width: 480px) {
    .pf-card { padding: 28px 20px 40px; }
  }
`;

export default function Profile() {
  const nav = useNavigate();

  const [user, setUser]       = useState(undefined);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [lat, setLat]         = useState(null);
  const [lng, setLng]         = useState(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    const res  = await fetch(`${API}/api/users`);
    const data = await res.json();
    const found = data.find(x => x.uid === user.uid);
    if (found) {
      setName(found.name || "");
      setPhone(found.phone || "");
      setAddress(found.address || "");
    }
    setLoading(false);
  };

  if (user === undefined || loading) return (
    <>
      <style>{css}</style>
      <div className="pf-loading">
        <div className="pf-spinner" />
        <p>Profile load ho raha hai...</p>
      </div>
    </>
  );

  if (!user) return <Navigate to="/" />;

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await updateProfile(auth.currentUser, { photoURL: reader.result });
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!name || !phone || !address) {
      alert("Pehle saare fields bharein");
      return;
    }
    try {
      setSaving(true);
      await fetch(`${API}/api/users/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, name, phone, address }),
      });
      nav("/");
    } finally {
      setSaving(false);
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLat(latitude);
      setLng(longitude);
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();
      setAddress(data.display_name || `${latitude}, ${longitude}`);
    }, () => {
      alert("Location permission denied");
    });
  };

  const initials = (name || user.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{css}</style>
      <div className="pf-wrap">

        {/* HERO */}
        <div className="pf-hero">
          <div className="pf-hero-badge">🌿 Kisan Market</div>
          <h1 className="pf-hero-title">Aapki Profile</h1>
          <p className="pf-hero-sub">Apni details update karo</p>

          {/* AVATAR */}
          <div className="pf-avatar-ring">
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="pf-avatar" />
            ) : (
              <div className="pf-avatar" style={{
                background: "linear-gradient(135deg,#16a34a,#22c55e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, fontWeight: 800, color: "#fff",
                fontFamily: "'Nunito',sans-serif",
              }}>
                {initials}
              </div>
            )}
            <label className="pf-avatar-edit" title="Photo change karo">
              ✏️
              <input type="file" hidden accept="image/*" onChange={uploadPhoto} />
            </label>
          </div>
        </div>

        {/* CARD */}
        <div className="pf-card">
          <div className="pf-card-handle" />

          {user.email && (
            <div style={{ textAlign: "center" }}>
              <span className="pf-email-pill">✉️ {user.email}</span>
            </div>
          )}

          {/* Name */}
          <div className="pf-field">
            <label className="pf-label">
              <span className="pf-label-icon">👤</span> Pura Naam
            </label>
            <input
              className="pf-input"
              placeholder="Aapka pura naam likhein"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="pf-field">
            <label className="pf-label">
              <span className="pf-label-icon">📞</span> Phone Number
            </label>
            <input
              className="pf-input"
              placeholder="10 digit phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="pf-field">
            <label className="pf-label">
              <span className="pf-label-icon">🏠</span> Address
            </label>
            <textarea
              className="pf-input pf-textarea"
              placeholder="Ghar ka pura address"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {/* GPS */}
          <button className="pf-gps-btn" onClick={getLocation}>
            📍 Current Location Use Karo
          </button>

          {/* Map */}
          {lat && (
            <iframe
              title="map"
              className="pf-map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
            />
          )}

          <div className="pf-divider" />

          {/* Save */}
          <button className="pf-save-btn" onClick={save} disabled={saving}>
            {saving
              ? <><span style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} /> Saving...</>
              : <>✅ Changes Save Karo</>
            }
          </button>
        </div>

      </div>
    </>
  );
}
