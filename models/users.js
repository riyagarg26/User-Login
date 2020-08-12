const mongoose = require('mongoose')
const validator= require('validator')

const schemma  = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,

             
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:8,
        

    },
    file:{
        type:Buffer
    }
    

})



const user = mongoose.model('user',schemma)

module.exports= user
