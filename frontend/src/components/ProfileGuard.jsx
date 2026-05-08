import { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { Navigate } from "react-router-dom";

const API = import.meta.env.VITE_API;

export default function ProfileGuard({ children }) {

  const [status, setStatus] = useState(null);

  useEffect(() => {

    const unsub = auth.onAuthStateChanged(async (u) => {

      if (!u) {
        setStatus("logout");
        return;
      }

      const res = await axios.get(
        `${API}/api/users/check/${u.uid}`
      );

      if (res.data.complete) {
        setStatus("ok");
      } else {
        setStatus("profile");
      }

    });

    return () => unsub();

  }, []);

  if (status === null) return null;

  if (status === "logout") return <Navigate to="/welcome" />;

  if (status === "profile") return <Navigate to="/profile" />;

  return children;
}
