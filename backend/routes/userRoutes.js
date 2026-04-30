const router = require("express").Router();
const User = require("../models/User");

// SAVE / UPDATE PROFILE
router.post("/profile", async (req, res) => {
  try {
    await User.updateOne(
      { uid: req.body.uid },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          address: req.body.address,
          profileDone: true
        }
      },
      { upsert: true }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHECK PROFILE COMPLETE + ROLE
router.get("/check/:uid", async (req,res)=>{
  try{

    const user = await User.findOne({ uid:req.params.uid });

    if(user && user.profileDone){
      res.json({
        complete:true,
        role:user.role || "user"   // 👈 SELLER ROLE RETURN
      });
    }else{
      res.json({
        complete:false,
        role:"user"
      });
    }

  }catch(err){
    res.status(500).json({error:err.message});
  }
});

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;