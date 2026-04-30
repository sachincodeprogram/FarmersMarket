import { useState } from "react";

export default function SellerAddProduct(){

const [name,setName]=useState("");
const [price,setPrice]=useState("");

return(

<div style={{padding:40}}>

<h2>Add Product</h2>

<input
placeholder="Product name"
onChange={(e)=>setName(e.target.value)}
/>

<br/><br/>

<input
placeholder="Price"
type="number"
onChange={(e)=>setPrice(e.target.value)}
/>

<br/><br/>

<button>Add Product</button>

</div>

);

}