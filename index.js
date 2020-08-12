const express = require('express')
const userroutes=require('./routes/routes.js')
const path = require('path')
const mongoose = require('./db/mongoos')
const user= require('./models/users')

const app = express()

app.set('view-engine', 'ejs')

app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:false}))
// app.use(express.static(__dirname +"/public"))

app.use(userroutes)
app.get('/all',userroutes)



app.listen(3000,()=>{
    console.log('server started successfully')
})