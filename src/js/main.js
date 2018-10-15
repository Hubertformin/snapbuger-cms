const {remote} = require('electron')
  const {Menu, MenuItem} = remote
//menu-context
const menu = new Menu()
  menu.append(new MenuItem({label: 'MenuItem1', click() { console.log('item 1 clicked') }}))
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}))
  //graph menu
  const graphMenu = new Menu()
  graphMenu.append(new MenuItem({label: 'Refresh', click() { console.log('item 1 clicked') }}))
  graphMenu.append(new MenuItem({label: 'autoload', type: 'checkbox', checked: true}))
  
  /*window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.popup({window: remote.getCurrentWindow()})
  }, false)*/
  const template = [
      {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },{
        label:'Navigate',
        submenu:[
            {
                label:'Dasboard',
                accelerator:'CommandOrControl+Shift+d',
                click(){document.querySelector('#dashboardLink').click();}
            },{
                label:'Products',
                accelerator:'CommandOrControl+Shift+p',
                click(){document.querySelector('#productsLink').click();}
            },{
                label:'Settings',
                accelerator:'CommandOrControl+Shift+s',
                click(){document.querySelector('#settingsLink').click();}
            },{type:'separator'},
            {
                label:'Reports',
                enabled:false,
                accelerator:'Alt+Shift+r',
                click(){document.querySelector('#reportsLink').click();}
            },{
                label:'Staff',
                enabled:false,
                accelerator:'Alt+Shift+w',
                click(){document.querySelector('#staffLink').click();}
            }
        ]
    },{
        label:'Action',
        submenu:[
            {
                label:'Create Order',
                click(){document.querySelector('#dashboardLink').click();}
            },{
                label:'Create withdrawal',
                accelerator:'CommandOrControl+Shift+w',
                click(){document.querySelector('#withdrawalModalTrigger').click()}
            },{
                label:"Sync",
                accelerator:'Alt+Shift+s',
                enabled:false
            }
        ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () {console.log("undo") }
        },
        {
            label:'About software',
            click() {
                document.querySelector('#settingsLink').click();
            }
        }
      ]
    }
  ]
  
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'account', submenu: [
            {
                label:'Profile',
                accelerator:'CommandOrControl+P',
                click(){
                    document.querySelector('#profileLink').click();
                }
            },{
                label:'Log out',
                enabled:false,
                accelerator:'CommandOrControl+L',
                click(){
                    document.querySelector('#logOutBtn').click();
                }
            }
        ]},
        {role: 'about'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })
  
    // Edit menu
    template[1].submenu.push(
      {type: 'separator'},
      {
        label: 'Speech',
        submenu: [
          {role: 'startspeaking'},
          {role: 'stopspeaking'}
        ]
      }
    )
  
    // Window menu
    template[5].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }else{
      template.unshift({
        label:'File',
        submenu:[
            {
                label:'Profile',
                accelerator:'CommandOrControl+P',
                click(){
                    document.querySelector('#profileLink').click();
                }
            },{
                label:'Log out',
                enabled:false,
                accelerator:'CommandOrControl+L',
                click(){
                    document.querySelector('#logOutBtn').click();
                }
            },{role:'quit'}
        ]
    })
  }
  const actionMenu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(actionMenu)


M.AutoInit();
//to cosesidenav when links are clicked
jQuery('#slide-out').on('click','.sideNavLink',()=>{
    if(jQuery(window).width()<992){
        var sideNav = M.Sidenav.getInstance(jQuery('#slide-out'));
        sideNav.close();
    }
})
//AUTO-COMPLETE SEARCH FORM
$('input.autocomplete').autocomplete({
    data: {
      "Orders": null,
      "Products": null,
      "Settings": null,
      "Reports": null,
      "Staff": null,
      "SBRO": null,
      "Settings": null,
      "Settings": null,
    },
  });  

//minimize sidnav
function miniSideNav(){
    jQuery('#slide-out').toggleClass('minimize');
    jQuery('#main').toggleClass('maximize');
}
//
function showSearchBar(type){
    if(type){
        jQuery('#nav-form').slideDown();
    }else{
        jQuery('#nav-form').slideUp();
    }
}
//Notification class
class Alerts{
    constructor(){
        this.successMsg= jQuery('#success');
        this.errorMsg= jQuery('#error');
        this.successMsg.children('.body').children('.close').click(()=>{
            this.successMsg.slideUp();
            clearTimeout(this.timeoutSuccess);
        })
        this.errorMsg.children('.body').children('.close').click(()=>{
            this.errorMsg.slideUp();
            clearTimeout(this.timeoutError)
        });
    }
    notify({msg,type,title},time = 4000){
        if(typeof title !== 'string'){
            title = 'Notification';
        }
        if(type == "error"){
            this.errorMsg.children('.body').children('.title').html(title)
            this.errorMsg.children('.body').children('.msg').html(msg)
             this.errorMsg.slideDown("fast");
             this.timeoutError = setTimeout(()=>{
                this.errorMsg.slideUp();
             },time)
            
        }else{
            this.successMsg.children('.body').children('.title').html(title)
            this.successMsg.children('.body').children('.msg').html(msg)
            this.successMsg.slideDown("fast")
            this.timeoutSuccess = setTimeout(()=>{
                if(this.successMsg.css('display') !== 'none'){
                    this.successMsg.slideUp()   
                }
            },time)
        }
    }
}
//search table
function searchInputTable(e,tb){
    var i,j,td,input,
    value = e.target.value.toLowerCase(),
    table = document.querySelector(tb),
    tr = table.querySelectorAll('tbody tr');
    tr.forEach((element,index) => {
        td = element.querySelectorAll('td')[1];
        input = td.getElementsByTagName('input')[0].value.toLowerCase();
        if(input.indexOf(value)>-1){
            element.style.display = "";
        }else{
            element.style.display = "none";
        }
       
    });
    
}
function searchTable(e,tb){
    var i,j,td,input,
    value = e.target.value.toLowerCase(),
    table = document.querySelector(tb),
    tr = table.querySelectorAll('tbody tr');
    tr.forEach((element,index) => {
        td = element.querySelectorAll('td');
        if(td[1].innerHTML.toLowerCase().indexOf(value)>-1){
            element.style.display = "";
        }else if(td[2].innerText.toLowerCase().indexOf(value)>-1){
            element.style.display = "";
        }else{
            element.style.display = "none";
        }
       
    });
    
}
//
function formatDate(string = ''){
    date = new Date();
    var day,month,year;
    if(string != ''){
        date = new Date(string);
    }
    day = date.getDate();
    month = date.getMonth()+1;
    year = date.getFullYear();
    if(day<10){
        day = `0${day}`
    }
    if(month<10){
        month = `0${month}`
    }
    return `${day}/${month}/${year}`;
}
function searchOrderItems(e){
    var val = jQuery(e.target).val(),items = jQuery('#orderItems .item'),
    no_result = jQuery('#no-resultsOrder');
    no_result.hide();
    //variable to change if result is found
    var found = false;
    val = val.toLowerCase();
    items.each((i,el)=>{
        jQuery(el).hide()
        item_name = jQuery(el).children('div.header').children('.dark').children('dl').children('dt.item-name').html().toLowerCase()
        item_category = jQuery(el).children('div.header').children('.dark').children('dl').children('dd.item-category').html().toLowerCase()
        item_status = jQuery(el).children('div.header').children('.dark').children('dl').children('dd.item-status').html().toLowerCase()
        //search..
        if(item_name.indexOf(val) == -1 && item_category.indexOf(val) == -1 && item_status.indexOf(val) == -1){
            found = false;
        }
        else if(item_name.indexOf(val)> -1){
            jQuery(el).show();
            found = true;
        }else if(item_category.indexOf(val)> -1){
            jQuery(el).show();
            found = true;
        }else if(item_status.indexOf(val)> -1){
            jQuery(el).show();
            found = true;
        }
    })
    if(found == false){
        no_result.show();
    }
}
//$AV_ASW
var elems = document.querySelectorAll('.dropdown-trigger');
var dropdown = M.Dropdown.init(elems, {coverTrigger:false}); 
//=========== Date function===
class DateFunction{
    constructor(){
        this.today = new Date();
        this.today_getTime = Date.now();
    }
    isToday(dt) {
        var old_date = new Date(dt).getTime(),
        diff = (this.today_getTime - old_date)/3600000;
        if(diff<24){
            return true;
        }else{
            return false;
        }
    }
}
//the notification class
const notifications = new Alerts();
//time class
const time = new DateFunction();

document.querySelector('#managerialImgInput').onchange = (e)=>{
    var img = document.querySelector('#managerialImg'),
    file = e.target.files[0];
    if(file)
    if(file.size > 400000){
        notifications.notify({type:"error",msg:"File size to large, please upload a picture below 4MB"})
        e.target.files[0] = '';
        return false;
    }
    //console.log(file);
    var url = URL.createObjectURL(file);
    img.src = url;
    
}
//===================================================================================================================================
//client side of app
//register service worker
if('serviceWorker' in navigator){
    send().catch(err=>console.log(err));
}
async function send(){
    const register = await navigator.serviceWorker.register('./js/service-worker.js');
}
    // Then later, request a one-off sync:
    navigator.serviceWorker.ready.then(function(swRegistration) {
        return swRegistration.sync.register('myFirstSync');
    });

  