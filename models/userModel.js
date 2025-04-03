import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
      },
      loginId: {
        type: String,
        required: true
      },
      password: {
        type:String,
        required:true
      },
      
      
},{timestamps:true});

export default mongoose.model('user',userModel)