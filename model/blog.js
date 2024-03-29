const mongoose =require("mongoose");
const {Schema} =mongoose;
const blogSchema= new mongoose.Schema({
    title:String,
    content:String,
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    approved: {
        type: Boolean,
        default: false
    }
})

module.exports=mongoose.model("blog",blogSchema);
