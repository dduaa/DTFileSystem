const mongoose = require("mongoose");

const User = new mongoose.Schema(
    {
        name: {
            type: String,
            require : true
        },
        password:{
            type:String,
            required: true
        },
        type:{
            type: String,
            required: true,
            default: "Customer"
        },
        avatar:{
            type: String,
            required :true,
        },
        createTime: { type: Date, default: Date.now },
    }
)
//name of table, schema
module.exports = mongoose.model("User",User)