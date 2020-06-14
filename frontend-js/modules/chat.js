import dompurify from 'dompurify'
export default class Chat
{
    constructor()
    {
        this.openedyet=false
     this.chatwrapper=document.querySelector("#chat-wrapper")
     this.openicon=document.querySelector(".header-chat-icon")
     this.injecthtml()
     this.chatlog=document.querySelector("#chat")
     this.chatfield=document.querySelector("#chatField")
     this.chatform=document.querySelector("#chatForm")
     this.closeicon=document.querySelector(".chat-title-bar-close")
    
     this.events()
    }
    //events
    events()
    {
        this.chatform.addEventListener("submit",(e)=>{
                e.preventDefault()
                this.sendmessagetoserver()
        })
        this.openicon.addEventListener("click",()=>this.showchat())
        this.closeicon.addEventListener("click",()=>this.hidechat())
    }

    sendmessagetoserver()
    {
        this.socket.emit('chatmessagefrombrowser',{message: this.chatfield.value})
        console.log(this.username)
        this.chatlog.insertAdjacentHTML('beforeend',dompurify.sanitize(`<div class="chat-self">
        <div class="chat-message">
          <div class="chat-message-inner">
            ${this.chatfield.value}
          </div>
        </div>
        <img class="chat-avatar avatar-tiny" src="${this.avatar}">
      </div> `))
      this.chatlog.scrollTop=this.chatlog.scrollHeight
        this.chatfield.value= ''
        this.chatfield.focus()
    }
    showchat()
    {
        if(!this.openedyet)
        {
            this.openConnection()
        }
        this.openedyet=true;
        this.chatwrapper.classList.add("chat--visible")
        this.chatfield.focus()
    }
    openConnection()
    {

       this.socket=io()
       this.socket.on('welcome',(data)=>{
           this.username=data.username
           this.avatar=data.avatar
       })
       this.socket.on('chatmessagefromserver',(data)=>{
       this.displayMessagefromServer(data)
        
       })
    }
    displayMessagefromServer(data)
    {
      
        this.chatlog.insertAdjacentHTML('beforeend',dompurify.sanitize(` <div class="chat-other">

        <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
        <div class="chat-message"><div class="chat-message-inner">
          <a href="/profile/${data.username}"><strong>${data.username}</strong></a>
          ${data.message}
        </div></div>
      </div>`))
      this.chatlog.scrollTop=this.chatlog.scrollHeight
    }
    hidechat()
    {
        this.chatwrapper.classList.remove("chat--visible")
    }
    
    //methods
 
    injecthtml()
    {
        console.log("insie hello")
        this.chatwrapper.innerHTML=`
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
        <div id="chat" class="chat-log"></div>
        <form id="chatForm" class="chat-form border-top">
        <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
      </form>
        `
    }

}