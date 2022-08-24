const mongoose = require("mongoose");

const File = new mongoose.Schema(
    {
        path: {
            type: String,
            require : true
        },
        originalName:{
            type:String,
            required: true
        },
        password:String,
        downloadCount:{
            type: Number,
            required :true,
            default:0
        },
        uploadTime: { type: Date, default: Date.now },
        uploader: { type: String, default: "Anonymous" }
    }
)
//name of table, schema
module.exports = mongoose.model("File",File)