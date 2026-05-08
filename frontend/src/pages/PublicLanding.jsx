import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

export default function PublicLanding(){

  const nav = useNavigate();

  const loginGoogle = async ()=>{
    await signInWithPopup(auth,new GoogleAuthProvider());
    nav("/profile");
  };

  const loginFacebook = async ()=>{
    await signInWithPopup(auth,new FacebookAuthProvider());
    nav("/profile");
  };

  return(
    <div style={wrap}>
      <div style={card}>

        <h1 style={title}>🌿 Farmer Market</h1>

        <p style={subtitle}>
          Please login to continue
        </p>

        <button onClick={loginGoogle} style={btn("#4285F4")}>
          Continue with Google
        </button>

        <button onClick={loginFacebook} style={btn("#1877F2")}>
          Continue with Facebook
        </button>

      </div>
    </div>
  );
}

/* 🎨 RESPONSIVE PROFESSIONAL STYLE (ONLY UI) */

const wrap={
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  padding:"clamp(16px,4vw,40px)",   // auto spacing for phone→desktop
  background:"#f4f6f8"
};

const card={
  width:"100%",
  maxWidth:"420px",                 // desktop limit
  padding:"clamp(24px,5vw,40px)",   // responsive padding
  borderRadius:"16px",
  background:"#fff",
  boxShadow:"0 12px 40px rgba(0,0,0,.08)",
  textAlign:"center",
  transition:"0.3s"
};

const title={
  fontSize:"clamp(22px,3vw,28px)",  // auto resize text
  marginBottom:"10px",
  fontWeight:"700",
  color:"#111827"
};

const subtitle={
  color:"#6b7280",
  marginBottom:"28px",
  fontSize:"clamp(13px,2vw,15px)"
};

const btn=(bg)=>({
  width:"100%",
  padding:"clamp(12px,2.5vw,14px)", // responsive button size
  marginTop:"14px",
  background:bg,
  color:"#fff",
  border:"none",
  borderRadius:"8px",
  fontSize:"clamp(14px,2vw,16px)",
  cursor:"pointer",
  fontWeight:"600",
  transition:"all .25s"
});
