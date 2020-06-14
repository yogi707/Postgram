import axios from 'axios'
import dompurify from 'dompurify'
export default class Search{
    //1. select dom element and keep track of data
    constructor(){
       this._csrf=document.querySelector('[name="_csrf"]').value
        this.injecthtml()
        this.searchicon=document.querySelector(".header-search-icon")
        this.Overlay=document.querySelector(".search-overlay")
        this.closeicon=document.querySelector(".close-live-search")
        this.inputfield = document.querySelector("#live-search-field")
        this.resultsArea = document.querySelector(".live-search-results")
        this.loadericon=document.querySelector(".circle-loader")
        this.typingtimer
        this.previousvalue =""
        this.events()
    }
    //2. events
    events()
    {
        this.inputfield.addEventListener("keyup",()=> this.keypresshandler())
        this.closeicon.addEventListener("click",()=>this.closeoverlay())
        this.searchicon.addEventListener("click",(e)=>{
            e.preventDefault()
            this.openOverlay()

        })

    }
    //3, methods
    openOverlay()
    {
        this.Overlay.classList.add("search-overlay--visible")
        setTimeout(()=> this.inputfield.focus(),50)
       
    }
    closeoverlay()
    {
        this.Overlay.classList.remove("search-overlay--visible")
    }

    keypresshandler()
    {
        let value= this.inputfield.value
        if(value==""){
          clearTimeout(this.typingtimer)
          this.hideloadericon()
          this.hideresultarea()

        }
        if(value!="" && value!=this.previousvalue)
        {
            clearTimeout(this.typingtimer)
            this.showloadericon()
            this.hideresultarea()
            this.typingtimer=setTimeout(()=> this.sendrequest(),750)
        }
        this.previousvalue=value
    }

    sendrequest()
    {
        axios.post('/search', {_csrf: this._csrf ,searchterm : this.inputfield.value}).then((response)=>{
          console.log(response.data)
          this.renderresultshtml(response.data);
        }
        ).catch(()=>{
            alert("hello, the request failed")
        })
    }
    renderresultshtml(posts)
    {
      if(posts.length)
      {
        this.resultsArea.innerHTML=dompurify.sanitize(`<div class="list-group shadow-sm">
        <div class="list-group-item active"><strong>Search Results</strong> (${posts.length>1 ?`${posts.length} items found` : `1 item found`})</div>
        ${posts.map((post)=>{
          let postdate=new Date(post.createdDate)
          return `<a href="/post/${post._id}" class="list-group-item list-group-item-action">
          <img class="avatar-tiny" src="${post.author.avatar}"> <strong>${post.title}</strong>
          <span class="text-muted small">by ${post.author.username} on ${postdate.getMonth()}/${postdate.getDate()}/${postdate.getFullYear()}</span>
        </a>`
        }).join('')}
      </div>`)
      }else{
        this.resultsArea.innerHTML=`<p class="alert alert-danger text-center shadow-sm">Sorry, we could not find any results</p>`
      }
 this.hideloadericon()
 this.showresultarea()

    }

    showloadericon()
    {
        this.loadericon.classList.add("circle-loader--visible")
    }
  hideloadericon()
    {
        this.loadericon.classList.remove("circle-loader--visible")
    }
showresultarea()
{
  this.resultsArea.classList.add("live-search-results--visible")
}
hideresultarea()
{
  this.resultsArea.classList.remove("live-search-results--visible")
}

    injecthtml()
    {
        document.body.insertAdjacentHTML('beforeend',`<div class="search-overlay">
        <div class="search-overlay-top shadow-sm">
          <div class="container container--narrow">
            <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
            <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
            <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
          </div>
        </div>
    
        <div class="search-overlay-bottom">
          <div class="container container--narrow py-3">
            <div class="circle-loader"></div>
            <div class="live-search-results"></div>
          </div>
        </div>
      </div>`)
    }

}