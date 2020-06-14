const Follow=require("../models/follow")

exports.addfollow=function(req, res)
{
    let follow=new Follow(req.params.username,req.visitorid)
    follow.create().then(()=>{
       req.flash("success",`Successfully followed ${req.params.username}`)
       req.session.save(()=>res.redirect(`/profile/${req.params.username}`))

    }).catch((errors)=>{
        errors.forEach(error => {
            req.flash("errors",error)
            
        });
        
        req.session.save(()=> res.redirect('/'))

    })

}

exports.removefollow=function(req, res)
{
    let follow=new Follow(req.params.username,req.visitorid)
    follow.delete().then(()=>{
       req.flash("success",`Successfully Stop Following ${req.params.username}`)
       req.session.save(()=>res.redirect(`/profile/${req.params.username}`))

    }).catch((errors)=>{
        errors.forEach(error => {
            req.flash("errors",error)
            
        });
        
        req.session.save(()=> res.redirect('/'))

    })

}
