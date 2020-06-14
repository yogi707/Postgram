const postcollection=require('../db').db().collection("posts")
const followcollection=require('../db').db().collection("follows")
const objectid=require('mongodb').ObjectID
const User=require('./User')
const sanitise= require('sanitize-html')

let Post=function(data,userid, postid)
{
    this.data=data
    this.errors=[]
    this.userid=userid
    this.postid=postid

}

Post.prototype.cleanup=function()
{
if(typeof(this.data.title)!="string")
{ this.data.title=""  }

if(typeof(this.data.body)!="string")
{ this.data.body=""  }

this.data={
    title: sanitise(this.data.title.trim(), {allowedtags:[], allowedattributes:[]})
    ,body: sanitise(this.data.body.trim(), {allowedtags:[], allowedattributes:[]}),
    createdDate : new Date(),
    author : objectid(this.userid)
}

}

Post.prototype.validate=function()
{

if(this.data.title ==""){ this.errors.push("You must provide a title ") }
if(this.data.body ==""){ this.errors.push("You must provide a title ") }

}

Post.prototype.create=function()
{
return new Promise((resolve, reject)=>{
this.cleanup()
this.validate()
if(!this.errors.length)
{
    //save post
    postcollection.insertOne(this.data).then((info)=>{
        resolve(info.ops[0]._id)
    }).catch(()=>{
        this.errors.push("please try again later")
        reject(this.errors);
    })
    
}
else{
    reject(this.errors);
}


})
}

Post.prototype.update=function()
{
    return new Promise(async (resolve , reject)=>{

        try{
            let post=await Post.findbyid(this.postid,this.userid)
            if(post.isvisitorowner)
            {
             let status= await this.actuallyupdate()
                resolve(status)
            }else{
                reject()
            }
        }
        catch{
                reject()
        }

    })
}

Post.prototype.actuallyupdate= function(){
return new Promise(async (resolve, reject)=>{
    this.cleanup()
    this.validate()
    if(!this.errors.length)
    {
       await postcollection.findOneAndUpdate( {_id : new objectid(this.postid)},{$set : {title : this.data.title, body : this.data.body}})
        resolve("success")
    }
    else
    {
        resolve("failure")
    }


})
}

Post.reusablepostquery=function(uniqueop, visitorid){
    return new Promise(async function(resolve , reject){
    
     let aggop=uniqueop.concat([
                
        {$lookup : {from : "users", localField: "author" , foreignField: "_id" , as :"authordoc" }}
        ,{$project : {
            title: 1,
            body : 1,
            createdDate: 1,
            authorid: "$author",
            author :{$arrayElemAt : ["$authordoc",0]}
        }}
    
    ]) 
        
            let posts=await postcollection.aggregate(aggop).toArray()
            //cleap up author property in each post object
            posts= posts.map(function(post){
                post.isvisitorowner = post.authorid.equals(visitorid)
                post.authorid= undefined
                post.author={
                    username: post.author.username,
                    avatar: new User(post.author, true).avatar
    
                }
                return post
            })
           resolve(posts)
    
    })
    }
    

Post.findbyid=function(id, visitorid){
    return new Promise(async function(resolve , reject){
    
        if(typeof(id)!="string" || !objectid.isValid(id))
        {
            reject()
            return
        }
         
        let posts =await Post.reusablepostquery([
            {$match : {_id : new objectid(id)}}
        ],visitorid)
           
            if(posts.length)
            {
                    console.log(posts[0])
                    resolve(posts[0])
            }else{
                    reject()
            }
        
    
    })
    }
    

Post.findbyauthorid=function(authorid)
{
return Post.reusablepostquery([
    {$match: {author: authorid}} ,
    {$sort : {createdDate : -1}}
])

}

Post.delete=function(deletedid , currentid)
{
    return new Promise(async (resolve , reject)=>{
        try{
            let post=await Post.findbyid(deletedid, currentid)
            if(post.isvisitorowner)
            {
                console.log(currentid)
               await postcollection.deleteOne({_id : new objectid(deletedid)})
                resolve()
            }else{
                    reject()
            }

        }
        catch{
            reject()
        }
    })
}


Post.search=function(searchterm)
{
    return new Promise(async (resolve,reject)=>{
        if(typeof(searchterm)=="string")
        {
            let posts=await Post.reusablepostquery([
                {$match: {$text :{$search : searchterm}}},
                {$sort:{score : {$meta : "textScore"}}}
            ])
            resolve(posts)
        }else{
            reject();
        }


    })
}

Post.countpostbyauthor=function(id)
{
return new Promise(async (resolve, reject)=>{
    let postcount =await postcollection.countDocuments({author : id})
    resolve(postcount)
})
}

Post.getfeed=async function(id)
{
    //create an array of user that i follow
    let followeduser=await followcollection.find({
        authorid: new objectid(id) }).toArray()
        followeduser=followeduser.map(function(follodoc){
            return follodoc.followed
        })


    //look for post where the author is in the array above;
    return Post.reusablepostquery([
        {$match : {author : {$in : followeduser}}},
        { $sort : {createdDate : -1 } }
    ])


}

module.exports= Post;