const Post=require('../models/post')
exports.viewcreatescreen= function(req, res)
{
res.render('create-post');
}

exports.create=function(req, res)
{

    let post=new Post(req.body, req.session.user._id)
    post.create().then(function(newid){
        req.flash("success","New post successfully created.")
        req.session.save(()=> res.redirect(`/post/${newid}`))
    }).catch(function(errors){
            errors.forEach((error)=> req.flash("errors",error))
            req.session.save(()=> res.redirect("create-post"))
    })

}

exports.apicreate=function(req, res)
{

    let post=new Post(req.body, req.apiuser._id)
    post.create().then(function(newid){
     res.json("congrats")
    }).catch(function(errors){
           res.json(errors)
    })

}

exports.viewsingle=async function(req, res)
{
    try {
        let post=await Post.findbyid(req.params.id,req.visitorid)
        console.log("in the view single")
        res.render('single-post',{post:post,title: post.title })
    }
    catch{
        res.render('404')
    }
}


exports.vieweditscreen=async function(req ,res)
{
try{

    let post = await Post.findbyid(req.params.id,req.visitorid) 

    if(post.isvisitorowner){

        res.render('edit-post',{ post : post});
    }else{
        req.flash("errors","You do not have permission to perfrom edit action okk")
        req.session.save(()=>{ res.redirect("/")})        
    }

}catch{
res.render("404")
}

}

exports.edit=function(req , res)
{
    let post=new Post(req.body, req.visitorid , req.params.id)
    post.update().then(function(status)
        {
            //the post is successfully updated
            //or user have permission but validation errors
            if(status=="success")
            {

                //success in db
                req.flash("success","Post successfully updated.")
                req.session.save(function(){
                    res.redirect(`/post/${req.params.id}/edit`)
                })

            }else{
                post.errors.forEach(function(error){
                    req.flash("errors",error)
                })
                req.session.save(function(){
                        res.redirect(`/post/${req.params.id}/edit`)
                })

            }

        }
    ).catch(function()
    {
        //a post with id doesn't exit or not the owner of post
        req.flash("errors","You don't have permission to perform that action")
        req.session.save(function(){
            res.redirect("/")
        })
    
    })

}

exports.delete =function(req, res){
        
    Post.delete(req.params.id,req.visitorid).then(()=>{
        req.flash("success","Post successfully deleted")
        req.session.save(()=>{ res.redirect(`/profile/${req.session.user.username}`)})
    }).catch(()=>{
        req.flash("errors","Your don't have permission")
        req.session.save(()=>{ res.redirect("/")})

    })
}
exports.apidelete =function(req, res){
        
    Post.delete(req.params.id,req.apiuser._id).then(()=>{
        res.json("success")
    }).catch(()=>{
        res.json("You don't have permission")

    })
}

exports.search=function(req, res)
{
    Post.search(req.body.searchterm).then((posts)=>{
        res.json(posts)
    }).catch(()=>{
        res.json([])
    })
}