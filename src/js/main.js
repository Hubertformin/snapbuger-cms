M.AutoInit();
/*jQuery('#loginForm').on('submit',(e)=>{
    e.preventDefault();
    jQuery('#loginForm').waitMe({
        effect : 'win8',
        text : '',
        bg : 'rgba(255,255,255,0.7)',
        color : '#b71c1c',
        maxSize : '',
        waitTime :3000,
        textPos : 'vertical',
        fontSize : '',
        source : '',
        onClose : ()=> {
            jQuery('#login').fadeOut()
        }
        });
})*/
//to cosesidenav when links are clicked
jQuery('#slide-out').on('click','a',()=>{
    var sideNav = M.Sidenav.getInstance(jQuery('#slide-out'));
    sideNav.close();
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
    var val = jQuery(e.target).val(),items = jQuery('#orderItems .item');
    val = val.toLowerCase();
    items.each((i,el)=>{
        jQuery(el).hide()
        item_name = jQuery(el).children('div.header').children('dl').children('dt.item-name').html().toLowerCase()
        item_category = jQuery(el).children('div.header').children('dl').children('dd.item-category').html().toLowerCase()
        item_status = jQuery(el).children('div.header').children('dl').children('dd.item-status').html().toLowerCase()
        //search..
        if(item_name.indexOf(val)> -1){
            jQuery(el).show();
        }else if(item_category.indexOf(val)> -1){
            jQuery(el).show();
        }else if(item_status.indexOf(val)> -1){
            jQuery(el).show();
        }
    })
}