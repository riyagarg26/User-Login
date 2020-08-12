const express = require('express')
const db = require('../db/mongoos')
const user= require('../models/users')
const bodyparser = require('body-parser')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { session } = require('passport')
const cookieparser= require('cookie-parser')
const expresssession= require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const multer = require('multer')
const { findById } = require('../models/users')
const sharp = require('sharp')
const path = require('path')

const routes = express.Router()
routes.use(methodOverride(function(req,res){
if (req.body && typeof req.body === 'object'&& '_method' in req.body) {
    let method = req.body._method
    delete req.body._method
    return method
    
}

}))

routes.use(bodyparser.urlencoded({extended:true}))

routes.use(express.static(__dirname +'/public'))
routes.use(cookieparser('secret1234'))
routes.use(expresssession({
    secret: 'secret1234',
    resave: true,
    saveUninitialized:true
}))

routes.use(passport.initialize())
routes.use(passport.session())

routes.use(flash())

routes.use(function(req,res,next){
    res.locals.success_message = req.flash('success_message',)
    res.locals.error_message =req.flash('error_message'),
    res.locals.error = req.flash('error')
    next()
})
const checkauthenticated = function(req,res,next){
    if(req.isAuthenticated()){
        res.set('cache-control','no-cache,private,no-store,must-revalidate,post-check=0,pre-check=0')
        return next()

    }else{
        res.redirect('/login')
    }

}
var storage= multer.diskStorage({
    destination:'/public/uploads',
    filename:(req,file,cb)=>{
        cb(null,file.fieldname + "_" + Date.now()+ path.extname(file.originalname))
    }
})
var upload = multer({
    storage:storage,
    limit:{
        filesize: 1000000
    },
    
}).single('file')

routes.get('/',(req,res)=>{
  res.render('register.ejs')

})

routes.get('/register',(req,res)=>{
    res.render('register.ejs')
})

routes.post('/register',upload,(req,res,next)=>{
    
  var{name,email,password,confirmpassword,} = req.body
//    var{image}=req.file.filename
//    const file= await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
      var file =req.file.filename
  var err
  if(!name || !password|| !email || !confirmpassword){
      res.render('register.ejs',{err:'please fill all details'})
  }if(password != confirmpassword){
      res.render('register.ejs',{err:'Passwords do not match'})    
  }
  if(password.length<8){
    res.render('register.ejs',{err:'Passwords must of 8 characters'})  
  }
  if(typeof err == 'undefined'){
      user.findOne({email:email},function(err,data){
          if(err ) throw err
          if(data){
            res.render('register.ejs',{err:'email id is already taken'})    
          }else{
              bcrypt.genSalt(10,(err,salt)=>{
                  if(err) throw err
                  bcrypt.hash(password,salt,(err,hash)=>{
                      if (err) throw err
                      password=hash
                      user({
                          email,
                          name,
                          password,
                          file               
                      }).save((err,data)=>{
                          
                          req.flash('success_message','you have sucessfully registered')
                          res.redirect('/login')          

                      })
                  })

              })
              
          }
      })
  }
})
// Authenticate user

const localstrategy = require('passport-local').Strategy
passport.use(new localstrategy({usernameField:'email'},(email,password,done)=>{
    user.findOne(({email:email}),(err,data)=>{
        if(err)throw err
        if(!data){
            return done(null,false,{message:'emailid not found'})
        }
        bcrypt.compare(password,data.password,(err,match)=>{
            if(err){
                return done(null,false)
            }
            if(!match){
                return done(null,false,{message:'password do not match'})
            }
            if(match){
                return done(null,data)
            }

        })

    })

}))
passport.serializeUser(function(user,cb){
    cb(null,user.id)
})
passport.deserializeUser(function(id,cb){
    user.findById(id,(err,users)=>{
        cb(err,users)
    })

})


routes.get('/login',(req,res)=>{
    res.render('login.ejs')
})
routes.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/profile',
        failureFlash:true
    })(req,res,next)
  
})


routes.get('/profile',checkauthenticated,async(req,res)=>{
    
    res.render('profile.ejs',{'user': req.user} )
      
    
})
// {'file':`/uploads/${req.file}`}

routes.get('/all',async(req,res)=>{
   
   
    const users = await user.find({},(err,Users)=>{
        if (err) throw err
        
        if(Users){
            res.render('all.ejs', {
                usersArray: Users.map(eachuser=>{
                    return( eachuser.name + '-' + eachuser.email)    
                })
            });       
        }
    }) 
    
})
routes.get('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/login')

})
routes.get('/profile/edit',checkauthenticated,(req,res)=>{
    res.render('edit.ejs')
})
routes.put('/profile/edit',async(req,res)=>{

     user.findOneAndUpdate(
        {email: req.user.email},
        {$set:{
            name:req.body.name
        }},(err,data)=>{
            if(err) throw err
            if(data) console.log('added')
        }
        )
  res.redirect('/profile')
})

module.exports = routes


