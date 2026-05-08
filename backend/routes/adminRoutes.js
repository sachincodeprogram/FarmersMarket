const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const upload = require("../utils/multer");

/* GET PRODUCTS */
router.get("/", async(req,res)=>{
  res.json(await Product.find());
});

/* ADD PRODUCT */
router.post("/add",
  upload.fields([{name:"image"},{name:"video"}]),
  async(req,res)=>{
    try{

      const name = req.body.name;
      const price = Number(req.body.price);

      const image = req.files.image[0].path;
      const video = req.files.video[0].path;

      const product = await Product.create({
        name,
        price,
        image,
        video
      });

      res.json(product);

    }catch(err){
      console.log(err);
      res.status(500).json({msg:"Upload failed"});
    }
});

/* DELETE PRODUCT */
router.delete("/:id", async(req,res)=>{
  await Product.findByIdAndDelete(req.params.id);
  res.json({success:true});
});

module.exports = router;
