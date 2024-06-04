const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    mail:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    createdOn:{
        type:Date,
        default:new Date().getTime()
    }
})

module.exports=mongoose.model('User',userSchema)
