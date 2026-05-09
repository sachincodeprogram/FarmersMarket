import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes floatLeaf { 0%,100% { transform:translateY(0) rotate(-8deg); } 50% { transform:translateY(-12px) rotate(4deg); } }

  .pl-wrap {
    min-height: 100vh;
    display: flex;
    font-family: 'Nunito', sans-serif;
    background: linear-gradient(145deg, #0a1f0d 0%, #133a1c 45%, #0f2d1a 100%);
    position: relative;
    overflow: hidden;
  }

  /* decorative blobs */
  .pl-wrap::before {
    content: '';
    position: absolute; top: -80px; right: -80px;
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(52,211,153,.18) 0%, transparent 70%);
    border-radius: 50%;
  }
  .pl-wrap::after {
    content: '';
    position: absolute; bottom: -60px; left: -60px;
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(74,222,128,.14) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* LEFT PANEL — branding */
  .pl-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 48px;
    position: relative; z-index: 1;
  }
  .pl-logo-leaf { font-size: 64px; animation: floatLeaf 4s ease-in-out infinite; display: inline-block; margin-bottom: 20px; }
  .pl-brand {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 4vw, 52px);
    font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 16px;
  }
  .pl-brand span { color: #4ade80; }
  .pl-tagline { color: rgba(255,255,255,.55); font-size: 16px; line-height: 1.65; max-width: 340px; margin-bottom: 36px; }
  .pl-features { display: flex; flex-direction: column; gap: 12px; }
  .pl-feat {
    display: flex; align-items: center; gap: 12px;
    color: rgba(255,255,255,.75); font-size: 14px; font-weight: 600;
  }
  .pl-feat-icon {
    width: 34px; height: 34px; border-radius: 10px;
    background: rgba(74,222,128,.15); border: 1px solid rgba(74,222,128,.25);
    display: flex; align-items: center; justify-content: center; font-size: 16px;
    flex-shrink: 0;
  }

  /* RIGHT PANEL — card */
  .pl-right {
    display: flex; align-items: center; justify-content: center;
    padding: 40px 32px; position: relative; z-index: 1;
    min-width: 420px;
  }
  .pl-card {
    width: 100%; max-width: 400px;
    background: rgba(255,255,255,.97);
    border-radius: 28px; padding: 44px 40px;
    box-shadow: 0 24px 60px rgba(0,0,0,.35);
    animation: fadeUp .5s ease;
    border: 1px solid rgba(255,255,255,.2);
  }

  .pl-card-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f0fdf4; border: 1px solid #86efac;
    color: #15803d; font-size: 12px; font-weight: 700; letter-spacing: .04em;
    padding: 5px 13px; border-radius: 100px; margin-bottom: 22px;
  }
  .pl-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 800; color: #1a2e1a;
    margin-bottom: 8px;
  }
  .pl-card-sub { color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 32px; }

  .pl-divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px;
  }
  .pl-divider-line { flex: 1; height: 1px; background: #e5e7eb; }
  .pl-divider-text { font-size: 12px; color: #9ca3af; font-weight: 600; white-space: nowrap; }

  /* SOCIAL BUTTONS */
  .pl-social-btn {
    width: 100%; padding: 15px 20px; border: none; border-radius: 14px;
    font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px;
    margin-bottom: 14px; transition: transform .15s, box-shadow .2s, opacity .15s;
    position: relative; overflow: hidden;
  }
  .pl-social-btn:hover { transform: translateY(-2px); }
  .pl-social-btn:active { transform: scale(.98); }
  .pl-social-btn:last-of-type { margin-bottom: 0; }

  .pl-btn-google {
    background: #fff; color: #374151;
    border: 1.5px solid #e5e7eb;
    box-shadow: 0 2px 10px rgba(0,0,0,.08);
  }
  .pl-btn-google:hover { box-shadow: 0 6px 20px rgba(66,133,244,.2); border-color: #4285F4; }

.pl-btn-icon { width: 22px; height: 22px; flex-shrink: 0; }
  .pl-btn-text { flex: 1; text-align: center; }

  .pl-footer-note {
    text-align: center; margin-top: 24px;
    font-size: 12px; color: #9ca3af; line-height: 1.55;
  }
  .pl-footer-note a { color: #16a34a; text-decoration: none; font-weight: 700; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .pl-left  { display: none; }
    .pl-right { min-width: unset; width: 100%; padding: 32px 20px; }
    .pl-card  { padding: 36px 28px; border-radius: 22px; }
  }
`;

export default function PublicLanding() {
  const nav = useNavigate();

  const loginGoogle = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
    nav("/profile");
  };


  return (
    <>
      <style>{css}</style>
      <div className="pl-wrap">

        {/* LEFT — Branding */}
        <div className="pl-left">
          <span className="pl-logo-leaf">🌿</span>
          <h1 className="pl-brand">Kisan<br /><span>Market</span></h1>
          <p className="pl-tagline">
            Seedha kisan se aapke ghar tak — taaza sabzi, seedha khet se, sahi daam par.
          </p>
          <div className="pl-features">
            {[
              { icon: "🥦", text: "Taaza sabzi seedha kisan se" },
              { icon: "💰", text: "Sasta daam, koi beechiya nahi" },
              { icon: "🏪", text: "Apni city ki kisan dukaan se lo" },
              { icon: "🎁", text: "Reward code se free orders" },
            ].map(f => (
              <div className="pl-feat" key={f.text}>
                <div className="pl-feat-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Login card */}
        <div className="pl-right">
          <div className="pl-card">

            <div className="pl-card-badge">🌾 Kisan Market</div>
            <h2 className="pl-card-title">Swagat Hai!</h2>
            <p className="pl-card-sub">
              Login karo aur seedha kisan se taaza sabzi mangao
            </p>

            <div className="pl-divider">
              <div className="pl-divider-line" />
              <span className="pl-divider-text">apna account chuniye</span>
              <div className="pl-divider-line" />
            </div>

            {/* Google Button */}
            <button className="pl-social-btn pl-btn-google" onClick={loginGoogle}>
              <svg className="pl-btn-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="pl-btn-text">Google se Login Karo</span>
            </button>


            <p className="pl-footer-note">
              Login karke aap hamare{" "}
              <a href="#">Terms of Service</a> aur{" "}
              <a href="#">Privacy Policy</a> se agree karte ho.
            </p>

          </div>
        </div>

      </div>
    </>
  );
}
