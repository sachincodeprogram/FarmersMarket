import { auth } from "../firebase";

const BASE_URL = `${import.meta.env.VITE_API}/api/bag`;


async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  return await user.getIdToken();
}

// ✅ GET bag (user-wise)
export async function getBagItems() {
  const token = await getToken();
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Bag fetch failed");
  return data;
}

// ✅ ADD item (qty +1)
export async function addToBagApi(product) {
  const token = await getToken();

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Add failed");
  return data;
}

// ✅ REMOVE qty (-1)
export async function removeQtyApi(productId, price = 0) {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/remove`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, price }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Remove failed");
  return data;
}