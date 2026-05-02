import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import axios from "axios";

const ADMIN_UIDS = ["bPCwZwhAVvMjO1BEYwC8io6QBb32"];

const API = import.meta.env.VITE_API || "http://localhost:5000";

export default function Navbar(){

  const nav = useNavigate();
  const [user,setUser]=useState(null);
  const [open,setOpen]=useState(false);
  const [isSeller,setIsSeller]=useState(false);
  const [roleReady,setRoleReady]=useState(false);

  useEffect(()=>{

    const unsub = auth.onAuthStateChanged(async(u)=>{

      setUser(u);

      if(u){

        try{

          const res = await axios.get(
            `${API}/api/users/check/${u.uid}`
          );

          if(!res.data.complete){
            nav("/profile");
          }

          // role DB se aata hai — "seller" ya "admin" ya "user"
          setIsSeller(res.data.role === "seller");

        }catch(err){
          console.log("User check error:",err);
          setIsSeller(false);
        }finally{
          setRoleReady(true);
        }

      }else{
        setIsSeller(false);
        setRoleReady(true);
      }

    });

    return ()=>unsub();

  },[]);

  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  const loginGoogle = async ()=>{
    await signInWithPopup(auth,new GoogleAuthProvider());
    nav("/profile");
  };

  const loginFacebook = async ()=>{
    await signInWithPopup(auth,new FacebookAuthProvider());
    nav("/profile");
  };

  const logout = async ()=>{
    await auth.signOut();
    setIsSeller(false);
    setRoleReady(false);
    nav("/");
  };

  return(
    <>

    <div style={bar}>

      <b style={{fontSize:22,cursor:"pointer"}} onClick={()=>nav("/")}>
        🌿 Farmer Market
      </b>

      <div style={{display:"flex",gap:10,alignItems:"center"}}>

        <button style={frontBtn} onClick={()=>nav("/")}>Home</button>
        <button style={frontBtn} onClick={()=>nav("/bag")}>Bag</button>

        {!user && (
          <>
            <button style={smallBtn} onClick={loginGoogle}>Google</button>
            <button style={smallBtn} onClick={loginFacebook}>Facebook</button>
          </>
        )}

        <div style={hamburger} onClick={()=>setOpen(true)}>☰</div>

      </div>

    </div>

    {open && (
      <div style={overlay} onClick={()=>setOpen(false)}>

        <div style={drawer} onClick={e=>e.stopPropagation()}>

          <h3>Menu</h3>

          {user && (
            <>
              <MenuBtn onClick={()=>nav("/profile")}>👤 Profile</MenuBtn>
              <MenuBtn onClick={()=>nav("/orders")}>📦 Orders</MenuBtn>
            </>
          )}

          {/* SELLER MENU */}

          {roleReady && isSeller && (
            <>
              <hr/>
              <b>Seller</b>

              <MenuBtn onClick={()=>nav("/seller-dashboard")}>
                🛒 Seller Dashboard
              </MenuBtn>

              <MenuBtn onClick={()=>nav("/seller-add-product")}>
                ➕ Add Product
              </MenuBtn>
            </>
          )}

          {/* ADMIN MENU */}

          {isAdmin && (
            <>
              <hr/>
              <b>Admin</b>

              <MenuBtn onClick={()=>nav("/admin-products")}>Products</MenuBtn>
              <MenuBtn onClick={()=>nav("/admin-add")}>Add Product</MenuBtn>
              <MenuBtn onClick={()=>nav("/store")}>Store</MenuBtn>
              <MenuBtn onClick={()=>nav("/admin")}>Admin Panel</MenuBtn>
              <MenuBtn onClick={()=>nav("/admin-dashboard")}>Dashboard</MenuBtn>

              {/* ✅ NEW */}
              <MenuBtn onClick={()=>nav("/admin-sellers")}>👥 Manage Sellers</MenuBtn>

            </>
          )}

          {user && (
            <>
              <hr/>
              <MenuBtn danger onClick={logout}>Logout</MenuBtn>
            </>
          )}

        </div>

      </div>
    )}

    </>
  );
}

function MenuBtn({children,onClick,danger}){
  return(
    <button
      onClick={onClick}
      style={{
        ...menuBtn,
        background:danger?"#dc2626":"#16a34a"
      }}
    >
      {children}
    </button>
  );
}

/* STYLES — same as before */

const bar={
  height:65,
  padding:"0 20px",
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  background:"#fff",
  boxShadow:"0 3px 10px rgba(0,0,0,.1)",
  position:"sticky",
  top:0,
  zIndex:1000
};

const hamburger={
  fontSize:26,
  cursor:"pointer"
};

const smallBtn={
  background:"#16a34a",
  color:"#fff",
  border:"none",
  borderRadius:20,
  padding:"6px 12px",
  cursor:"pointer"
};

const frontBtn={
  background:"#15803d",
  color:"#fff",
  border:"none",
  borderRadius:20,
  padding:"6px 14px",
  cursor:"pointer",
  fontWeight:600
};

const overlay={
  position:"fixed",
  inset:0,
  background:"rgba(0,0,0,.4)",
  zIndex:2000
};

const drawer={
  width:260,
  height:"100%",
  background:"#fff",
  padding:20
};

const menuBtn={
  width:"100%",
  padding:12,
  marginTop:10,
  border:"none",
  borderRadius:10,
  color:"#fff",
  fontWeight:600,
  cursor:"pointer"
};