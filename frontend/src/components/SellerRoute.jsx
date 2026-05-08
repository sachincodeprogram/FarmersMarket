import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function SellerRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "denied"

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setStatus("denied");
        return;
      }

      try {
        const res = await axios.get(`${API}/api/users/check/${u.uid}`);
        const role = res.data.role;

        if (role === "seller" || role === "admin") {
          setStatus("ok");
        } else {
          setStatus("denied");
        }
      } catch (err) {
        console.log("SellerRoute check error:", err);
        setStatus("denied");
      }
    });

    return () => unsub();
  }, []);

  if (status === "checking") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        ⏳ Checking access...
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;
}
