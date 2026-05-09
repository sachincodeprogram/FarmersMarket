import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform: rotate(360deg); } }

  .al-wrap {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 32px 20px;
    background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 55%, #0f172a 100%);
    font-family: 'Nunito', sans-serif;
    position: relative; overflow: hidden;
  }
  .al-wrap::before {
    content: '';
    position: absolute; top: -100px; right: -80px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(59,130,246,.2) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none;
  }
  .al-wrap::after {
    content: '';
    position: absolute; bottom: -80px; left: -60px;
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none;
  }

  .al-card {
    width: 100%; max-width: 420px;
    background: rgba(255,255,255,.97);
    border-radius: 28px; padding: 48px 44px;
    box-shadow: 0 28px 70px rgba(0,0,0,.4);
    animation: fadeUp .5s ease;
    position: relative; z-index: 1;
  }

  .al-shield { font-size: 52px; margin-bottom: 18px; display: block; text-align: center; }

  .al-badge {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    background: #eff6ff; border: 1px solid #bfdbfe;
    color: #1d4ed8; font-size: 12px; font-weight: 700; letter-spacing: .05em;
    padding: 5px 14px; border-radius: 100px; margin-bottom: 18px;
    width: fit-content; margin-left: auto; margin-right: auto;
  }

  .al-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 800;
    color: #0f172a; text-align: center; margin-bottom: 6px;
  }
  .al-sub {
    color: #6b7280; font-size: 14px; text-align: center;
    margin-bottom: 32px; line-height: 1.5;
  }

  .al-field { margin-bottom: 16px; }
  .al-label {
    display: block; font-size: 13px; font-weight: 700;
    color: #374151; margin-bottom: 7px;
  }
  .al-input {
    width: 100%; padding: 13px 16px;
    border: 1.5px solid #e5e7eb; border-radius: 12px;
    font-family: 'Nunito', sans-serif; font-size: 15px; color: #1a1a1a;
    outline: none; transition: border .2s, box-shadow .2s;
    background: #fafafa;
  }
  .al-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,.12);
    background: #fff;
  }
  .al-input::placeholder { color: #9ca3af; }

  .al-btn {
    width: 100%; padding: 16px;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: #fff; border: none; border-radius: 14px;
    font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 800;
    cursor: pointer; margin-top: 8px;
    box-shadow: 0 6px 20px rgba(29,78,216,.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform .15s, box-shadow .2s, opacity .2s;
  }
  .al-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(29,78,216,.45); }
  .al-btn:disabled { opacity: .65; cursor: not-allowed; }

  .al-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
    border-radius: 50%; animation: spin .7s linear infinite; display: inline-block;
  }

  .al-msg {
    margin-top: 16px; padding: 12px 16px; border-radius: 12px;
    font-size: 13px; font-weight: 700; text-align: center;
    animation: fadeUp .3s ease;
  }
  .al-msg.ok  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .al-msg.err { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .al-msg.info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

  .al-back {
    display: block; text-align: center; margin-top: 22px;
    font-size: 13px; color: #9ca3af; text-decoration: none; font-weight: 600;
    transition: color .15s;
  }
  .al-back:hover { color: #374151; }

  @media (max-width: 480px) {
    .al-card { padding: 36px 28px; border-radius: 22px; }
  }
`;

export default function AdminLogin() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg]           = useState("");
  const [msgType, setMsgType]   = useState("info");
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMsg("Pehle email aur password bharein");
      setMsgType("err");
      return;
    }
    try {
      setLoading(true);
      setMsg("Login ho raha hai...");
      setMsgType("info");
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("✅ Login successful! Redirect ho raha hai...");
      setMsgType("ok");
      navigate("/admin");
    } catch (err) {
      setMsg("❌ Email ya password galat hai");
      setMsgType("err");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{css}</style>
      <div className="al-wrap">
        <div className="al-card">

          <span className="al-shield">🔐</span>
          <div className="al-badge">⚙️ Admin Portal</div>
          <h2 className="al-title">Admin Login</h2>
          <p className="al-sub">Sirf authorized admins ke liye</p>

          <div className="al-field">
            <label className="al-label">Email Address</label>
            <input
              className="al-input"
              type="email"
              placeholder="admin@kisanmarket.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="al-field">
            <label className="al-label">Password</label>
            <input
              className="al-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="al-btn" onClick={handleLogin} disabled={loading}>
            {loading
              ? <><span className="al-spinner" /> Login ho raha hai...</>
              : <>🔑 Admin Login Karo</>
            }
          </button>

          {msg && <div className={`al-msg ${msgType}`}>{msg}</div>}

          <a href="/" className="al-back">← Wapas Home Par Jao</a>

        </div>
      </div>
    </>
  );
}
