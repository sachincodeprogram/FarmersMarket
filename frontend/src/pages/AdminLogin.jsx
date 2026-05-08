import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./AdminLogin.css";   // ✅ CSS Added

export default function AdminLogin(){

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(false);
  const navigate = useNavigate();

  const handleLogin = async ()=>{

    if(!email||!password){
      setMsg("❌ Fill all fields");
      return;
    }

    try{
      setLoading(true);
      setMsg("Logging in...");

      await signInWithEmailAndPassword(auth,email,password);
      setMsg("✅ Admin login success");
      navigate("/admin");

    }catch(err){
      setMsg("❌ Invalid email or password");
    }

    setLoading(false);
  };

  return(
    <div style={wrap} className="adminlogin-wrap">

      <div style={card} className="adminlogin-card">

        <h2 style={{marginBottom:20}} className="adminlogin-title">🔐 Admin Login</h2>

        <input
          style={input}
          className="adminlogin-input"
          placeholder="Admin Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />

        <input
          style={input}
          className="adminlogin-input"
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />

        <button
          style={btn}
          className="adminlogin-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading?"Logging in...":"Login"}
        </button>

        {msg && <div style={msgBox} className="adminlogin-msg">{msg}</div>}

      </div>

    </div>
  );
}

/* EXISTING INLINE STYLES (UNCHANGED) */

const wrap={
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#f3f4f6",
  padding:20
};

const card={
  background:"#fff",
  padding:30,
  borderRadius:16,
  width:"100%",
  maxWidth:380,
  boxShadow:"0 10px 25px rgba(0,0,0,.12)",
  textAlign:"center"
};

const input={
  width:"100%",
  padding:14,
  marginTop:12,
  borderRadius:10,
  border:"1px solid #ddd",
  fontSize:15
};

const btn={
  marginTop:20,
  width:"100%",
  padding:14,
  border:"none",
  borderRadius:12,
  background:"#16a34a",
  color:"#fff",
  fontWeight:700,
  cursor:"pointer",
  fontSize:16
};

const msgBox={
  marginTop:15,
  fontWeight:600
};
