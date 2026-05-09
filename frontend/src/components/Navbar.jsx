import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import axios from "axios";

const ADMIN_UIDS = ["bPCwZwhAVvMjO1BEYwC8io6QBb32"];
const API = import.meta.env.VITE_API || "http://localhost:5000";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');

  @keyframes slideIn  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes spin     { to { transform:rotate(360deg); } }

  /* ── BAR ── */
  .nb-bar {
    height: 64px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #0a1f0d 0%, #133a1c 60%, #0f2d1a 100%);
    box-shadow: 0 2px 20px rgba(0,0,0,.35);
    position: sticky;
    top: 0;
    z-index: 1000;
    font-family: 'Nunito', sans-serif;
  }

  /* LOGO */
  .nb-logo {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; text-decoration: none; user-select: none;
    transition: opacity .2s;
  }
  .nb-logo:hover { opacity: .85; }
  .nb-logo-leaf {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #16a34a, #4ade80);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; box-shadow: 0 2px 10px rgba(22,163,74,.4);
    flex-shrink: 0;
  }
  .nb-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 800; color: #fff; line-height: 1;
  }
  .nb-logo-text span { color: #4ade80; }

  /* RIGHT SECTION */
  .nb-right { display: flex; align-items: center; gap: 8px; }

  /* NAV LINKS */
  .nb-link {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px; border: none;
    font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; text-decoration: none; transition: background .2s, transform .15s;
    color: rgba(255,255,255,.8); background: rgba(255,255,255,.08);
  }
  .nb-link:hover { background: rgba(255,255,255,.15); transform: translateY(-1px); color: #fff; }
  .nb-link.active { background: rgba(74,222,128,.2); color: #4ade80; border: 1px solid rgba(74,222,128,.3); }

  /* BAG BUTTON */
  .nb-bag {
    position: relative;
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px; border: none;
    font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all .2s;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: #fff;
    box-shadow: 0 4px 12px rgba(22,163,74,.35);
  }
  .nb-bag:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(22,163,74,.5); }

  /* LOGIN BUTTONS (shown when logged out) */
  .nb-login-g {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px; border: none;
    font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700;
    cursor: pointer; background: #fff; color: #374151;
    box-shadow: 0 2px 8px rgba(0,0,0,.15); transition: all .2s;
  }
  .nb-login-g:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,.2); }

/* HAMBURGER */
  .nb-ham {
    width: 40px; height: 40px; border-radius: 10px; border: none;
    background: rgba(255,255,255,.1); color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
    cursor: pointer; transition: background .2s;
  }
  .nb-ham:hover { background: rgba(255,255,255,.2); }
  .nb-ham-line {
    width: 20px; height: 2px; background: #fff; border-radius: 2px;
    transition: all .25s;
  }

  /* AVATAR BUTTON (top right, shown when logged in) */
  .nb-avatar-btn {
    width: 38px; height: 38px; border-radius: 50%; border: 2px solid #4ade80;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: #fff; font-size: 14px; font-weight: 800;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    overflow: hidden; transition: transform .15s, box-shadow .2s;
    box-shadow: 0 2px 10px rgba(22,163,74,.35);
    font-family: 'Nunito', sans-serif;
  }
  .nb-avatar-btn:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(22,163,74,.5); }
  .nb-avatar-btn img { width: 100%; height: 100%; object-fit: cover; }

  /* ── OVERLAY ── */
  .nb-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.5);
    z-index: 1999;
    animation: fadeIn .25s ease;
    backdrop-filter: blur(2px);
  }

  /* ── DRAWER ── */
  .nb-drawer {
    position: fixed; top: 0; right: 0;
    width: 300px; max-width: 90vw; height: 100%;
    background: #fff; z-index: 2000;
    display: flex; flex-direction: column;
    animation: slideIn .3s cubic-bezier(.4,0,.2,1);
    box-shadow: -8px 0 40px rgba(0,0,0,.25);
    font-family: 'Nunito', sans-serif;
    overflow-y: auto;
  }

  /* DRAWER HEADER */
  .nb-drawer-head {
    background: linear-gradient(135deg, #0a1f0d, #133a1c);
    padding: 28px 22px 24px;
    position: relative;
  }
  .nb-drawer-close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: rgba(255,255,255,.12); color: #fff;
    font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .2s;
  }
  .nb-drawer-close:hover { background: rgba(255,255,255,.25); }

  .nb-drawer-avatar {
    width: 58px; height: 58px; border-radius: 50%;
    border: 3px solid #4ade80;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 800; color: #fff;
    overflow: hidden; margin-bottom: 12px;
    box-shadow: 0 4px 14px rgba(22,163,74,.4);
  }
  .nb-drawer-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .nb-drawer-name { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 3px; }
  .nb-drawer-email { font-size: 12px; color: rgba(255,255,255,.55); margin-bottom: 12px; }
  .nb-drawer-role {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; letter-spacing: .05em;
    padding: 4px 12px; border-radius: 100px;
  }

  /* DRAWER BODY */
  .nb-drawer-body { flex: 1; padding: 16px 14px; }

  .nb-section-label {
    font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
    color: #9ca3af; padding: 8px 10px 6px; margin-top: 8px;
  }

  .nb-menu-btn {
    width: 100%; padding: 12px 14px; margin-bottom: 4px;
    border: none; border-radius: 12px;
    background: transparent; color: #1e293b;
    font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; text-align: left;
    display: flex; align-items: center; gap: 12px;
    transition: background .2s, transform .15s, color .15s;
  }
  .nb-menu-btn:hover { background: #f0fdf4; color: #16a34a; transform: translateX(4px); }
  .nb-menu-btn.active { background: #f0fdf4; color: #16a34a; }
  .nb-menu-btn.danger { color: #dc2626; }
  .nb-menu-btn.danger:hover { background: #fef2f2; color: #dc2626; }

  .nb-menu-icon {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 16px;
  }

  .nb-divider { height: 1px; background: #f0f0f0; margin: 10px 0; }

  /* DRAWER FOOTER */
  .nb-drawer-foot {
    padding: 16px 14px;
    border-top: 1px solid #f0f0f0;
  }

  /* GUEST panel in drawer */
  .nb-guest-panel { padding: 8px 0; }
  .nb-guest-title { font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 6px; padding: 0 10px; }
  .nb-guest-sub   { font-size: 13px; color: #6b7280; margin-bottom: 16px; padding: 0 10px; line-height: 1.5; }
  .nb-guest-btn {
    width: 100%; padding: 13px 16px; margin-bottom: 10px; border: none; border-radius: 12px;
    font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 10px; transition: all .2s;
  }
  .nb-guest-btn:hover { transform: translateY(-1px); }
  .nb-guest-g  { background: #fff; color: #374151; border: 1.5px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .nb-guest-g:hover { border-color: #4285F4; box-shadow: 0 4px 14px rgba(66,133,244,.2); }

  /* MOBILE: hide text on very small screens */
  @media (max-width: 480px) {
    .nb-link-text { display: none; }
    .nb-login-text { display: none; }
  }
`;

export default function Navbar() {
  const nav      = useNavigate();
  const location = useLocation();

  const [user, setUser]         = useState(null);
  const [open, setOpen]         = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [roleReady, setRoleReady] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        try {
          const res = await axios.get(`${API}/api/users/check/${u.uid}`);
          if (!res.data.complete) nav("/profile");
          setIsSeller(res.data.role === "seller");
        } catch (err) {
          console.log("User check error:", err);
          setIsSeller(false);
        } finally {
          setRoleReady(true);
        }
      } else {
        setIsSeller(false);
        setRoleReady(true);
      }
    });
    return () => unsub();
  }, []);

  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  const loginGoogle = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
    nav("/profile");
  };


  const logout = async () => {
    await auth.signOut();
    setIsSeller(false);
    setRoleReady(false);
    nav("/");
  };

  const go = (path) => { nav(path); setOpen(false); };
  const isActive = (path) => location.pathname === path;

  const initials = (user?.displayName || user?.email || "?").slice(0, 2).toUpperCase();

  const roleBadge = isAdmin
    ? { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", icon: "⚙️", text: "Admin" }
    : isSeller
    ? { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", icon: "🛒", text: "Seller" }
    : { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", icon: "👤", text: "User" };

  return (
    <>
      <style>{css}</style>

      {/* ── TOP BAR ── */}
      <nav className="nb-bar">

        {/* LOGO */}
        <div className="nb-logo" onClick={() => nav("/")}>
          <div className="nb-logo-leaf">🌿</div>
          <div className="nb-logo-text">Kisan <span>Market</span></div>
        </div>

        {/* RIGHT */}
        <div className="nb-right">

          {/* Home */}
          <button
            className={`nb-link ${isActive("/") ? "active" : ""}`}
            onClick={() => nav("/")}
          >
            <span>🏠</span>
            <span className="nb-link-text">Home</span>
          </button>

          {/* Bag */}
          <button className="nb-bag" onClick={() => nav("/bag")}>
            <span>🛒</span>
            <span className="nb-link-text">Bag</span>
          </button>

          {/* Login buttons — only when logged out */}
          {!user && (
            <>
              <button className="nb-login-g" onClick={loginGoogle}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="nb-login-text">Google</span>
              </button>
            </>
          )}

          {/* Avatar (logged in) */}
          {user && (
            <button className="nb-avatar-btn" onClick={() => setOpen(true)} title="Menu">
              {user.photoURL
                ? <img src={user.photoURL} alt="avatar" />
                : initials
              }
            </button>
          )}

          {/* Hamburger */}
          <button className="nb-ham" onClick={() => setOpen(true)} aria-label="Menu">
            <div className="nb-ham-line" />
            <div className="nb-ham-line" style={{ width: 14 }} />
            <div className="nb-ham-line" />
          </button>

        </div>
      </nav>

      {/* ── DRAWER OVERLAY ── */}
      {open && (
        <div className="nb-overlay" onClick={() => setOpen(false)}>
          <div className="nb-drawer" onClick={e => e.stopPropagation()}>

            {/* DRAWER HEADER */}
            <div className="nb-drawer-head">
              <button className="nb-drawer-close" onClick={() => setOpen(false)}>✕</button>

              {user ? (
                <>
                  <div className="nb-drawer-avatar">
                    {user.photoURL
                      ? <img src={user.photoURL} alt="avatar" />
                      : initials
                    }
                  </div>
                  <div className="nb-drawer-name">{user.displayName || "Kisan User"}</div>
                  {user.email && <div className="nb-drawer-email">{user.email}</div>}
                  <span className="nb-drawer-role" style={{ background: roleBadge.bg, color: roleBadge.color, border: `1px solid ${roleBadge.border}` }}>
                    {roleBadge.icon} {roleBadge.text}
                  </span>
                </>
              ) : (
                <>
                  <div className="nb-drawer-avatar">🌿</div>
                  <div className="nb-drawer-name">Kisan Market</div>
                  <div className="nb-drawer-email">Login karke shopping shuru karo</div>
                </>
              )}
            </div>

            {/* DRAWER BODY */}
            <div className="nb-drawer-body">

              {user ? (
                <>
                  {/* User section */}
                  <div className="nb-section-label">Main Menu</div>
                  <DrawerBtn icon="🏠" bg="#f0fdf4" active={isActive("/")}    onClick={() => go("/")}>Home</DrawerBtn>
                  <DrawerBtn icon="🛒" bg="#f0fdf4" active={isActive("/bag")} onClick={() => go("/bag")}>Bag</DrawerBtn>
                  <DrawerBtn icon="👤" bg="#eff6ff" active={isActive("/profile")} onClick={() => go("/profile")}>Profile</DrawerBtn>
                  <DrawerBtn icon="📦" bg="#fff7ed" active={isActive("/orders")}  onClick={() => go("/orders")}>Mere Orders</DrawerBtn>

                  {/* Seller section */}
                  {roleReady && isSeller && (
                    <>
                      <div className="nb-divider" />
                      <div className="nb-section-label">Seller Panel</div>
                      <DrawerBtn icon="📊" bg="#fff7ed" onClick={() => go("/seller-dashboard")}>Seller Dashboard</DrawerBtn>
                      <DrawerBtn icon="➕" bg="#fff7ed" onClick={() => go("/seller-add-product")}>Product Add Karo</DrawerBtn>
                    </>
                  )}

                  {/* Admin section */}
                  {isAdmin && (
                    <>
                      <div className="nb-divider" />
                      <div className="nb-section-label">Admin Panel</div>
                      <DrawerBtn icon="🔐" bg="#eff6ff" onClick={() => go("/admin")}>Admin Home</DrawerBtn>
                      <DrawerBtn icon="📊" bg="#eff6ff" onClick={() => go("/admin-dashboard")}>Dashboard</DrawerBtn>
                      <DrawerBtn icon="👥" bg="#eff6ff" onClick={() => go("/admin-sellers")}>Sellers Manage Karo</DrawerBtn>
                      <DrawerBtn icon="🌾" bg="#eff6ff" onClick={() => go("/admin-products")}>Products</DrawerBtn>
                      <DrawerBtn icon="➕" bg="#eff6ff" onClick={() => go("/admin-add")}>Product Add Karo</DrawerBtn>
                      <DrawerBtn icon="🏪" bg="#eff6ff" onClick={() => go("/store")}>Store</DrawerBtn>
                      <DrawerBtn icon="📋" bg="#eff6ff" onClick={() => go("/admin-order-history")}>Order History</DrawerBtn>
                    </>
                  )}
                </>
              ) : (
                /* GUEST panel */
                <div className="nb-guest-panel">
                  <p className="nb-guest-title">Login Karo</p>
                  <p className="nb-guest-sub">Login karke taaza sabzi seedha kisan se mangao</p>

                  <button className="nb-guest-btn nb-guest-g" onClick={() => { loginGoogle(); setOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google se Login Karo
                  </button>

                </div>
              )}
            </div>

            {/* DRAWER FOOTER — logout */}
            {user && (
              <div className="nb-drawer-foot">
                <DrawerBtn icon="🚪" danger onClick={() => { logout(); setOpen(false); }}>
                  Logout
                </DrawerBtn>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

function DrawerBtn({ icon, bg = "#f9fafb", active, danger, onClick, children }) {
  return (
    <button
      className={`nb-menu-btn${active ? " active" : ""}${danger ? " danger" : ""}`}
      onClick={onClick}
    >
      <span className="nb-menu-icon" style={{ background: danger ? "#fef2f2" : bg }}>
        {icon}
      </span>
      {children}
    </button>
  );
}
