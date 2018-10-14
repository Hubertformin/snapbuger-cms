//rwquire electrom modules here
const {
    ipcRenderer,
    shell
} = require('electron');
const os = require('os');
//loading printer module
const print = require('electron').remote.require('electron-thermal-printer');
//settinh up a worker
const worker = new Worker('./js/web-worker.js');


//angular module
var app = angular.module('mainApp', ["ngRoute"]);
app.config(($routeProvider) => {
    $routeProvider
        .when("/", {
            templateUrl: "dashboard.html"
        })
        .when("/items", {
            templateUrl: "items.html"
        })
        .when("/emp", {
            templateUrl: "employee.html"
        })
        .when('/settings', {
            templateUrl: "settings.html"
        })
        .when('/reports', {
            templateUrl: "reports.html"
        })
        .when('/profile', {
            templateUrl: "profile.html"
        })
})

app.controller("mainCtr", ($scope,$filter) => {
    //listening to worker
    worker.onmessage = (e) => {
        switch (e.data) {
            case 'end-orders':
                $scope.end_orders = true;
                break;
            case 'resume-orders':
                $scope.end_orders = false;
                break;
        }
    }
    /*
    ============ DATABASES ===============
    using Dexie JS
    */
    //initializing data's

    $scope.orders = [];
    $scope.staffs = [];
    $scope.managers = [];
    $scope.users = [];
    $scope.currentUser = {};
    $scope.products = {
        categories: [],
        items: []
    }
    $scope.settings = [];
    $scope.withdrawals = [];
    $scope.todaysCompletedOrders = [];
    //
    var Dexie = require('dexie');
    $scope.db = new Dexie("snapBurgerDb");
    $scope.db.version(1).stores({
        users: "++id,&name,password,position,startDate,salary,status,is_mgr,img_url",
        categories: "++id,&name,status,action",
        items: "++id,&name,rate,category,status,action",
        orders: "++id,&inv,date,*items,totalPrice,tableNum,totalQuantity,staff",
        settings: "&id,tableNumber,time_range,auto_update,back_up,performance_report,app_id",
        withdrawals:"++id,&inv,reason,amount,date,staff",
        tracker:"++id,type,tableName,data,date,status"
    })
    //by default wahen there is no data,i.e when the database is just created, we add this to settings
        const identifier = `${os.hostname()}${Math.floor(Math.random() * (100 - 10) ) + 10}`;
        $scope.db.settings.add({
            id:1,tableNumber:1,time_range:{from:"8:00",to:"21:30"},auto_update:true,back_up:true,performance_report:true,app_id:identifier
        })
        .catch(e=>{
            return;
        })
    //fucntion to fetch all items , used in transactions
    $scope.transactionableFetch = ()=>{
        $scope.db.settings.get(1)
        .then((res) => {
        $scope.settings = res;
       })
       $scope.db.users.toArray()
       .then((data) => {
           $scope.users = data;
            $scope.users.forEach(element => {
               if (element.is_mgr == true) {
                   $scope.managers.push(element);
               } else {
                   $scope.staffs.push(element)
               }
           });
       });
       //fetched users and now fetching categories
       $scope.db.categories.toArray()
       .then((data) => {
           $scope.products.categories = data;
        })
       //fetcing items
       $scope.db.items.toArray()
       .then((data) => {
           $scope.products.items = data;
       })
       //fetching orders
       $scope.db.orders.toArray()
       .then((data) => {
           $scope.orders = data;
           $scope.orders.sort(function (a, b) {
               return (a.id < b.id) ? 1 : ((b.id < a.id) ? -1 : 0);
           });
       })
       //fetching withrawals
       $scope.db.withdrawals.toArray()
       .then((data)=>{
           $scope.withdrawals = data;
       })
       //fetched data and now apply
       $scope.$apply();
  }
    //fetching Data
    $scope.db.transaction('r', $scope.db.users, $scope.db.orders, $scope.db.categories, $scope.db.items, $scope.db.settings,$scope.db.withdrawals, () => {
        $scope.transactionableFetch();
        })
        .then(() => {
            //code to write when fetching of database succedeed!
            jQuery('#loader').remove();
            if($scope.users.length == 0 && $scope.products.categories.length == 0
                && $scope.orders.length == 0 && $scope.products.items.length == 0
                && $scope.withdrawals.length == 0)
                {
                    worker.postMessage('check-for-backup');
                    jQuery('section#dataDbCheck').show();
                    worker.onmessage = (e)=>{
                        switch(e.data){
                            case 'err-connect':
                                notifications.notify({type:"error",title:"Network Error",msg:"Failed:Error connecting to server.Check your network connection"});
                                jQuery('section#dataDbCheck').hide();
                                jQuery('#managerial').show();
                            break;
                            case 'no-data':
                                jQuery('section#dataDbCheck').hide();
                                jQuery('#managerial').show();
                                notifications.notify({type:"ok",title:"Complete",msg:"No backup found!"});
                            break;
                            case 'data-restored':
                            //re-run transaction
                            $scope.db.transaction('r', $scope.db.users, $scope.db.orders, $scope.db.categories, $scope.db.items, $scope.db.settings,$scope.db.withdrawals, () => {
                                $scope.transactionableFetch();
                            })
                            .then(()=>{
                                notifications.notify({type:"ok",title:"Complete",msg:"Data restored!"});
                                jQuery('section#dataDbCheck').hide();
                                 //show managerial if users is still not 0
                                if($scope.users.length == 0) {
                                    jQuery('#managerial').show();
                                }else{
                                    jQuery('#login').show();
                                }
                            })
                            break;
                        }
                    }
                }
            else if($scope.users.length == 0) {
                jQuery('#managerial').show();
            }
            if (sessionStorage.getItem('user') != null && $scope.users.length !== 0) {
                jQuery('#login').hide()
                $scope.currentUser = JSON.parse(sessionStorage.getItem('user'))
            } else if (sessionStorage.getItem('user') == null && $scope.users.length !== 0) {
                jQuery('#login').show();
            }
        })
        .catch(err => {
            console.log(err)
        })
    //=========== MANAGERIAL ACCOUNT! ========
    $scope.createManagerFxn = (login) => {
        img = document.querySelector('#managerialImgInput').files[0];
        if (typeof img !== 'object') {
            blob = 'img/user-grey.png';
        } else {
            blob = new Blob([img], {
                type: img.type
            })
            //var ublob = URL.createObjectURL(blob)
        }
        //default image url:img/user-grey.png
        if (typeof $scope.createManagerialFormInputName !== "string" || typeof $scope.createManagerialFormPassword !== "string") {
            notifications.notify({
                title:"Invalid values",
                msg: "Please fill all fields!",
                type: "error"
            })
            return false;
        }
        //converting first character to upper case
        $scope.createManagerialFormInputName = $scope.createManagerialFormInputName[0].toUpperCase()+$scope.createManagerialFormInputName.slice(1).toLowerCase();
        const mgr = {
            name: $scope.createManagerialFormInputName,
            password: $scope.createManagerialFormPassword,
            position: "Manager",
            is_mgr: true,
            startDate: new Date().toLocaleDateString(),
            status: "active",
            salary: 0,
            img_url: blob
        }
        $scope.db.users.add(mgr)
            .then(() => {
                $scope.db.users.toArray()
                    .then(data => {
                        $scope.users = data;
                        if(login){
                            $scope.currentUser = mgr;
                            if (typeof $scope.currentUser.img_url !== 'string') {
                                $scope.profile_pic = URL.createObjectURL($scope.currentUser.img_url)
                            }
                            sessionStorage.setItem('user', JSON.stringify($scope.currentUser));
                            jQuery('#managerial').hide();
                            jQuery('#login').hide();
                        }else{
                            $scope.managers = [];$scope.staffs = [];
                            $scope.createManagerialFormInputName = "";$scope.createManagerialFormPassword = "";
                            notifications.notify({type:"ok",title:"Complete",msg:"New manager added!"});
                            $scope.users.forEach(element => {
                                if (element.is_mgr) {
                                    $scope.managers.push(element);
                                }else{
                                    $scope.staffs.push(element);
                                }
                            });
                        }
                        $scope.$apply();
                    })
            })

    }
    //for button to create mangarial account on set up...
    jQuery("#createMgrBtn1").on('click',()=>{
        $scope.createManagerFxn(true);
    })
    //users,staff

    //======LOGIN=============================================================================================
    jQuery('#loginForm').on('submit', (e) => {
        e.preventDefault();
        if (typeof $scope.usernameLogin !== 'string' || typeof $scope.passwordLogin !== 'string') {
            notifications.notify({
                title:"Ivalid values",
                msg: "Please fill out the form!",
                type: "error"
            })
            return false;
        }
        //check if user exist
        $scope.db.users.where("name").equalsIgnoreCase($scope.usernameLogin)
            .first((data) => {
                if (typeof data !== 'object') {
                    notifications.notify({
                        title:"Error",
                        type: "error",
                        msg: "Wrong user name!"
                    });
                    return false;
                }
                if (data.password !== $scope.passwordLogin) {
                    notifications.notify({
                        title:"Error",
                        type: "error",
                        msg: "Wrong password!"
                    });
                    return false;
                }
                if (data.status == 'suspend') {
                    notifications.notify({
                        title:"Account suspended",
                        type: "error",
                        msg: "Your account is currently suspended,please contact your contact Manager!"
                    })
                    return false;
                }
                if(data.status == 'inactive'){
                    notifications.notify({
                        title:"Access denied!",
                        type: "error",
                        msg: "Your don't have enough permissions to use this application!"
                    },7500)
                    return false;
                }
                //accept and proccess
                $scope.currentUser = data;
                if (typeof $scope.currentUser.img_url !== 'string') {
                    //the reason why I'm passing it to another variable
                    //is because i want to use the initial variable when updating user data
                    $scope.profile_pic = URL.createObjectURL($scope.currentUser.img_url)
                } else {
                    $scope.profile_pic = $scope.currentUser.img_url;
                }
                $scope.$apply();
                document.querySelector('#loginForm').reset();
                sessionStorage.setItem('user', JSON.stringify($scope.currentUser));
                jQuery('#login').fadeOut();

            })

    })
    //=======LOGOUT=====================================================================
    $scope.logOut = () => {
        swal({
                title: "Are you sure?",
                text: "Unsaved changes would be lost!",
                icon: "warning",
                buttons: true,
                dangerMode: false,
            })
            .then((willDelete) => {
                if (willDelete) {
                    jQuery('#login').show();
                    $scope.currentUser = '';
                    document.querySelector('#dashboardLink').click();
                    sessionStorage.clear('user');
                } else {
                    return false;
                }
            });
    }
    //=======================================================================================================================
    //Orders
    $scope.todaysOrders = []
    $scope.currentOrder = {
        inv: '',
        date: '',
        table: 1,
        items: [],
        totalPrice: 0,
        totalQuantity: 0,
        staff: ''
    }
    //to date string angular function
    $scope.toDate = (dt) => {
        return new Date(dt).toDateString();
    }
    //===================== GENERAL SCOPE FUNCTIONS ================
    //send message to main
    $scope.sendMain = ({
        type,
        msg
    }) => {
        const send = JSON.stringify({
            type,
            msg
        });
        ipcRenderer.send('asynchronous-message', send)
    }
    //open external
    $scope.openExternal = ({
        type,
        msg
    }) => {
        switch (type) {
            case 'url':
                shell.openExternal(msg)
                break;
        }
    }
    
    //offline and online function
    function isOnline() {
        var syncBtn = jQuery('#syncBtn').children('i'),
        dropdown = jQuery('#sync_dropdown');
        syncBtn.html('sync')
        syncBtn.addClass("spin")
        dropdown.children('.icon').text('cloud_upload')
        dropdown.children('.text').text('connecting...')
        dropdown.children('button').attr('disabled','disabled');


    }
    //function of offline events
    function isOffline() {
        var syncBtn = jQuery('#syncBtn').children('i'),
        dropdown = jQuery('#sync_dropdown');
        //syncBtn.css({color:"#999"})
        syncBtn.html('sync_disabled')
        syncBtn.removeClass("spin")
        dropdown.children('.icon').text('cloud_queue')
        dropdown.children('.text').text('Sycn changes')
        dropdown.children('button').removeAttr('disabled');
    }
    //on ready
    jQuery(document).ready(() => {
        if (navigator.onLine) {
            isOnline();
        } else {
            isOffline();
        }
    })
    window.addEventListener('online', isOnline, false)
    window.addEventListener('offline', isOffline, false)

    /*
        ====================== PRINTER FUCTION ======================
    */
   $scope.printOrders = (data)=>{
       const date = `${data.date.getDate()}/${data.date.getMonth()+1}/${data.date.getFullYear()} ,${data.date.getHours()}:${data.date.getMinutes()}`;
       var print_data = [
        {type: 'bodyInit', css: {"margin": "0 0 0 0", "width": '250px'}},
         {type: 'text', value: 'Welcome to SnapBurger', style: `font-size: 18px;text-align:center;font-weight:bold;`},
         {type: 'text', value: 'Bienvenu a SnapBurger', style: `font-size: 17px;text-align:center;font-weight:bold;`},
         {type: 'text', value: date, style: `font-size: 14px;text-align:center;`}
     ]
     data.items.forEach(el=>{
        print_data.push({type: 'text', value:`- ${el.name}  ${el.quantity} X ${el.rate}`, style: `font-size: 15px;`})
     })
     print_data  = print_data.concat([
        {type: 'text', value: `Total: ${$filter('currency')(data.totalPrice, "FCFA ", 0)}`, style: `margin:25px 0 0 0;font-size: 17px;font-weight:bold`},
        {
            type: 'qrcode',
            value: data.name,
            height: 64,
            width: 64,
            style: `text-align:center;width:64px;margin: 20px 0 0 0;float:right`
        },
        {type: 'text', value: '@snapburger17', style: `text-align:center;font-size: 12px`}
     ])
     //printing....
    print.print58m( {
       data: print_data,
        preview:false,
        deviceName: 'XP-80C',
        timeoutPerLine: 400
    }).then((data)=>{
        if(data){
            notifications.notify({msg:"Added to printing queue",type:"ok"});
        }else{
            notifications.notify({title:"Print error",msg:"Error printing",type:"error"});
        }
    }).catch(err=>{
        console.error(err+'Failed');
    })
   }
   //client side for app
   
   //create redrawal
   jQuery('#createRedrawalForm').on('submit',(e)=>{
       e.preventDefault();
       if(typeof $scope.redrawReason !== 'string' ||$scope.redrawReason == ''){
            notifications.notify({
                type:"error",
                title:"Invalid value",
                msg:"Please insert a valid reason",
            })
            return;
        }
        if(typeof $scope.redrawAmount !== 'number' ||$scope.redrawAmount == ''){
            notifications.notify({
                type:"error",
                title:"Invalid value",
                msg:"Please insert a valid Amount",
            })
            return;
        }
       if(confirm(`Confirm redrawal of '${$filter('currency')($scope.redrawAmount,'FCFA ',0)}'`)){
           //data:withdrawals:"++id,inv,reason,amount,date",
           $scope.createNewWithdrawal = ()=>{
                const invc = `SBR${Math.floor(Math.random() * (9999 - 1000) ) + 1000}`;
                var data = {inv:invc,reason:$scope.redrawReason,amount:$scope.redrawAmount,date:new Date(),staff:$scope.currentUser.name}
                $scope.db.transaction('rw',$scope.db.withdrawals,()=>{
                     $scope.db.withdrawals.add(data)
                     //refresh data
                     $scope.db.withdrawals.toArray()
                     .then(data=>{
                         $scope.withdrawals = data;
                         $scope.$apply();
                     })
                })
                .then(()=>{
                     notifications.notify({
                         type:"ok",
                         title:"Withrawal registered!",
                         msg:`You have withdrawed a sum of:<br /> ${$filter('currency')($scope.redrawAmount,'FCFA ',0)}`
                     })
                     document.querySelector('#createRedrawalForm').reset();
                  })
                .catch(()=>{
                    $scope.createNewWithdrawal();        
                })
           }
           $scope.createNewWithdrawal();
       }
   })

}) //end main controller, nothing should come after here!
