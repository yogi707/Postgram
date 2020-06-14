const express= require('express');
const session=require('express-session')
const Mongostore=require('connect-mongo')(session)
const flash=require('connect-flash')
const markdown=require('marked')
const csrf=require('csurf')
const app=express();
const sanitise=require('sanitize-html')

app.use(express.urlencoded({extended : false }))
app.use(express.json())
app.use('/api', require('./router-api'))

let sessionoptions=session({
    secret: "javascript is so cool"
    ,store : new Mongostore({client : require('./db')})
    ,resave : false,
    saveUninitialized : false,
    cookie : {maxAge : 1000 * 60 *60 * 24 , httpOnly :true}
})


app.use(sessionoptions)
app.use(flash());
app.use(function(req, res , next){
    //marked down use
    res.locals.filterhtml=function(content)
    {
return sanitise(markdown(content),{allowedTags : ['p','br','ul','ol','li','strong','bold','i','em','h1','h2'],allowedAttributes : {}})
    }

    // sucess and error to show
    res.locals.errors= req.flash("errors")
    res.locals.success= req.flash("success")

 // make current user id available to req object
 if(req.session.user)
 {
     req.visitorid=req.session.user._id } else { req.visitorid= 0 }
 

 // provide session data to the html pages
res.locals.user=req.session.user;
next()
})
const router= require('./router.js');


app.use(express.static('public'));
app.set('views','views');
app.set('view engine','ejs')
app.use(csrf())
app.use(function(req ,res ,next){
    res.locals.csrfToken= req.csrfToken()
    next()

}) 
app.use('/', router);
app.use(function(err,req,res, next){
    if(err)
    {
        if(err.code =="EBADCSRFTOKEN")
        {
            req.flash('errors',"Cross site attack detected")
            req.session.save(()=> res.redirect('/'))
        }
        else{
            res.render("404")

        }
    }
    

}) 

const server = require('http').createServer(app)

const io= require('socket.io')(server)
io.use(function(socket, next)
{
sessionoptions(socket.request,socket.request.res,next)
})

io.on('connection',function(socket){
    
    if(socket.request.session.user)
    {
        let user=socket.request.session.user
        socket.emit('welcome',{username : user.username , avatar: user.avatar})
        socket.on('chatmessagefrombrowser', function(data){
            socket.broadcast.emit('chatmessagefromserver',{message : sanitise(data.message,{ allowedTags : [], allowedAttributes: {}}), username : user.username,avatar : user.avatar})
        })

    }

})
module.exports=server;
