import { useEffect, useState, useMemo } from "react";

const API = import.meta.env.VITE_API;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes shimmer { from { background-position:-600px 0; } to { background-position:600px 0; } }

  .ap-wrap { min-height:100vh; background:#f0f4f8; font-family:'Nunito',sans-serif; }

  /* ── HERO ── */
  .ap-hero {
    background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#0f172a 100%);
    padding:36px 24px 52px; position:relative; overflow:hidden;
  }
  .ap-hero::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 75% 40%, rgba(59,130,246,.14) 0%, transparent 60%),
               radial-gradient(ellipse at 15% 70%, rgba(99,102,241,.1) 0%, transparent 55%);
    pointer-events:none;
  }
  .ap-hero-inner { max-width:1100px; margin:0 auto; position:relative; z-index:1; }
  .ap-hero-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
    color:#bfdbfe; font-size:12px; font-weight:700; letter-spacing:.07em;
    padding:5px 14px; border-radius:100px; margin-bottom:14px;
  }
  .ap-hero-title {
    font-family:'Playfair Display',serif;
    font-size:clamp(26px,4vw,38px); font-weight:800;
    color:#fff; margin-bottom:6px; line-height:1.15;
  }
  .ap-hero-sub { color:rgba(255,255,255,.5); font-size:14px; margin-bottom:28px; }
  .ap-hero-stats { display:flex; gap:14px; flex-wrap:wrap; }
  .ap-hstat {
    flex:1; min-width:100px;
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
    border-radius:16px; padding:16px 18px; text-align:center;
    backdrop-filter:blur(6px);
  }
  .ap-hstat-val {
    font-family:'Playfair Display',serif;
    font-size:26px; font-weight:800; color:#fff; line-height:1;
  }
  .ap-hstat-lbl { font-size:11px; color:rgba(255,255,255,.5); font-weight:700; margin-top:5px; letter-spacing:.06em; text-transform:uppercase; }

  /* ── BODY ── */
  .ap-body { max-width:1100px; margin:0 auto; padding:28px 20px 48px; }

  /* CONTROLS */
  .ap-controls { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:26px; align-items:center; }
  .ap-search {
    flex:1; min-width:200px; padding:13px 18px;
    border:1.5px solid #e5e7eb; border-radius:14px;
    font-family:'Nunito',sans-serif; font-size:15px; outline:none;
    transition:border .2s, box-shadow .2s; background:#fff;
  }
  .ap-search:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
  .ap-filter-btn {
    padding:12px 20px; border-radius:12px; border:1.5px solid #e5e7eb;
    font-family:'Nunito',sans-serif; font-size:13px; font-weight:700;
    cursor:pointer; background:#fff; color:#6b7280;
    transition:all .2s; white-space:nowrap;
  }
  .ap-filter-btn.active { border-color:#3b82f6; background:#eff6ff; color:#1d4ed8; }
  .ap-filter-btn.city.active { border-color:#16a34a; background:#f0fdf4; color:#15803d; }
  .ap-filter-btn.thok.active { border-color:#f97316; background:#fff7ed; color:#c2410c; }

  /* SELLER SECTION */
  .ap-seller-block {
    background:#fff; border-radius:22px;
    box-shadow:0 4px 20px rgba(0,0,0,.07);
    border:1px solid rgba(0,0,0,.05);
    overflow:hidden; margin-bottom:28px;
    animation:fadeUp .4s ease both;
    transition:box-shadow .2s;
  }
  .ap-seller-block:hover { box-shadow:0 8px 30px rgba(0,0,0,.11); }

  /* Seller Header */
  .ap-seller-hdr {
    padding:20px 24px 18px;
    border-bottom:1.5px solid #f0f4f8;
    display:flex; align-items:center; gap:16px; flex-wrap:wrap;
  }
  .ap-seller-hdr.city { background:linear-gradient(135deg,#fafff8,#f0fdf4); }
  .ap-seller-hdr.thok { background:linear-gradient(135deg,#fffbf5,#fff7ed); }
  .ap-seller-hdr.unknown { background:#f9fafb; }

  .ap-seller-avatar {
    width:52px; height:52px; border-radius:16px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:24px; font-weight:800;
  }
  .ap-seller-avatar.city { background:linear-gradient(135deg,#16a34a,#22c55e); box-shadow:0 4px 12px rgba(22,163,74,.3); }
  .ap-seller-avatar.thok { background:linear-gradient(135deg,#c2410c,#f97316); box-shadow:0 4px 12px rgba(249,115,22,.3); }
  .ap-seller-avatar.unknown { background:linear-gradient(135deg,#6b7280,#9ca3af); box-shadow:0 4px 12px rgba(0,0,0,.15); }

  .ap-seller-info { flex:1; min-width:0; }
  .ap-seller-name {
    font-family:'Playfair Display',serif;
    font-size:18px; font-weight:800; color:#0f172a; margin-bottom:6px;
  }
  .ap-seller-meta { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .ap-pill {
    display:inline-flex; align-items:center; gap:5px;
    font-size:12px; font-weight:700; padding:4px 12px; border-radius:100px;
  }
  .ap-pill.phone { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; text-decoration:none; transition:background .15s; }
  .ap-pill.phone:hover { background:#dcfce7; }
  .ap-pill.city-type { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
  .ap-pill.thok-type { background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; }
  .ap-pill.loc  { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
  .ap-pill.uid  { background:#f9fafb; color:#6b7280; border:1px solid #e5e7eb; font-size:11px; }
  .ap-pill.count { background:#f9fafb; color:#374151; border:1px solid #e5e7eb; margin-left:auto; }

  /* PRODUCT GRID */
  .ap-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
    gap:0;
  }
  @media (max-width:520px) { .ap-grid { grid-template-columns:repeat(2,1fr); } }

  /* PRODUCT CARD */
  .ap-card {
    border-right:1px solid #f0f4f8;
    border-bottom:1px solid #f0f4f8;
    overflow:hidden; transition:background .2s;
  }
  .ap-card:hover { background:#f8faff; }

  .ap-card-img-wrap {
    position:relative; height:150px; overflow:hidden; background:#f0f4f0;
  }
  .ap-card-img { width:100%; height:100%; object-fit:cover; transition:transform .4s ease; }
  .ap-card:hover .ap-card-img { transform:scale(1.06); }

  .ap-card-badge {
    position:absolute; top:8px; left:8px;
    font-size:9px; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
    padding:3px 9px; border-radius:100px; color:#fff;
  }
  .ap-card-badge.city { background:linear-gradient(135deg,#16a34a,#22c55e); }
  .ap-card-badge.thok { background:linear-gradient(135deg,#c2410c,#f97316); }

  .ap-card-body { padding:12px 14px 16px; }
  .ap-card-name {
    font-weight:800; font-size:15px; color:#0f172a;
    margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .ap-card-price {
    font-family:'Playfair Display',serif;
    font-size:20px; font-weight:800; color:#16a34a; margin-bottom:12px;
    display:flex; align-items:baseline; gap:4px;
  }
  .ap-card-price span { font-family:'Nunito',sans-serif; font-size:12px; color:#9ca3af; font-weight:600; }
  .ap-card-loc { font-size:11px; color:#9ca3af; font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:4px; }

  /* Edit mode */
  .ap-edit-row { display:flex; gap:6px; margin-bottom:10px; }
  .ap-edit-input {
    flex:1; padding:9px 11px; border:1.5px solid #3b82f6; border-radius:10px;
    font-family:'Nunito',sans-serif; font-size:14px; font-weight:700;
    outline:none; background:#eff6ff;
  }
  .ap-edit-save {
    padding:9px 14px; background:linear-gradient(135deg,#16a34a,#22c55e);
    color:#fff; border:none; border-radius:10px;
    font-family:'Nunito',sans-serif; font-size:13px; font-weight:800; cursor:pointer;
    transition:opacity .15s;
  }
  .ap-edit-save:hover { opacity:.88; }
  .ap-edit-cancel {
    padding:9px 10px; background:#f3f4f6; color:#6b7280;
    border:1px solid #e5e7eb; border-radius:10px;
    font-family:'Nunito',sans-serif; font-size:13px; cursor:pointer;
  }

  /* Action buttons */
  .ap-actions { display:flex; gap:6px; }
  .ap-btn-edit {
    flex:1; padding:9px; border:none; border-radius:10px;
    background:linear-gradient(135deg,#eff6ff,#dbeafe); color:#1d4ed8;
    font-family:'Nunito',sans-serif; font-size:13px; font-weight:700;
    cursor:pointer; transition:opacity .15s, transform .15s;
  }
  .ap-btn-edit:hover { opacity:.85; transform:translateY(-1px); }
  .ap-btn-del {
    flex:1; padding:9px; border:none; border-radius:10px;
    background:linear-gradient(135deg,#fef2f2,#fee2e2); color:#dc2626;
    font-family:'Nunito',sans-serif; font-size:13px; font-weight:700;
    cursor:pointer; transition:opacity .15s, transform .15s;
  }
  .ap-btn-del:hover { opacity:.85; transform:translateY(-1px); }

  /* No seller block */
  .ap-no-seller {
    text-align:center; padding:60px 20px;
    background:#fff; border-radius:20px;
    box-shadow:0 2px 12px rgba(0,0,0,.06);
    animation:fadeUp .4s ease;
  }
  .ap-no-seller-icon { font-size:52px; margin-bottom:14px; display:block; }
  .ap-no-seller-title { font-family:'Playfair Display',serif; font-size:20px; color:#1e293b; margin-bottom:8px; }
  .ap-no-seller-sub { color:#6b7280; font-size:14px; }

  /* Loading skeleton */
  .ap-skel-block { background:#fff; border-radius:22px; overflow:hidden; margin-bottom:28px; box-shadow:0 4px 20px rgba(0,0,0,.07); }
  .ap-skel-hdr { height:90px; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:800px; animation:shimmer 1.4s infinite; }
  .ap-skel-grid { display:grid; grid-template-columns:repeat(4,1fr); }
  .ap-skel-card { border-right:1px solid #f0f4f8; }
  .ap-skel-img { height:150px; background:linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%); background-size:800px; animation:shimmer 1.4s infinite; }
  .ap-skel-body { padding:12px 14px; }
  .ap-skel-line { height:12px; border-radius:6px; background:linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%); background-size:800px; animation:shimmer 1.4s infinite; margin-bottom:8px; }
  .ap-skel-line.w60 { width:60%; }
  .ap-skel-line.w40 { width:40%; }
`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "city" | "thok"

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [pRes, uRes] = await Promise.all([
        fetch(`${API}/api/products`),
        fetch(`${API}/api/users`),
      ]);
      const [pData, uData] = await Promise.all([pRes.json(), uRes.json()]);
      setProducts(Array.isArray(pData) ? pData : []);
      setUsers(Array.isArray(uData) ? uData : []);
    } finally {
      setLoading(false);
    }
  }

  // Build seller map: uid → full seller info
  const sellerMap = useMemo(() => {
    const map = {};
    users.forEach(u => {
      if (u.uid) map[u.uid] = u;
    });
    return map;
  }, [users]);

  // Enrich products with seller data
  const enriched = useMemo(() => products.map(p => ({
    ...p,
    seller: sellerMap[p.sellerId] || null,
  })), [products, sellerMap]);

  // Filter by search + type
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched.filter(p => {
      const nameMatch   = (p.name || "").toLowerCase().includes(q);
      const sellerMatch = (p.seller?.name || "").toLowerCase().includes(q);
      const locMatch    = (p.location || p.seller?.location || "").toLowerCase().includes(q);
      if (!nameMatch && !sellerMatch && !locMatch) return false;
      if (typeFilter === "city") return p.seller?.sellerType !== "thok_seller";
      if (typeFilter === "thok") return p.seller?.sellerType === "thok_seller";
      return true;
    });
  }, [enriched, search, typeFilter]);

  // Group by sellerId
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(p => {
      const key = p.sellerId || "__no_seller__";
      if (!g[key]) g[key] = { seller: p.seller, products: [] };
      g[key].products.push(p);
    });
    return Object.entries(g);
  }, [filtered]);

  // Stats
  const totalSellers = new Set(products.map(p => p.sellerId).filter(Boolean)).size;
  const totalCities  = new Set(
    products.map(p => p.seller?.location || p.location).filter(Boolean)
  ).size;

  async function del(id) {
    if (!window.confirm("Yeh product delete karna chahte ho?")) return;
    await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
    loadAll();
  }

  function startEdit(p) {
    setEditId(p._id);
    setEditName(p.name  || "");
    setEditPrice(String(p.price || ""));
  }

  async function saveEdit(id) {
    if (!editPrice) { alert("Price daalo"); return; }
    await fetch(`${API}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, price: editPrice }),
    });
    setEditId(null);
    loadAll();
  }

  const isThokSeller = (s) => s?.sellerType === "thok_seller";

  return (
    <>
      <style>{css}</style>
      <div className="ap-wrap">

        {/* HERO */}
        <div className="ap-hero">
          <div className="ap-hero-inner">
            <div className="ap-hero-badge">🔐 Admin Panel</div>
            <h1 className="ap-hero-title">Sabhi Products</h1>
            <p className="ap-hero-sub">Har seller ke products — naam, daam, location ke saath</p>
            <div className="ap-hero-stats">
              {[
                { val: products.length, lbl: "Products",  col: "#60a5fa" },
                { val: totalSellers,    lbl: "Sellers",   col: "#34d399" },
                { val: totalCities,     lbl: "Cities",    col: "#fbbf24" },
              ].map(s => (
                <div className="ap-hstat" key={s.lbl}>
                  <div className="ap-hstat-val" style={{ color: s.col }}>{s.val}</div>
                  <div className="ap-hstat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="ap-body">

          {/* Controls */}
          <div className="ap-controls">
            <input
              className="ap-search"
              placeholder="🔍 Product, seller ya city se dhundho..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className={`ap-filter-btn ${typeFilter === "all"  ? "active" : ""}`}  onClick={() => setTypeFilter("all")}>Sabhi</button>
            <button className={`ap-filter-btn city ${typeFilter === "city" ? "active city" : ""}`} onClick={() => setTypeFilter("city")}>🛒 City</button>
            <button className={`ap-filter-btn thok ${typeFilter === "thok" ? "active thok" : ""}`} onClick={() => setTypeFilter("thok")}>🏭 Thok</button>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div>
              {[1, 2].map(i => (
                <div key={i} className="ap-skel-block">
                  <div className="ap-skel-hdr" />
                  <div className="ap-skel-grid">
                    {[1,2,3,4].map(j => (
                      <div key={j} className="ap-skel-card">
                        <div className="ap-skel-img" />
                        <div className="ap-skel-body">
                          <div className="ap-skel-line w60" />
                          <div className="ap-skel-line w40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && grouped.length === 0 && (
            <div className="ap-no-seller">
              <span className="ap-no-seller-icon">📦</span>
              <div className="ap-no-seller-title">Koi product nahi mila</div>
              <div className="ap-no-seller-sub">Search badlo ya filter hatao</div>
            </div>
          )}

          {/* Seller groups */}
          {!loading && grouped.map(([sellerId, group], idx) => {
            const s      = group.seller;
            const isThok = isThokSeller(s);
            const hdrCls = s ? (isThok ? "thok" : "city") : "unknown";
            const location = s?.location || group.products[0]?.location || "—";

            return (
              <div
                key={sellerId}
                className="ap-seller-block"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                {/* Seller Header */}
                <div className={`ap-seller-hdr ${hdrCls}`}>
                  <div className={`ap-seller-avatar ${hdrCls}`}>
                    {isThok ? "🏭" : s ? "🧑‍🌾" : "❓"}
                  </div>
                  <div className="ap-seller-info">
                    <div className="ap-seller-name">
                      {s?.name || "Unknown Seller"}
                    </div>
                    <div className="ap-seller-meta">
                      {/* Type badge */}
                      {s && (
                        isThok
                          ? <span className="ap-pill thok-type">🏭 Thok Mandi</span>
                          : <span className="ap-pill city-type">🛒 City Seller</span>
                      )}
                      {/* Location */}
                      {location !== "—" && (
                        <span className="ap-pill loc">📍 {location}</span>
                      )}
                      {/* Phone */}
                      {s?.phone && (
                        <a href={`tel:${s.phone}`} className="ap-pill phone">📞 {s.phone}</a>
                      )}
                      {/* UID */}
                      {s?.uid && (
                        <span className="ap-pill uid">UID: {s.uid.slice(0, 12)}…</span>
                      )}
                      {/* Product count */}
                      <span className="ap-pill count">{group.products.length} products</span>
                    </div>
                  </div>
                </div>

                {/* Product Grid */}
                <div className="ap-grid">
                  {group.products.map(p => (
                    <div key={p._id} className="ap-card">
                      <div className="ap-card-img-wrap">
                        <img src={p.image} alt={p.name} className="ap-card-img" loading="lazy" />
                        <span className={`ap-card-badge ${isThok ? "thok" : "city"}`}>
                          {isThok ? "Thok" : "Fresh"}
                        </span>
                      </div>
                      <div className="ap-card-body">
                        {editId === p._id ? (
                          <>
                            <input
                              className="ap-edit-input"
                              style={{ marginBottom: 8, width: "100%" }}
                              placeholder="Product ka naam"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                            />
                            <div className="ap-edit-row">
                              <input
                                className="ap-edit-input"
                                type="number"
                                placeholder="Naya daam ₹"
                                value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                              />
                              <button className="ap-edit-save" onClick={() => saveEdit(p._id)}>✓</button>
                              <button className="ap-edit-cancel" onClick={() => setEditId(null)}>✕</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="ap-card-name">{p.name}</div>
                            <div className="ap-card-price">₹{p.price}<span>/kg</span></div>
                            {(p.location || s?.location) && (
                              <div className="ap-card-loc">📍 {p.location || s?.location}</div>
                            )}
                          </>
                        )}
                        {editId !== p._id && (
                          <div className="ap-actions">
                            <button className="ap-btn-edit" onClick={() => startEdit(p)}>✏️ Edit</button>
                            <button className="ap-btn-del"  onClick={() => del(p._id)}>🗑️ Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </>
  );
}
