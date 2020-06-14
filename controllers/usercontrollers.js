
const User=require('../models/User')
const post=require('../models/post')
const follow=require('../models/follow');
const Post = require('../models/post');
const jwt=require('jsonwebtoken')

exports.sharedprofiledata=async function(req,res, next)
{
      let isvisitorprofile=false;
      let isfollowing=false;
      if(req.session.user)
      {
            
            isvisitorprofile=req.profileuser._id.equals(req.session.user._id)
   isfollowing=await follow.isvisitorfollowing(req.profileuser._id,req.visitorid)
      }
      req.isvisitorprofile=isvisitorprofile;
      req.isfollowing=isfollowing;
      //checking foloower and following count
      let postcountPromise= Post.countpostbyauthor(req.profileuser._id)
      let followercountPromise= follow.countfollowersbyid(req.profileuser._id)
      let followingcountPromise= follow.countfollowingbyid(req.profileuser._id)
     let [postcount, followercount, followingcount] = await Promise.all([ postcountPromise, followercountPromise, followingcountPromise])
      req.postcount=postcount;
      req.followercount=followercount
      req.followingcount=followingcount
     next()

}

exports.mustbelogin=function(req , res ,next)
{
if(req.session.user)
{
next()
}
else
{
req.flash("errors","You must be login")
req.session.save(function(){
      res.redirect('/');
})
}

}
exports.apigetposts=async function(req, res)
{
      try{
            let authordoc= await User.findbyusername(req.params.username)
            let posts =await Post.findbyauthorid(authordoc._id)
            res.json(posts)

      }
      catch{
            res.json("Sorry, invaid User ")
      }
}

exports.apimustbelogin =function(req , res, next)
{
      try{
      req.apiuser= jwt.verify(req.body.token , process.env.jwtsecret)
      next()
      }
      catch
      {
            res.json("Sorry, you must provide a valid token")
      }
}

exports.login=function(req, res){
      let user=new User(req.body)
      user.login().then(function(result){
            req.session.user= { avatar : user.avatar ,username : user.data.username,_id : user.data._id }
            req.session.save(function(){
                  res.redirect('/');
            });
      }).catch( function(e){
      
            req.flash('errors',e);
            req.session.save(function(){
                  res.redirect('/');
            });
      
      }
      )
}

exports.apilogin=function(req, res){
      let user=new User(req.body)
      user.login().then(function(result){
            res.json(jwt.sign({_id: user.data._id} , process.env.jwtsecret , {expiresIn : '7d'}))
      }).catch( function(e){
      
      res.json("incorrect")
      
      }
      )
}

exports.logout=function(req, res)
{
req.session.destroy(function(){
      res.redirect('/');
})


}

exports.register=function(req, res)
{
      let user =new User(req.body);
      user.register().then(
            ()=>{
                  req.session.user={username: user.data.username, avatar: user.avatar,_id : user.data._id}
                  req.session.save(function(){
                        res.redirect('/');   
                     })
            }
      ).catch((regErrors)=>{
            regErrors.forEach(function(error){
                  req.flash('regErrors', error)
            })
        req.session.save(function(){
           res.redirect('/');   
        })
      });
     
}
exports.home=async function(req,res) 
{
if(req.session.user)
{
      //fetch feed of posts for current user
      let posts =await Post.getfeed(req.session.user._id)
res.render('home-dashboard',{posts : posts})
}else
{
      res.render('home',{regErrors : req.flash('regErrors')})

}
}

exports.ifuserexist=function(req, res, next)
{

User.findbyusername(req.params.username).then(function(userdoc)
{
req.profileuser=userdoc
next()
}).catch(function()
{
res.render("404")
})
}
exports.doesUsernameexist = function(req, res)
{
      User.findbyusername(req.body.username).then(function(){
            res.json(true)
      }).catch(function(){
            res.json(false)
      })

}
exports.doesEmailExist=async function(req, res)
{
   let emailbool=await User.doesEmailExist(req.body.email)
   res.json(emailbool)
}

exports.profilepostscreen=function(req , res)
{

      //ask our for post by a certain id
      post.findbyauthorid(req.profileuser._id).then(function(posts){
            res.render('profile',
            {     title : `Profile for ${req.profileuser.username}`
                  ,currentpage : "posts",
                   posts : posts,
                profileusername : req.profileuser.username,
                profileavatar: req.profileuser.avatar
               ,isfollowing: req.isfollowing
               ,isvisitorprofile:req.isvisitorprofile,
               counts: {postcount : req.postcount , followercount : req.followercount , followingcount : req.followingcount }
             })
            

            }
      ).catch(function(){
            res.render('404')
      })


}


exports.profilefollowerscreen=async function(req, res)
{
      try{
                //  res.send("followersscreen")
                  console.log("in try")
            let followers=await follow.getfollowerbyid(req.profileuser._id)
            res.render('profile-followers',{
            currentpage : "followers",
            followers: followers,
            profileusername : req.profileuser.username,
                profileavatar: req.profileuser.avatar
               ,isfollowing: req.isfollowing
               ,isvisitorprofile:req.isvisitorprofile,
               counts: {postcount : req.postcount , followercount : req.followercount , followingcount : req.followingcount }
      })
      }
      catch {
            console.log("eroor")
            res.render('404')
      }
}

exports.profilefollowingscreen=async function(req, res)
{
      try{
            //  res.send("followersscreen")
            console.log("in try")
            let following=await follow.getfollowingbyid(req.profileuser._id)
            res.render('profile-following',{
            currentpage : "following",
                  following: following,
            profileusername : req.profileuser.username,
                profileavatar: req.profileuser.avatar
               ,isfollowing: req.isfollowing
               ,isvisitorprofile:req.isvisitorprofile,
               counts: {postcount : req.postcount , followercount : req.followercount , followingcount : req.followingcount }

      })
      }
      catch {
            console.log("eroor")
            res.render('404')
      }
}