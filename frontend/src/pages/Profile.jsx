import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API;

export default function Profile() {

  const nav = useNavigate();

  const [user, setUser] = useState(undefined);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    const res = await fetch(`${API}/api/users`);
    const data = await res.json();

    const found = data.find(x => x.uid === user.uid);
    if (found) {
      setName(found.name || "");
      setPhone(found.phone || "");
      setAddress(found.address || "");
    }
    setLoading(false);
  };

  if (user === undefined || loading) return <h3 style={{ padding: 40 }}>Loading...</h3>;
  if (!user) return <Navigate to="/" />;

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      await updateProfile(auth.currentUser, { photoURL: reader.result });
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!name || !phone || !address) {
      alert("Please fill all fields");
      return;
    }

    await fetch(`${API}/api/users/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, name, phone, address })
    });

    nav("/");
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      setLat(latitude);
      setLng(longitude);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();

      setAddress(data.display_name || `${latitude}, ${longitude}`);

    }, () => {
      alert("Location permission denied");
    });
  };

  return (
    <div style={wrap}>
      <div style={card}>

        <label style={avatarWrap}>
          <img src={user.photoURL || "https://i.pravatar.cc/100"} style={avatar} />
          <input type="file" hidden onChange={uploadPhoto} />
          <span style={edit}>Change</span>
        </label>

        <h2>Edit Profile</h2>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={input} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" style={input} />
        <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" style={{ ...input, height: 90 }} />

        <button onClick={getLocation} style={gps}>📍 Use Current Location</button>

        {lat && (
          <iframe
            title="map"
            style={map}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
          />
        )}

        <button onClick={save} style={btn}>Save Changes</button>

      </div>
    </div>
  );
}

/* STYLES */

const wrap = {
  minHeight: "100vh",
  background: "#f3f4f6",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20
};

const card = {
  background: "#fff",
  padding: 30,
  borderRadius: 18,
  width: "100%",
  maxWidth: 450,
  boxShadow: "0 10px 30px rgba(0,0,0,.12)",
  textAlign: "center"
};

const avatarWrap = {
  position: "relative",
  display: "inline-block",
  marginBottom: 15
};

const avatar = {
  width: 100,
  height: 100,
  borderRadius: "50%",
  border: "4px solid #16a34a"
};

const edit = {
  position: "absolute",
  bottom: 0,
  right: 0,
  background: "#16a34a",
  color: "#fff",
  fontSize: 11,
  padding: "4px 8px",
  borderRadius: 12
};

const input = {
  width: "100%",
  padding: 14,
  marginTop: 14,
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 16
};

const gps = {
  marginTop: 15,
  width: "100%",
  padding: 13,
  borderRadius: 10,
  border: "2px dashed #16a34a",
  background: "#ecfdf5",
  color: "#16a34a",
  fontWeight: 600
};

const map = {
  marginTop: 15,
  width: "100%",
  height: 200,
  border: "none",
  borderRadius: 12
};

const btn = {
  marginTop: 20,
  width: "100%",
  padding: 14,
  border: "none",
  borderRadius: 10,
  background: "#16a34a",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16
};
