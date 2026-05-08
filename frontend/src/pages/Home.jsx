import { useEffect, useState } from "react";
import { addToBagApi } from "../api/bagApi";

const API = import.meta.env.VITE_API;

const CITIES = [
  "Delhi","Mumbai","Kolkata","Chennai","Bangalore",
  "Hyderabad","Pune","Ahmedabad","Jaipur","Lucknow","Noida","Gurgaon",
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch]     = useState("");
  const [city, setCity]         = useState(() => localStorage.getItem("fm_city") || "");
  const [loading, setLoading]   = useState(false);
  const [toastId, setToastId]   = useState(null);

  useEffect(() => {
    if (city) fetchProducts(city);
    else setProducts([]);
  }, [city]);

  async function fetchProducts(selectedCity) {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/api/products/location/${selectedCity}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  }

  function handleCityChange(e) {
    const v = e.target.value;
    setCity(v);
    localStorage.setItem("fm_city", v);
  }

  // Group products by sellerId → each seller gets a card
  const filtered = products.filter(p =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  // Group: { sellerId: { sellerName (from product.sellerName or fallback), products[] } }
  const grouped = {};
  filtered.forEach(p => {
    const key = p.sellerId || "unknown";
    if (!grouped[key]) grouped[key] = { sellerName: p.sellerName || "Kisan", sellerPhone: p.sellerPhone || "", products: [] };
    grouped[key].products.push(p);
  });
  const sellerGroups = Object.entries(grouped);

  async function handleAddToBag(product, e) {
    e.stopPropagation();
    try {
      await addToBagApi({
        _id: String(product._id),
        name: product.name,
        price: Number(product.price),
        image: product.image,
      });
      setToastId(product._id);
      setTimeout(() => setToastId(null), 1400);
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Nunito:wght@400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hm-root {
          min-height: 100vh;
          background: #fafaf7;
          font-family: 'Nunito', sans-serif;
        }

        /* ── HERO ── */
        .hm-hero {
          background: linear-gradient(135deg, #1a3a1a 0%, #2d5a27 50%, #1e4a1e 100%);
          padding: clamp(28px, 5vw, 56px) clamp(16px, 4vw, 60px) clamp(32px, 6vw, 64px);
          position: relative;
          overflow: hidden;
        }

        .hm-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .hm-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .hm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #a3e6a3;
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .hm-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 6vw, 64px);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 10px;
        }

        .hm-title span { color: #6ee77e; }

        .hm-subtitle {
          color: rgba(255,255,255,0.6);
          font-size: clamp(14px, 1.5vw, 17px);
          margin-bottom: 32px;
          max-width: 500px;
        }

        .hm-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .hm-city-select {
          appearance: none;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 14px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 20px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          outline: none;
          min-width: 180px;
          transition: border-color 0.2s;
        }

        .hm-city-select option { background: #1a3a1a; color: #fff; }
        .hm-city-select:focus { border-color: #6ee77e; }

        .hm-search {
          flex: 1;
          min-width: 200px;
          max-width: 360px;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          padding: 12px 18px;
          outline: none;
          backdrop-filter: blur(10px);
          transition: border-color 0.2s, background 0.2s;
        }

        .hm-search::placeholder { color: rgba(255,255,255,0.4); }
        .hm-search:focus {
          border-color: #6ee77e;
          background: rgba(255,255,255,0.15);
        }

        /* ── BODY ── */
        .hm-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(24px, 4vw, 48px) clamp(16px, 3vw, 40px);
        }

        /* ── EMPTY STATES ── */
        .hm-empty {
          text-align: center;
          padding: 80px 20px;
          color: #888;
        }

        .hm-empty-icon { font-size: 56px; margin-bottom: 16px; }
        .hm-empty h3 { font-size: 22px; color: #333; margin-bottom: 8px; font-family: 'Playfair Display', serif; }
        .hm-empty p { font-size: 15px; }

        .hm-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #666;
        }

        .hm-spinner {
          width: 24px; height: 24px;
          border: 3px solid #e0e0e0;
          border-top-color: #2d5a27;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── SELLER SECTION ── */
        .hm-seller-section {
          margin-bottom: 48px;
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hm-seller-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 2px solid #f0f0ea;
        }

        .hm-seller-avatar {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #2d5a27, #4a9e3f);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(45,90,39,0.25);
        }

        .hm-seller-info h3 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 2.5vw, 22px);
          font-weight: 700;
          color: #1a3a1a;
        }

        .hm-seller-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 3px;
        }

        .hm-seller-location {
          font-size: 12px;
          color: #888;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hm-seller-phone {
          font-size: 13px;
          font-weight: 700;
          color: #2d5a27;
          text-decoration: none;
          background: #f0fdf0;
          border: 1px solid #c6e8c6;
          padding: 3px 12px;
          border-radius: 100px;
          transition: background 0.15s;
        }
        .hm-seller-phone:hover { background: #dcfce7; }

        .hm-seller-count {
          font-size: 12px;
          background: #f0fdf0;
          color: #2d5a27;
          padding: 2px 10px;
          border-radius: 100px;
          font-weight: 700;
          border: 1px solid #c6e8c6;
        }

        /* ── PRODUCT GRID ── */
        .hm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        @media (max-width: 480px) {
          .hm-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }

        /* ── PRODUCT CARD ── */
        .hm-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          cursor: pointer;
        }

        .hm-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.13);
        }

        .hm-card-media {
          position: relative;
          overflow: hidden;
          height: clamp(140px, 20vw, 190px);
        }

        .hm-card-media img,
        .hm-card-media video {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }

        .hm-card:hover .hm-card-media img { transform: scale(1.05); }

        .hm-fresh-badge {
          position: absolute;
          top: 10px; left: 10px;
          background: #16a34a;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 3px 10px;
          border-radius: 100px;
          text-transform: uppercase;
        }

        .hm-video-hint {
          position: absolute;
          bottom: 8px; right: 8px;
          background: rgba(0,0,0,0.55);
          color: #fff;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 8px;
          backdrop-filter: blur(4px);
        }

        .hm-card-body {
          padding: 12px 14px 14px;
        }

        .hm-card-name {
          font-weight: 700;
          font-size: clamp(14px, 1.5vw, 16px);
          color: #1a1a1a;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hm-card-price {
          font-size: clamp(15px, 1.8vw, 18px);
          font-weight: 800;
          color: #2d5a27;
          margin-bottom: 12px;
        }

        .hm-card-price span {
          font-size: 12px;
          font-weight: 600;
          color: #888;
          margin-left: 3px;
        }

        .hm-buy-btn {
          width: 100%;
          padding: clamp(9px, 1.5vw, 12px);
          background: linear-gradient(135deg, #2d5a27, #4a9e3f);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: clamp(13px, 1.3vw, 15px);
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }

        .hm-buy-btn:hover { opacity: 0.9; transform: scale(0.98); }

        .hm-buy-btn.added {
          background: #16a34a;
        }

        /* ── CITY STATS ── */
        .hm-city-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          padding: 14px 20px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid #eee;
          flex-wrap: wrap;
        }

        .hm-stat { text-align: center; }
        .hm-stat-val { font-size: 22px; font-weight: 800; color: #2d5a27; font-family: 'Playfair Display', serif; }
        .hm-stat-lbl { font-size: 11px; color: #999; font-weight: 600; letter-spacing: 0.5px; }
        .hm-stat-divider { width: 1px; height: 36px; background: #eee; }

        .hm-city-label {
          margin-left: auto;
          font-size: 13px;
          color: #666;
          font-weight: 600;
        }

        .hm-city-label b { color: #2d5a27; }
      `}</style>

      <div className="hm-root">
        {/* HERO */}
        <div className="hm-hero">
          <div className="hm-hero-inner">
            <div className="hm-badge">🌿 Direct from Farm</div>
            <h1 className="hm-title">
              Fresh <span>Sabzi</span><br />
              Seedha Khet Se
            </h1>
            <p className="hm-subtitle">
              Apne sheher ke kisanon se kharido — taaza, sasta, aur swasth.
            </p>
            <div className="hm-controls">
              <select className="hm-city-select" value={city} onChange={handleCityChange}>
                <option value="">📍 Apni city chuniye</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                className="hm-search"
                placeholder="🔍 Search vegetables..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="hm-body">

          {/* No city */}
          {!city && (
            <div className="hm-empty">
              <div className="hm-empty-icon">📍</div>
              <h3>Apni City Chuniye</h3>
              <p>Aapke sheher ke kisan ke fresh products dikhenge</p>
            </div>
          )}

          {/* Loading */}
          {city && loading && (
            <div className="hm-loading">
              <div className="hm-spinner" />
              <span>Products load ho rahe hain...</span>
            </div>
          )}

          {/* No products */}
          {city && !loading && products.length === 0 && (
            <div className="hm-empty">
              <div className="hm-empty-icon">🌾</div>
              <h3>{city} mein abhi koi product nahi</h3>
              <p>Jald hi kisan products add karega</p>
            </div>
          )}

          {/* City stats */}
          {city && !loading && sellerGroups.length > 0 && (
            <div className="hm-city-stats">
              <div className="hm-stat">
                <div className="hm-stat-val">{sellerGroups.length}</div>
                <div className="hm-stat-lbl">KISAN</div>
              </div>
              <div className="hm-stat-divider" />
              <div className="hm-stat">
                <div className="hm-stat-val">{filtered.length}</div>
                <div className="hm-stat-lbl">PRODUCTS</div>
              </div>
              <div className="hm-city-label">📍 <b>{city}</b> Market</div>
            </div>
          )}

          {/* Seller groups */}
          {city && !loading && sellerGroups.map(([sellerId, group], idx) => (
            <SellerSection
              key={sellerId}
              sellerId={sellerId}
              group={group}
              city={city}
              toastId={toastId}
              onAddToBag={handleAddToBag}
              delay={idx * 0.08}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function SellerSection({ sellerId, group, city, toastId, onAddToBag, delay }) {
  const [showVideo, setShowVideo] = useState({});

  function toggleVideo(id) {
    setShowVideo(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const displayName  = group.sellerName  || "Kisan";
  const displayPhone = group.sellerPhone || "";

  return (
    <div className="hm-seller-section" style={{ animationDelay: `${delay}s` }}>
      {/* Seller Header */}
      <div className="hm-seller-header">
        <div className="hm-seller-avatar">🧑‍🌾</div>
        <div className="hm-seller-info">
          <h3>{displayName}</h3>
          <div className="hm-seller-meta">
            <span className="hm-seller-location">📍 {city}</span>
            {displayPhone && (
              <a href={`tel:${displayPhone}`} className="hm-seller-phone">
                📞 {displayPhone}
              </a>
            )}
            <span className="hm-seller-count">{group.products.length} Products</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="hm-grid">
        {group.products.map(p => (
          <div key={p._id} className="hm-card">
            <div className="hm-card-media" onClick={() => toggleVideo(p._id)}>
              {showVideo[p._id] && p.video ? (
                <video src={p.video} autoPlay muted loop playsInline />
              ) : (
                <img src={p.image} alt={p.name} />
              )}
              <div className="hm-fresh-badge">Fresh</div>
              {p.video && (
                <div className="hm-video-hint">
                  {showVideo[p._id] ? "📷 Photo" : "▶ Video"}
                </div>
              )}
            </div>
            <div className="hm-card-body">
              <div className="hm-card-name">{p.name}</div>
              <div className="hm-card-price">
                ₹{p.price}<span>/kg</span>
              </div>
              <button
                className={`hm-buy-btn ${toastId === p._id ? "added" : ""}`}
                onClick={e => onAddToBag(p, e)}
              >
                {toastId === p._id ? "✅ Added!" : "🛒 Bag Mein Daalo"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}