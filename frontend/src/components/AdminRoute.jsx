import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

// ✅ Admin UID(s)
const ADMIN_UIDS = [
  "bPCwZwhAVvMjO1BEYwC8io6QBb32"
];

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      const uid = user.uid;

      if (ADMIN_UIDS.includes(uid)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setChecking(false);
    });

    return () => unsub();
  }, []);

  if (checking) return <div style={{ padding: 20 }}>Checking admin...</div>;

  if (!allowed) return <Navigate to="/" replace />;

  return children;
}
