M.AutoInit();
jQuery('#loginForm').on('submit',(e)=>{
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
})
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
function searchTable(e,table){
    var value = e.target.value;
    var table = document.get
}
