import { useEffect, useState } from "react";
import { addToBagApi } from "../api/bagApi";

const API = import.meta.env.VITE_API;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { from { background-position:-400px 0; } to { background-position:400px 0; } }
  @keyframes popIn   { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }

  .hm-root { min-height:100vh; background:#f0f4f0; font-family:'Nunito',sans-serif; }

  /* ── HERO ── */
  .hm-hero {
    background: linear-gradient(145deg, #071a09 0%, #0f2d14 40%, #0a2210 75%, #071a09 100%);
    padding: clamp(32px,5vw,60px) clamp(18px,4vw,60px) clamp(36px,6vw,72px);
    position: relative; overflow: hidden;
  }
  .hm-hero::before {
    content:''; position:absolute; inset:0;
    background:
      radial-gradient(ellipse at 15% 50%, rgba(74,222,128,.12) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 20%, rgba(52,211,153,.08) 0%, transparent 50%);
    pointer-events:none;
  }
  .hm-hero::after {
    content:''; position:absolute; inset:0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.025'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events:none;
  }
  .hm-hero-inner { max-width:1200px; margin:0 auto; position:relative; z-index:1; }

  .hm-hero-top { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:24px; margin-bottom:32px; }

  .hm-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
    color:#a3e6a3; padding:5px 14px; border-radius:100px;
    font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
    margin-bottom:16px;
  }

  .hm-title {
    font-family:'Playfair Display',serif;
    font-size:clamp(34px,6vw,68px); font-weight:900;
    color:#fff; line-height:1.08; margin-bottom:12px;
  }
  .hm-title span { color:#4ade80; }

  .hm-subtitle {
    color:rgba(255,255,255,.55); font-size:clamp(14px,1.6vw,17px);
    line-height:1.65; max-width:480px; margin-bottom:0;
  }

  /* Hero features (right side) */
  .hm-hero-feats { display:flex; flex-direction:column; gap:10px; }
  .hm-feat {
    display:flex; align-items:center; gap:10px;
    background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
    border-radius:12px; padding:10px 16px; color:rgba(255,255,255,.8);
    font-size:13px; font-weight:600; white-space:nowrap;
  }
  .hm-feat-dot { width:8px; height:8px; border-radius:50%; background:#4ade80; flex-shrink:0; }

  /* Controls row */
  .hm-controls {
    display:flex; gap:12px; flex-wrap:wrap; align-items:center;
    background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
    border-radius:18px; padding:14px 18px; backdrop-filter:blur(10px);
    margin-bottom:18px;
  }

  .hm-city-select {
    appearance:none; background:rgba(255,255,255,.12);
    border:1.5px solid rgba(255,255,255,.2); border-radius:12px;
    color:#fff; font-family:'Nunito',sans-serif; font-size:14px; font-weight:700;
    padding:11px 18px; cursor:pointer; outline:none; min-width:180px;
    transition:border-color .2s, background .2s;
  }
  .hm-city-select option { background:#0f2d14; color:#fff; }
  .hm-city-select:focus { border-color:#4ade80; background:rgba(255,255,255,.18); }

  .hm-search {
    flex:1; min-width:200px; max-width:380px;
    background:rgba(255,255,255,.12); border:1.5px solid rgba(255,255,255,.2);
    border-radius:12px; color:#fff; font-family:'Nunito',sans-serif;
    font-size:14px; font-weight:600; padding:11px 18px; outline:none;
    transition:border-color .2s, background .2s;
  }
  .hm-search::placeholder { color:rgba(255,255,255,.38); }
  .hm-search:focus { border-color:#4ade80; background:rgba(255,255,255,.18); }

  /* Tabs */
  .hm-tabs { display:flex; gap:10px; flex-wrap:wrap; }
  .hm-tab {
    padding:11px 24px; border-radius:100px;
    border:1.5px solid rgba(255,255,255,.25);
    background:rgba(255,255,255,.07); color:rgba(255,255,255,.65);
    font-family:'Nunito',sans-serif; font-size:14px; font-weight:700;
    cursor:pointer; transition:all .2s; backdrop-filter:blur(6px);
  }
  .hm-tab:hover { background:rgba(255,255,255,.14); color:#fff; }
  .hm-tab.active-city {
    background:linear-gradient(135deg,#16a34a,#22c55e);
    border-color:#22c55e; color:#fff;
    box-shadow:0 4px 16px rgba(22,163,74,.4);
  }
  .hm-tab.active-thok {
    background:linear-gradient(135deg,#c2410c,#f97316);
    border-color:#f97316; color:#fff;
    box-shadow:0 4px 16px rgba(249,115,22,.4);
  }

  /* ── BODY ── */
  .hm-body { max-width:1200px; margin:0 auto; padding:clamp(24px,4vw,48px) clamp(16px,3vw,40px); }

  /* STATS BAR */
  .hm-stats-bar {
    display:flex; align-items:center; gap:0;
    background:#fff; border-radius:16px;
    box-shadow:0 4px 18px rgba(0,0,0,.08);
    overflow:hidden; margin-bottom:32px;
    border:1px solid rgba(0,0,0,.05);
    animation:fadeUp .35s ease;
  }
  .hm-stat-block {
    flex:1; padding:16px 20px; text-align:center;
    border-right:1px solid #f0f0f0;
  }
  .hm-stat-block:last-of-type { border-right:none; }
  .hm-stat-val {
    font-family:'Playfair Display',serif;
    font-size:26px; font-weight:800; color:#0f2d14; line-height:1;
  }
  .hm-stat-lbl { font-size:11px; color:#9ca3af; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin-top:4px; }
  .hm-stat-city {
    flex:2; padding:16px 20px; display:flex; align-items:center; gap:10px;
    justify-content:flex-end;
  }
  .hm-city-pill {
    display:inline-flex; align-items:center; gap:6px;
    background:#f0fdf4; border:1px solid #86efac; color:#15803d;
    font-size:13px; font-weight:800; padding:6px 16px; border-radius:100px;
  }

  /* SELLER SECTION */
  .hm-seller-section {
    background:#fff; border-radius:22px;
    box-shadow:0 4px 20px rgba(0,0,0,.07);
    border:1px solid rgba(0,0,0,.05);
    overflow:hidden; margin-bottom:28px;
    animation:fadeUp .4s ease both;
    transition:box-shadow .2s;
  }
  .hm-seller-section:hover { box-shadow:0 8px 32px rgba(0,0,0,.11); }

  .hm-seller-header {
    display:flex; align-items:center; gap:16px;
    padding:20px 24px 18px;
    border-bottom:1.5px solid #f5f5f0;
    background:linear-gradient(135deg,#fafff8,#f0fdf4);
  }
  .hm-seller-header.thok { background:linear-gradient(135deg,#fffbf5,#fff7ed); border-bottom-color:#fef3e2; }

  .hm-seller-avatar {
    width:52px; height:52px; border-radius:16px; flex-shrink:0;
    background:linear-gradient(135deg,#16a34a,#22c55e);
    display:flex; align-items:center; justify-content:center;
    font-size:24px; box-shadow:0 4px 14px rgba(22,163,74,.3);
  }
  .hm-seller-avatar.thok {
    background:linear-gradient(135deg,#c2410c,#f97316);
    box-shadow:0 4px 14px rgba(249,115,22,.3);
  }

  .hm-seller-info { flex:1; min-width:0; }
  .hm-seller-name {
    font-family:'Playfair Display',serif;
    font-size:clamp(17px,2.5vw,21px); font-weight:800; color:#1a2e1a; margin-bottom:6px;
  }
  .hm-seller-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

  .hm-seller-location {
    display:inline-flex; align-items:center; gap:4px;
    font-size:12px; color:#6b7280; font-weight:600;
  }
  .hm-seller-phone {
    display:inline-flex; align-items:center; gap:4px;
    font-size:13px; font-weight:700; color:#15803d;
    text-decoration:none; background:#f0fdf4;
    border:1px solid #bbf7d0; padding:4px 13px; border-radius:100px;
    transition:background .15s, transform .15s;
  }
  .hm-seller-phone:hover { background:#dcfce7; transform:scale(1.03); }

  .hm-thok-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:11px; font-weight:700; color:#c2410c;
    background:#fff7ed; border:1px solid #fed7aa; padding:4px 12px; border-radius:100px;
  }
  .hm-product-count {
    display:inline-flex; align-items:center;
    font-size:12px; font-weight:700; color:#6b7280;
    background:#f9fafb; border:1px solid #e5e7eb; padding:4px 12px; border-radius:100px;
    margin-left:auto; white-space:nowrap;
  }

  /* PRODUCT GRID */
  .hm-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(190px,1fr));
    gap:0;
  }
  @media (max-width:480px) { .hm-grid { grid-template-columns:repeat(2,1fr); } }

  /* PRODUCT CARD */
  .hm-card {
    border-right:1px solid #f5f5f0; border-bottom:1px solid #f5f5f0;
    transition:background .2s;
    cursor:pointer; overflow:hidden;
  }
  .hm-card:hover { background:#fafff8; }
  .hm-card.thok:hover { background:#fffbf5; }

  .hm-card-media {
    position:relative; overflow:hidden;
    height:clamp(140px,18vw,190px);
    background:#f0f4f0;
  }
  .hm-card-media img,
  .hm-card-media video {
    width:100%; height:100%; object-fit:cover;
    transition:transform .4s ease;
  }
  .hm-card:hover .hm-card-media img { transform:scale(1.06); }

  .hm-fresh-badge {
    position:absolute; top:10px; left:10px;
    background:linear-gradient(135deg,#16a34a,#22c55e);
    color:#fff; font-size:9px; font-weight:800;
    letter-spacing:.1em; padding:4px 10px; border-radius:100px;
    text-transform:uppercase; box-shadow:0 2px 8px rgba(22,163,74,.4);
  }
  .hm-fresh-badge.thok {
    background:linear-gradient(135deg,#c2410c,#f97316);
    box-shadow:0 2px 8px rgba(249,115,22,.4);
  }

  .hm-video-hint {
    position:absolute; bottom:8px; right:8px;
    background:rgba(0,0,0,.55); color:#fff;
    font-size:10px; font-weight:700; padding:4px 10px;
    border-radius:8px; backdrop-filter:blur(4px);
  }

  .hm-card-body { padding:14px 16px 18px; }
  .hm-card-name {
    font-weight:800; font-size:clamp(14px,1.5vw,16px); color:#1a1a1a;
    margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .hm-card-price {
    font-family:'Playfair Display',serif;
    font-size:clamp(16px,2vw,20px); font-weight:800; color:#0f2d14;
    margin-bottom:14px; display:flex; align-items:baseline; gap:4px;
  }
  .hm-card-price span { font-family:'Nunito',sans-serif; font-size:12px; font-weight:600; color:#9ca3af; }

  .hm-buy-btn {
    width:100%; padding:11px;
    background:linear-gradient(135deg,#16a34a,#22c55e);
    color:#fff; border:none; border-radius:12px;
    font-family:'Nunito',sans-serif; font-size:13px; font-weight:800;
    cursor:pointer; transition:opacity .15s, transform .15s, box-shadow .15s;
    box-shadow:0 3px 10px rgba(22,163,74,.25);
  }
  .hm-buy-btn:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 6px 16px rgba(22,163,74,.35); }
  .hm-buy-btn:active { transform:scale(.97); }
  .hm-buy-btn.thok {
    background:linear-gradient(135deg,#c2410c,#f97316);
    box-shadow:0 3px 10px rgba(249,115,22,.25);
  }
  .hm-buy-btn.thok:hover { box-shadow:0 6px 16px rgba(249,115,22,.35); }
  .hm-buy-btn.added {
    background:linear-gradient(135deg,#059669,#10b981) !important;
    box-shadow:0 3px 10px rgba(5,150,105,.3) !important;
    animation:popIn .25s ease;
  }

  /* EMPTY STATES */
  .hm-empty { text-align:center; padding:80px 20px; animation:fadeUp .4s ease; }
  .hm-empty-icon { font-size:64px; margin-bottom:20px; display:block; }
  .hm-empty-title {
    font-family:'Playfair Display',serif;
    font-size:24px; color:#1a2e1a; margin-bottom:10px; font-weight:800;
  }
  .hm-empty-sub { color:#6b7280; font-size:15px; line-height:1.6; max-width:360px; margin:0 auto; }

  /* LOADING */
  .hm-loading {
    display:flex; flex-direction:column; align-items:center; gap:14px;
    padding:80px 20px; animation:fadeUp .3s ease;
  }
  .hm-spinner {
    width:40px; height:40px; border:4px solid #e5e7eb;
    border-top-color:#16a34a; border-radius:50%; animation:spin .75s linear infinite;
  }
  .hm-loading-txt { color:#6b7280; font-size:14px; font-weight:600; }

  /* SKELETON cards */
  .hm-skel-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:0;
    padding:0;
  }
  .hm-skel-card { border-right:1px solid #f5f5f0; border-bottom:1px solid #f5f5f0; }
  .hm-skel-img { height:160px; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:800px; animation:shimmer 1.4s infinite; }
  .hm-skel-body { padding:14px 16px; }
  .hm-skel-line { height:14px; border-radius:6px; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:800px; animation:shimmer 1.4s infinite; margin-bottom:10px; }
  .hm-skel-line.w70 { width:70%; }
  .hm-skel-line.w40 { width:40%; }
  .hm-skel-btn { height:38px; border-radius:12px; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:800px; animation:shimmer 1.4s infinite; }

  @media (max-width:480px) {
    .hm-skel-grid { grid-template-columns:repeat(2,1fr); }
    .hm-stats-bar { flex-wrap:wrap; }
    .hm-stat-city { justify-content:flex-start; }
  }
`;

export default function Home() {
  const [products, setProducts]   = useState([]);
  const [cities, setCities]       = useState([]);
  const [search, setSearch]       = useState("");
  const [city, setCity]           = useState(() => localStorage.getItem("fm_city") || "");
  const [sellerTab, setSellerTab] = useState("city_seller");
  const [loading, setLoading]     = useState(false);
  const [toastId, setToastId]     = useState(null);

  useEffect(() => {
    fetch(`${API}/api/cities`).then(r => r.json()).then(d => setCities(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (city) fetchProducts(city, sellerTab);
    else setProducts([]);
  }, [city, sellerTab]);

  async function fetchProducts(selectedCity, type) {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/api/products/location/${selectedCity}?type=${type}`);
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

  const filtered = products.filter(p =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {};
  filtered.forEach(p => {
    const key = p.sellerId || "unknown";
    if (!grouped[key]) grouped[key] = { sellerName: p.sellerName || "Kisan", sellerPhone: p.sellerPhone || "", products: [] };
    grouped[key].products.push(p);
  });
  // Har seller ke products ko price se sort karo — sasta upar, mahanga niche
  Object.values(grouped).forEach(g => {
    g.products.sort((a, b) => (a.price || 0) - (b.price || 0));
  });
  // Seller groups ko bhi sort karo — jis seller ka sabse sasta item ho wo upar
  const sellerGroups = Object.entries(grouped).sort(([, a], [, b]) => {
    const minA = a.products[0]?.price || 0;
    const minB = b.products[0]?.price || 0;
    return minA - minB;
  });

  async function handleAddToBag(product, e) {
    e.stopPropagation();
    try {
      await addToBagApi({
        _id:      String(product._id),
        name:     product.name,
        price:    Number(product.price),
        image:    product.image,
        sellerId: product.sellerId || null,
      });
      setToastId(product._id);
      setTimeout(() => setToastId(null), 1400);
    } catch (err) { alert(err.message); }
  }

  const isThok = sellerTab === "thok_seller";

  return (
    <>
      <style>{css}</style>
      <div className="hm-root">

        {/* ── HERO ── */}
        <div className="hm-hero">
          <div className="hm-hero-inner">
            <div className="hm-hero-top">
              {/* Left — branding + controls */}
              <div style={{ flex: 1, minWidth: 280 }}>
                <div className="hm-badge">🌿 Direct From Farm</div>
                <h1 className="hm-title">
                  Taaza <span>Sabzi</span><br />Seedha Khet Se
                </h1>
                <p className="hm-subtitle">
                  Apne sheher ke kisanon se kharido — taaza, sasta, aur bilkul swasth.
                </p>
              </div>

              {/* Right — feature pills */}
              <div className="hm-hero-feats">
                {[
                  "🥦 Seedha kisan se",
                  "💰 Sasta daam, koi beechiya nahi",
                  "🏪 Apni city ki kisan dukaan se lo",
                  "🎁 Reward code se free order",
                ].map(f => (
                  <div className="hm-feat" key={f}>
                    <div className="hm-feat-dot" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="hm-controls">
              <select className="hm-city-select" value={city} onChange={handleCityChange}>
                <option value="">📍 Apni city chuniye</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                className="hm-search"
                placeholder="🔍 Sabzi search karo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div className="hm-tabs">
              <button
                className={`hm-tab ${sellerTab === "city_seller" ? "active-city" : ""}`}
                onClick={() => setSellerTab("city_seller")}
              >
                🛒 City Sellers
              </button>
              <button
                className={`hm-tab ${sellerTab === "thok_seller" ? "active-thok" : ""}`}
                onClick={() => setSellerTab("thok_seller")}
              >
                🏭 Thok Mandi
              </button>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="hm-body">

          {/* No city selected */}
          {!city && (
            <div className="hm-empty">
              <span className="hm-empty-icon">📍</span>
              <h3 className="hm-empty-title">Pehle City Chuniye</h3>
              <p className="hm-empty-sub">Aapke sheher ke kisan ke fresh products yahan dikhenge</p>
            </div>
          )}

          {/* Loading — skeleton cards */}
          {city && loading && (
            <div>
              <div className="hm-skel-grid" style={{ background:"#fff", borderRadius:22, overflow:"hidden", marginBottom:28, boxShadow:"0 4px 20px rgba(0,0,0,.07)" }}>
                {[1,2,3,4].map(i => (
                  <div key={i} className="hm-skel-card">
                    <div className="hm-skel-img" />
                    <div className="hm-skel-body">
                      <div className="hm-skel-line w70" />
                      <div className="hm-skel-line w40" />
                      <div className="hm-skel-btn" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No products */}
          {city && !loading && products.length === 0 && (
            <div className="hm-empty">
              <span className="hm-empty-icon">{isThok ? "🏭" : "🌾"}</span>
              <h3 className="hm-empty-title">
                {city} mein abhi koi {isThok ? "Thok Mandi" : "City"} product nahi
              </h3>
              <p className="hm-empty-sub">
                {isThok
                  ? "Is city mein Thok Mandi seller abhi nahi hai — jald hi aayega!"
                  : "Kisan jald hi nayi sabzi add karega — thoda intezaar karo!"}
              </p>
            </div>
          )}

          {/* Stats bar */}
          {city && !loading && sellerGroups.length > 0 && (
            <div className="hm-stats-bar">
              <div className="hm-stat-block">
                <div className="hm-stat-val">{sellerGroups.length}</div>
                <div className="hm-stat-lbl">Kisan</div>
              </div>
              <div className="hm-stat-block">
                <div className="hm-stat-val">{filtered.length}</div>
                <div className="hm-stat-lbl">Products</div>
              </div>
              <div className="hm-stat-block">
                <div className="hm-stat-val">{isThok ? "🏭" : "🛒"}</div>
                <div className="hm-stat-lbl">{isThok ? "Thok Mandi" : "City Market"}</div>
              </div>
              <div className="hm-stat-city">
                <span className="hm-city-pill">📍 {city}</span>
              </div>
            </div>
          )}

          {/* Seller groups */}
          {city && !loading && sellerGroups.map(([sellerId, group], idx) => (
            <SellerSection
              key={sellerId}
              group={group}
              city={city}
              toastId={toastId}
              onAddToBag={handleAddToBag}
              delay={idx * 0.07}
              isThok={isThok}
            />
          ))}

        </div>
      </div>
    </>
  );
}

function SellerSection({ group, city, toastId, onAddToBag, delay, isThok }) {
  const [showVideo, setShowVideo] = useState({});
  function toggleVideo(id) { setShowVideo(prev => ({ ...prev, [id]: !prev[id] })); }

  const displayName  = group.sellerName  || "Kisan";
  const displayPhone = group.sellerPhone || "";

  return (
    <div className="hm-seller-section" style={{ animationDelay: `${delay}s` }}>

      {/* Seller Header */}
      <div className={`hm-seller-header${isThok ? " thok" : ""}`}>
        <div className={`hm-seller-avatar${isThok ? " thok" : ""}`}>
          {isThok ? "🏭" : "🧑‍🌾"}
        </div>
        <div className="hm-seller-info">
          <div className="hm-seller-name">
            {isThok ? "Thok Mandi" : displayName}
          </div>
          <div className="hm-seller-meta">
            <span className="hm-seller-location">
              {isThok ? "🏭" : "📍"} {city}
            </span>
            {!isThok && displayPhone && (
              <a href={`tel:${displayPhone}`} className="hm-seller-phone">
                📞 {displayPhone}
              </a>
            )}
            {isThok && (
              <span className="hm-thok-badge">🏭 Wholesale</span>
            )}
            <span className="hm-product-count">{group.products.length} products</span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="hm-grid">
        {group.products.map(p => (
          <div key={p._id} className={`hm-card${isThok ? " thok" : ""}`}>
            <div className="hm-card-media" onClick={() => toggleVideo(p._id)}>
              {showVideo[p._id] && p.video ? (
                <video src={p.video} autoPlay muted loop playsInline />
              ) : (
                <img src={p.image} alt={p.name} loading="lazy" />
              )}
              <div className={`hm-fresh-badge${isThok ? " thok" : ""}`}>
                {isThok ? "Thok" : "Fresh"}
              </div>
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
                className={`hm-buy-btn${isThok ? " thok" : ""} ${toastId === p._id ? "added" : ""}`}
                onClick={e => onAddToBag(p, e)}
              >
                {toastId === p._id
                  ? "✅ Bag Mein Add!"
                  : isThok ? "🏭 Thok Mein Lo" : "🛒 Bag Mein Daalo"}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
