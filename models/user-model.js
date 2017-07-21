const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const myUserSchema = new Schema(
  {
    username:{
      type: String,
      required: true
    },
    email:{
      type: String,
      required: true
    },
    encryptedPassword:{
      type:String,
      required:true
    }
  },
  {
    timestamps: true
  }
);
const UserModel = mongoose.model('User', myUserSchema);


module.exports = UserModel;
