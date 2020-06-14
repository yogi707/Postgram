const express= require('express');
const router=express.Router();
const usercontroller=require('./controllers/usercontrollers')
const postcontroller=require('./controllers/postcontrollers')
const followcontroller=require('./controllers/followcontrollers')


router.get('/', usercontroller.home);
router.post('/register', usercontroller.register)
router.post('/login',usercontroller.login)
router.post('/logout',usercontroller.logout)
router.post('/doesUsernameexist',usercontroller.doesUsernameexist)
router.post('/doesEmailExist',usercontroller.doesEmailExist)
//post realted routes
router.get('/create-post',usercontroller.mustbelogin,postcontroller.viewcreatescreen)
router.post('/create-post',usercontroller.mustbelogin,postcontroller.create)
router.get('/post/:id',postcontroller.viewsingle)
router.get('/post/:id/edit',usercontroller.mustbelogin,postcontroller.vieweditscreen)
router.post('/post/:id/edit',usercontroller.mustbelogin,postcontroller.edit)

router.post('/post/:id/delete',usercontroller.mustbelogin,postcontroller.delete)
//profile related
router.post('/search',postcontroller.search)
router.get('/profile/:username',usercontroller.ifuserexist,usercontroller.sharedprofiledata,usercontroller.profilepostscreen)
router.get('/profile/:username/followers',usercontroller.ifuserexist,usercontroller.sharedprofiledata,usercontroller.profilefollowerscreen)
router.get('/profile/:username/following',usercontroller.ifuserexist,usercontroller.sharedprofiledata,usercontroller.profilefollowingscreen)


//follow routes
router.post('/addfollow/:username',usercontroller.mustbelogin,followcontroller.addfollow)
router.post('/removefollow/:username',usercontroller.mustbelogin,followcontroller.removefollow)
module.exports = router;