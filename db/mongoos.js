const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/login-system",{
    useUnifiedTopology: true,
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify: false

},(err,res)=>{
    if (err) throw err
    if(res){
        return console.log('db connected')
    }
})


module.exports=mongoose
