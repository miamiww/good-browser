const ById = (id) => {
    return document.getElementById(id);
}

const jsonfile = require('jsonfile');
const favicon = require('favicon-getter').default;
const path = require('path');
const uuid = require('uuid');
const bookmarks = path.join(__dirname, 'bookmarks.json');

let back = ById('back'),
    forward = ById('forward'),
    refresh = ById('refresh'),
    omni = ById('url'),
    dev = ById('console'),
    fave = ById('fave'),
    list = ById('list'),
    popup = ById('fave-popup'),
    view = ById('view');

const reloadView = () => {
    view.reload()
}

const backView = () =>{
    view.goBack();
}

const forwardView = () => {
    view.goForward();
}

const updateURL = (event) => {
    if (event.keyCode === 13){
        omni.blur();
        let val = omni.value;
        let https = val.slice(0,8).toLowerCase();
        let http = val.slice(0,7).toLowerCase();
        if (https === 'https://'){
            view.loadURL(val);
        } else if(http === 'http://'){
            view.loadURL(val)
        } else {
            view.loadURL('http://' + val);
        }
    }
} 

class Bookmark {
    constructor(id, url, faviconUrl, title) {
        this.id = id;
        this.url = url;
        this.icon = faviconUrl;
        this.title = title;
    }
} 

Bookmark.prototype.ELEMENT = () => {
    let a_tag = document.createElement('a');
    a_tag.href = this.url;
    a_tag.className = 'link';
    a_tag.textContent  = this.title;
    let favimage = document.createElement('img');
    favimage.src =  this.icon;
    favimage.className =  'favicon';
    a_tag.insertBefore(favimage, a_tag.childNodes[0]);
    return a_tag;
}

const addBookmark = () => {
    let url = view.src;
    let title = view.getTitle();
    favicon(url).then(fav => {
        let book = new Bookmark(uuid.v1(), url, fav, title);
        jsonfile.readFile(bookmarks, (err, curr) =>{
            curr.push(book);
            jsonfile.writeFile(bookmarks, curr, err => {    
            console.log(err)
            })
        })
    })
}

const openPopUp = (event) => {
    let state = popup.getAttribute('data-state');
    if (state  === 'closed'){
        popup.innerHTML = '';
        jsonfile.readFile(bookmarks, (err,obj)=>{
            if(obj.length !== 0){
                for (var i = 0; i< obj.length; i++){
                    let url = obj[i].url;
                    let icon = obj[i].icon;
                    let id = obj[i].id;
                    let title = obj[i].title;
                    let bookmark = new Bookmark(id, url, icon, title);
                    let el = bookmark.ELEMENT();
                    popup.appendChild(el);
                }
            }
            popup.style.display = 'block';
            popup.setAttribute('data-state',  'open');

        });
    } else {
        popup.style.dislpay = 'none';
        popup.setAttribute('data-state', 'closed');
    }
}

const handleUrl = (event) => {
    if (event.target.className === 'link') {
        event.preventDefault();
        view.loadURL(event.target.href);
    } else if (event.target.className === 'favicon') {
        event.preventDefault();
        view.loadURL(event.target.parentElement.href);
    }
}

const  handleDevtools = () => {
    if(view.isDevToolsOpened()){
        view.closeDevTools();
    } else {
        view.openDevTools();
    }
}

const updateNav = (event) => {
    omni.value = view.src
}

refresh.addEventListener('click', reloadView);
back.addEventListener('click', backView);
forward.addEventListener('click', forwardView);
omni.addEventListener('keydown', updateURL);
fave.addEventListener('click', addBookmark);
list.addEventListener('click', openPopUp);
popup.addEventListener('click', handleUrl);
dev.addEventListener('click', handleDevtools);
view.addEventListener('did-finish-load', updateNav);