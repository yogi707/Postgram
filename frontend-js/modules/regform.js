import axios from 'axios'
export default class Regform
{
    constructor()
    {
       this._csrf=document.querySelector('[name="_csrf"]').value
        this.form=document.querySelector("#registration-form")
        this.allfields=document.querySelectorAll("#registration-form .form-control")
        this.insertvalidationelements()
        this.username=document.querySelector("#username-register")
        this.email=document.querySelector("#email-register")
        this.username.previousvalue=""
        this.password=document.querySelector("#password-register")
        this.password.previousvalue=""
        this.username.isUnique=false
        this.email.isUnique=false
        this.events()
    }
    //events
    events()
    {
        this.form.addEventListener("submit",(e)=> {
            e.preventDefault()
            this.formsubmithandler()
        })
      this.username.addEventListener("keyup",()=> {
          this.isdifferent(this.username,this.usernamehandler)
      })
      this.email.addEventListener("keyup",()=> {
        this.isdifferent(this.email,this.emailhandler)
    })

    this.password.addEventListener("keyup",()=> {
        this.isdifferent(this.password,this.passwordhandler)
    })

    this.username.addEventListener("blur",()=> {
        this.isdifferent(this.username,this.usernamehandler)
    })
    this.email.addEventListener("blur",()=> {
      this.isdifferent(this.email,this.emailhandler)
  })

  this.password.addEventListener("blur",()=> {
      this.isdifferent(this.password,this.passwordhandler)
  })

    }

    formsubmithandler()
    {
        this.usernameimediatly()
        this.usernameafterdelay()
        this.emailafterdelay()
        this.passwordimediatly()
        this.passwordafterdelay()
        if(this.username.isUnique&& !this.username.errors && 
            this.email.isUnique && !this.email.errors &&
            !this.password.errors
            ){
            this.form.submit()
        }
    }
    isdifferent(el,handler)
    {
        if(el.previousvalue!=el.value)
        {
            handler.call(this)
        }
        el.previousvalue=el.value
    }
    usernamehandler()
    {
        this.username.errors=false;
        this.usernameimediatly()
        clearTimeout(this.username.timer)
        this.username.timer=setTimeout(()=> this.usernameafterdelay(), 800)
    
    }

    emailhandler()
    {
        this.email.errors=false;
        clearTimeout(this.email.timer)
        this.email.timer=setTimeout(()=> this.emailafterdelay(), 800)
    
    }
    passwordhandler()
    {
        this.password.errors=false;
        this.passwordimediatly()
        clearTimeout(this.password.timer)
        this.password.timer=setTimeout(()=> this.passwordafterdelay(), 800)
    }

    emailafterdelay()
       {
           if(!/^\S+@\S+$/.test(this.email.value))
           {
            this.showvalidationerror(this.email,"You must provide a valid email")

           }
        if(!this.email.errors){
            axios.post('/doesEmailExist',{ _csrf: this._csrf ,email: this.email.value}).then((response)=>{
                if(response.data){
                    this.email.isUnique=false
                    this.showvalidationerror(this.email,"That email is already being used")
                }
                else{
                    this.email.isUnique=true
                    this.hideValidationerror(this.email)
                }
            }).catch(()=>{
                console.log("plase try again later")
            })

        }
       }

    usernameimediatly()
    {
        if(this.username.value!="" && !/^([a-zA-Z0-9]+)$/.test(this.username.value))
        {
            this.showvalidationerror(this.username,"Username Can only contain letter and number")
           

        }
        if(this.username.value.length>30)
        {
            this.showvalidationerror(this.username,"Username cannot exceed 30 characters")
        }
        if(!this.username.errors)
     {

         this.hideValidationerror(this.username)
     }   

    }
    passwordimediatly()
    {
        if(this.password.value.length>50)
        {
            this.showvalidationerror(this.password,"Password cannot exceed 50 character")
        }
        if(!this.password.errors)
        {
            this.hideValidationerror(this.password)
        }

    }
    passwordafterdelay()
    {
        if (this.password.value.length<12)
        {
            this.showvalidationerror(this.password,"Password must be atleast 12 character")
        }
    }


    hideValidationerror(el)
    {
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")  
    }
    showvalidationerror(el,message)
    {
        el.nextElementSibling.innerHTML=message
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.errors=true;


    }

    usernameafterdelay()
    {
        if(this.username.value.length<3)
        {
            this.showvalidationerror(this.username,"Userame must be atleast 3 characters")

        }

        if(!this.username.erros)
        {
            axios.post('/doesUsernameexist',{ _csrf: this._csrf,username : this.username.value}).then((response)=>
            {
                if(response.data)
                {
                    this.showvalidationerror(this.username,"that username is already taken")
                    this.username.isUnique=false;
                }else{

                    this.username.isUnique=true

                }
               })
            .catch(()=>{

                console.log("Please try again later")
            })

        }
    }


    insertvalidationelements()
    {
        this.allfields.forEach((el)=>{
            el.insertAdjacentHTML('afterend','<div class="alert alert-danger small liveValidateMessage"></div>')
        })
    }
}

