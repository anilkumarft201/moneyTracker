const mongoose=require('mongoose');
const Trans_Model=new mongoose.Schema({
    userid:String,
    tran_type:String,
    info:String,
    Amount:Number,
    trans_date:Date
});
module.exports=mongoose.model('transactions',Trans_Model);