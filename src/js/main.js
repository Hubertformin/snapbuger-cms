M.AutoInit();
//to cosesidenav when links are clicked
jQuery('#slide-out').on('click','.sideNavLink',()=>{
    if(jQuery(window).width()<992){
        var sideNav = M.Sidenav.getInstance(jQuery('#slide-out'));
        sideNav.close();
    }
})
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
        this.successMsg.click(()=>{
            this.successMsg.slideUp();
        })
        this.errorMsg.click(()=>{
            this.errorMsg.slideUp();
            clearTimeout()
        })
    }
    notify({msg,type}){
        if(type == "error"){
            this.errorMsg.children('.msg').html(msg)
             this.errorMsg.slideDown("fast");
             setTimeout(()=>{
                this.errorMsg.slideUp();
             },3600)
            
        }else{
            this.successMsg.children('.msg').html(msg)
            this.successMsg.slideDown("fast")
            setTimeout(()=>{
                if(this.successMsg.css('display') !== 'none'){
                    this.successMsg.slideUp()   
                }
            },3600)
        }
    }
}

//search table
function searchTable(e,tb){
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

//context-menu
/*document.addEventListener('contextmenu',(e)=>{
    e.preventDefault();
    jQuery('#context-menu').fadeIn();
    var menu = document.querySelector('#context-menu')
    menu.style.top = mouseY(event)+'px';
    menu.style.left = mouseX(event)+'px';
    window.event.returnValue = false;
},false)
document.addEventListener('click',()=>{
    jQuery('#context-menu').fadeOut();
})
function mouseX(e){
    if(e.pageX){
        return e.pageX;
    }else if(e.clientX){
        return e.clientX + (document.documentElement.scrollLeft)?document.documentElement.scrollLeft:document.body.scrollLeft;
    }else{
        return null;
    }
}
function mouseY(e){
    if(e.pageY){
        return e.pageY;
    }else if(e.clientY){
        return e.clientY + (document.documentElement.scrollTop)?document.documentElement.scrollTop:document.body.scrollTop;
    }else{
        return null;
    }
}*/
document.querySelector('#managerialImgInput').onchange = (e)=>{
    var img = document.querySelector('#managerialImg'),
    file = e.target.files[0];
    if(file.size > 400000){
        notifications.notify({type:"error",msg:"File size to large, please upload a picture below 4MB"})
        return false;
    }
    //console.log(file);
    var url = URL.createObjectURL(file);
    img.src = url;
    
}