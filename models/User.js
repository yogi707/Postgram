const usercollection=require('../db').db().collection("users")
const bcrypt=require('bcryptjs')
const validator=require('validator')
const md5=require('md5');
const { response } = require('express');
let User=function(data,postavatar)
{
this.data=data;
this.errors=[];
if(postavatar== undefined){ postavatar=false}
if(postavatar){this.getAvatar()}


}

User.prototype.login= function()
{
  return new Promise((resolve, reject) => {

    this.cleanup();
    usercollection.findOne({username: this.data.username }).then((attempted) => {
        if(attempted && bcrypt.compareSync(this.data.password, attempted.password))
        {
            this.data=attempted;
            this.getAvatar();
            resolve("congrats");
        }
        else{
                reject("invalid");
        }

    }).catch(function() {
        reject("Please try again later");
    });



  })
    
    
   

}

User.doesEmailExist=function(email)
{
    return new Promise(async function(resolve, reject){
        if(typeof(email)!="string")
        {
            resolve(false)
            return
        }

        let user=await usercollection.findOne({email : email})
        if(user)
        {
            resolve(true)
        }else{
            resolve(false)
        }
    })
}


User.prototype.cleanup=function()
{
if(typeof(this.data.username)!="string")
{
    this.data.username=""
}
if(typeof(this.data.email)!="string")
{
    this.data.email=""
}
if(typeof(this.data.password)!="string")
{
    this.data.password=""
}

this.data={
    username : this.data.username.trim().toLowerCase()
    ,email : this.data.email.trim().toLowerCase()
    ,password: this.data.password
}

}

User.prototype.validate = function()
{
    return new Promise(async (resolve, reject)=>
    {
    if( this.data.username=="")
    {
    this.errors.push("You must provide username");
    }
    if( this.data.password=="")
    {
    this.errors.push("You must provide password");
    }
    if(!validator.isEmail(this.data.email) && this.data.email!=""){ this.errors.push("invalid email")  }
    if(this.data.username!="" && !validator.isAlphanumeric(this.data.username)){ this.errors.push("Username should be alpanumeric") }
    if( this.data.email=="")
    {
    this.errors.push("You must provide email");
    }
    if(this.data.password.length >0 && this.data.password.length <12)
    {
        this.errors.push("Password is short");
    }
    if(this.data.password.length> 50){ this.error.push("Password cannot exceed 50 characters ")  }
    
    if(this.data.username.length >0 && this.data.username.length <3)
    {
        this.errors.push("Username is short");
    }
    if(this.data.username.length> 30){ this.error.push("Username cannot exceed 30 characters ")  }
    
    //username are valid then
    if(this.data.username.length>2 && this.data.username.length<31 && validator.isAlphanumeric(this.data.username))
    {   let usernameexist=await usercollection.findOne({username : this.data.username})
        if(usernameexist){ this.errors.push("that username is already taken")}
    }
    
    if(validator.isEmail(this.data.email))
    {   let emailexist=await usercollection.findOne({email : this.data.email})
        if(emailexist){ this.errors.push("that email is already taken")}
    }
    
    resolve()
    })
}



User.prototype.register=function(){
    return new Promise(async (resolve, reject)=>
    {
    //step1 : validate user data
    this.cleanup()
    await this.validate()
    //step2 : no error then save it in database 
    if(!this.errors.length)
    {
        //hash user password
        let salt=bcrypt.genSaltSync(10);
        this.data.password=bcrypt.hashSync(this.data.password , salt);
        await usercollection.insertOne(this.data)
        this.getAvatar();
        resolve();
    }
    else{
            reject(this.errors);
    }
    
    }
    )
}


User.prototype.getAvatar=function()
{
    this.avatar= `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`


}
User.findbyusername=function(username)
{
return new Promise(function(resolve , reject){
if(typeof(username)!="string")
{
    reject()
    return 
}

usercollection.findOne({username: username}).then(function(userdoc){
    if(userdoc)
        {
            userdoc=new User(userdoc,true)
            userdoc={
                _id: userdoc.data._id,
                username:userdoc.data.username,
                avatar : userdoc.avatar

            }
        
            resolve(userdoc)
        }
        else{
            reject()
        }

    }).catch(function() {
        reject()
    })


})
}




module.exports= User