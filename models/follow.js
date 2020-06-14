const usercollection=require('../db').db().collection("users")
const followcollection=require('../db').db().collection("follows")
const ObjectID=require('mongodb').ObjectID
const User=require('./User')
const { response } = require('express')
let Follow=function(follwedusername,authorid)
{
    this.follwedusername=follwedusername;
    this.authorid=authorid;
    this.errors=[]

}
Follow.prototype.cleanup=async function(){
if(typeof(this.follwedusername)!="string" )
{
    this.follwedusername=""
}
}
Follow.prototype.validate=async function(action)
{
    let follwedAccount=await usercollection.findOne({username: this.follwedusername})
    if(follwedAccount)
    {
        this.follweddid=follwedAccount._id
    }else{
        this.errors.push("user doesn't exit")
    }

    let doesfollowexist=await followcollection.findOne({followed: this.follweddid,authorid : new ObjectID(this.authorid)})
    if(action=="create")
    {
        if(doesfollowexist)
        {
            this.errors.push("You are already following the user")
        }
    }
    if(action=="delete")
    {
        if(!doesfollowexist)
        {
            this.errors.push("You are not following this")
        }
    }
    //should not follow yourself
    if(this.follweddid.equals(this.authorid))
    {
        this.errors.push("You cannot follow yourself")
    }
}
Follow.prototype.create=function()
{
    return new Promise(async (resolve, reject)=>{
        this.cleanup()
        await this.validate("create")
        if(!this.errors.length)
        {
          await followcollection.insertOne({followed: this.follweddid,authorid : new ObjectID(this.authorid)})
            resolve();
        }else{
            reject(this.errors)
        }
    })
}

Follow.prototype.delete=function()
{
    return new Promise(async (resolve, reject)=>{
        this.cleanup()
        await this.validate("delete")
        if(!this.errors.length)
        {
          await followcollection.deleteOne({followed: this.follweddid,authorid : new ObjectID(this.authorid)})
            resolve();
        }else{
            reject(this.errors)
        }
    })
}


Follow.isvisitorfollowing=async function(followedid,visitorid)
{
    
    let followdoc=await followcollection.findOne({followed: followedid,authorid: new ObjectID(visitorid)})
    if(followdoc)
    {
        return true;
    }else{
        return false;
    }
}

Follow.getfollowerbyid=function(id)
{

return new Promise(async (resolve,reject)=>{
try{

    let followers=await followcollection.aggregate([
        {$match : {followed : id}},
        {$lookup : {from :"users", localField: "authorid",foreignField : "_id",as:"userdoc"}},
        {$project : {
            username: {$arrayElemAt :["$userdoc.username", 0]},
            email: {$arrayElemAt :["$userdoc.email", 0]}
        }}
    ]).toArray()
    followers=followers.map(function(follower){
        let user=new User(follower, true)
        return {username : follower.username , avatar: user.avatar}

    })

    resolve(followers)

}catch{
reject()
}

})
}

Follow.getfollowingbyid=function(id)
{

return new Promise(async (resolve,reject)=>{
try{

    let followers=await followcollection.aggregate([
        {$match : {authorid : id}},
        {$lookup : {from :"users", localField: "followed",foreignField : "_id",as:"userdoc"}},
        {$project : {
            username: {$arrayElemAt :["$userdoc.username", 0]},
            email: {$arrayElemAt :["$userdoc.email", 0]}
        }}
    ]).toArray()
    followers=followers.map(function(follower){
        let user=new User(follower, true)
        return {username : follower.username , avatar: user.avatar}

    })
    console.log(followers)
    resolve(followers)

}catch{
reject()
}

})
}

Follow.countfollowersbyid=function(id)
{
return new Promise(async (resolve, reject)=>{
    let followercount =await followcollection.countDocuments({followed : id})
    resolve(followercount)
})
}
Follow.countfollowingbyid=function(id)
{
return new Promise(async (resolve, reject)=>{
    let followingcount =await followcollection.countDocuments({authorid : id})
    resolve(followingcount)
})
}

module.exports=Follow;