const API = import.meta.env.VITE_API;

export default function PublicLanding(){

  return(
    <div style={{
      height:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      background:"#f4f6f8"
    }}>

      <div style={{
        width:"420px",
        padding:"40px",
        borderRadius:"12px",
        background:"#ffffff",
        boxShadow:"0 10px 40px rgba(0,0,0,0.08)",
        textAlign:"center"
      }}>

        <h1 style={{marginBottom:"10px"}}>Farmer Market</h1>

        <p style={{color:"#777",marginBottom:"35px"}}>
          Fresh Vegetables Direct From Farmers
        </p>

        <a href={`${API}/auth/google`}>
          <button style={{
            width:"100%",
            padding:"14px",
            marginBottom:"15px",
            background:"#4285F4",
            color:"#fff",
            border:"none",
            borderRadius:"6px",
            fontSize:"16px",
            cursor:"pointer"
          }}>
            Continue with Google
          </button>
        </a>

        <a href={`${API}/auth/facebook`}>
          <button style={{
            width:"100%",
            padding:"14px",
            background:"#1877F2",
            color:"#fff",
            border:"none",
            borderRadius:"6px",
            fontSize:"16px",
            cursor:"pointer"
          }}>
            Continue with Facebook
          </button>
        </a>

      </div>

    </div>
  )
}
