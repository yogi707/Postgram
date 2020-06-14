import Search from './modules/search'
import Chat from './modules/chat'
import Regform from './modules/regform'
if(document.querySelector("#registration-form"))
{
    new Regform()
}
if(document.querySelector("#chat-wrapper"))
{ new Chat()  }
if( document.querySelector(".header-search-icon"))
{ new Search() }