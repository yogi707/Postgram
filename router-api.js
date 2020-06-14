const apirouter=require('express').Router()
const usercontroller=require('./controllers/usercontrollers')
const postcontroller=require('./controllers/postcontrollers')
const followcontroller=require('./controllers/followcontrollers')
const cors= require('cors')
apirouter.use(cors())

apirouter.post('/login', usercontroller.apilogin)
apirouter.post('/create-post',usercontroller.apimustbelogin, postcontroller.apicreate)
apirouter.delete('/post/:id',usercontroller.apimustbelogin,postcontroller.apidelete)
apirouter.get('/posts/:username',usercontroller.apigetposts)
module.exports=apirouter