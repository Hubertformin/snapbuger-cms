//rwquire electrom modules here
const {
    ipcRenderer
} = require('electron');
const os = require('os');
//loading printer module
const print = remote.require('electron-thermal-printer');




//angular module
var app = angular.module('mainApp', ["ngRoute"]);
app.config(($routeProvider) => {
    $routeProvider
        .when("/", {
            templateUrl: "dashboard.html"
        })
        .when("/today", {
            templateUrl: "todaysOrders.html"
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

app.controller("mainCtr", ($scope, $filter) => {
    //push date
    if(localStorage.getItem("PUSH_DATE") !== null) {
        $scope.PUSH_DATE_INTERVAL = localStorage.getItem("PUSH_DATE");
    }else {
        $scope.PUSH_DATE_INTERVAL = "30";
        localStorage.setItem("PUSH_DATE","30");
    }
    //listening to worker
    $scope.SETTINGS = {
        connect_host:false
    };
    $scope.alerted = null;
    worker.onmessage = (e) => {
        switch (e.data) {
            case 'end-orders':
                $scope.end_orders = true;
                $scope.$apply();
                break;
            case 'resume-orders':
                $scope.end_orders = false;
                $scope.$apply();
                break;
            default:
                try {
                    var end_alert = JSON.parse(e.data),
                        min;
                    if (end_alert.type == "end-orders-alert") {
                        min = end_alert.min;
                        if ($scope.alerted !== null) {
                            if (min !== $scope.alerted) {
                                //alert
                                $scope.alerted = min;
                                notifications.notify({
                                    type: "error",
                                    title: `Orders ending in ${min} mins`,
                                    msg: `Orders ending in ${min} minutes be sure to save all`
                                }, 4000, true)
                            }
                        } else {
                            //alert
                            $scope.alerted = min;
                            console.log($scope.alerted)
                            notifications.notify({
                                type: "error",
                                title: `Orders ending in ${min} mins`,
                                msg: `Orders ending in ${min} minutes be sure to save all`
                            }, 4000, true);

                        }
                    }
                    $scope.$apply();
                } catch (e) {
                    break;
                }
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
        items: [],
        orderCategories:[]
    };
    $scope.settings = {};
    $scope.withdrawals = [];
    $scope.todaysCompletedOrders = [];
    //
    var Dexie = require('dexie');
    //import 'dexie-observable';
    //require('dexie-observable');
    $scope.db = new Dexie("snapBurgerDb");
    $scope.db.version(1).stores({
        users: "++id,&name,password,position,startDate,salary,status,is_mgr,img_url",
        categories: "++id,&name,status,action",
        items: "++id,&name,rate,category,status,action",
        orders: "++id,&inv,date,*items,totalPrice,tableNum,totalQuantity,staff",
        settings: "&id,tableNumber,time_range,auto_update,back_up,performance_report,app_id",
        withdrawals: "++id,&inv,category,reason,receiver,amount,date,staff",
        tracker: "++id,type,tableName,data,date,status"
    });
    $scope.db.version(2).stores({
        items: "++id,&name,rate,category,status,action,orderCategory",
        orders: "++id,&inv,date,*items,totalPrice,tableNum,totalQuantity,staff,completed",
        orderCategory:"++id,&name",
        reportsDate:"&id,startDate, endDate",
        settings: "&id,tableNumber,time_range,auto_update,back_up,performance_report,app_id, host_url,host, print_extra,language",
        itemSync:"state",
    }).upgrade (trans => {
        return trans.orders.toCollection().modify (item => {
            item.completed = true;
        });
    });

    //$scope.db.open();
    //by default wahen there is no data,i.e when the database is just created, we add this to settings
    const identifier = `${os.hostname()}${Math.floor(Math.random() * (100 - 10) ) + 10}`;
    $scope.db.settings.add({
            id: 1,
            tableNumber: 1,
            time_range: {
                from: "8:00",
                to: "21:30"
            },
            auto_update: true,
            back_up: true,
            performance_report: true,
            app_id: identifier
        })
        .catch(e => {
            return;
        })
    //fucntion to fetch all items , used in transactions
    $scope.transactionableFetch = () => {
        $scope.db.settings.get(1)
            .then((settings) => {
                $scope.settings = settings;
                console.log(settings);

                $scope.settings.host_url =  ($scope.settings.host_url === undefined)?"localhost":$scope.settings.host_url;
                $scope.settings.host_port =  ($scope.settings.host_port === undefined)? 4000 :$scope.settings.host_port;
                $scope.settings.hostComputer =  ($scope.settings.hostComputer === undefined)? false :$scope.settings.hostComputer;
                $scope.settings.hostBroadcast =  ($scope.settings.hostBroadcast === undefined)? false :$scope.settings.hostBroadcast;
                $scope.settings.remotePrinting =  ($scope.settings.remotePrinting === undefined)? false :$scope.settings.remotePrinting;
                $scope.settings.broadcast_port =  ($scope.settings.broadcast_port === undefined)? 4000 :$scope.settings.broadcast_port;
                $scope.settings.printOrders = $scope.settings.printOrders === undefined ? true : $scope.settings.printOrders;
                $scope.settings.printPreview = $scope.settings.printPreview === undefined ? false : $scope.settings.printPreview;
                $scope.settings.timeoutPerLine = $scope.settings.timeoutPerLine === undefined ? 400 : $scope.settings.timeoutPerLine;
                $scope.settings.printOrderCompartments = $scope.settings.printOrderCompartments === undefined ? false : $scope.settings.printOrderCompartm
                $scope.settings.ordersAutoCompletion = $scope.settings.ordersAutoCompletion === undefined ? true : $scope.settings.ordersAutoCompletion;

                $scope.db.settings.put($scope.settings);
                //right status
                Status.insertRight(($scope.settings.hostComputer)?`<i class="material-icons blue-text">wifi_tethering</i> Host server running.`:`<i class="material-icons blue-text">nature</i> Peer computer.`);
            });
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
        $scope.db.orderCategory.each((item) => {
                $scope.products.orderCategories.push({name:item.name, template:''});
            }).then(() => {
        });
        //CATEGORIES
        $scope.db.categories.count()
            .then((count) => {
                $scope.CATEGORIES_COUNT = count;
            })
        //fetcing items
        $scope.db.items.count()
            .then((count) => {
                $scope.ITEMS_COUNT = count;
            })
        //fetching orders
        $scope.db.orders.count()
            .then((count)=> {
                $scope.ORDERS_COUNT = count;
            })
        //fetching withrawals
        $scope.db.withdrawals.count()
            .then((count) => {
                $scope.WITHDRAWALS_COUNT = count;
            });
        //fetched data and now apply
        $scope.$apply();
    }
    //fetching Data
    $scope.db.transaction('r', $scope.db.users, $scope.db.orders, $scope.db.categories, $scope.db.items, $scope.db.settings,$scope.db.orderCategory, $scope.db.withdrawals, () => {
            $scope.transactionableFetch();
        })
        .then(() => {
            //code to write when fetching of database succedeed!
            jQuery('#appLoader').waitMe("hide");
            jQuery('#loginInputs').css({
                visibility: "visible"
            })
            //jQuery('#loader').remove();
            if ($scope.users.length === 0 && $scope.ITEMS_COUNT === 0 &&
                $scope.ORDERS_COUNT === 0 && $scope.CATEGORIES_COUNT === 0 &&
                $scope.WITHDRAWALS_COUNT === 0) {
                worker.postMessage('check-for-backup');
                jQuery('section#dataDbCheck').show();
                worker.onmessage = (e) => {
                    switch (e.data) {
                        case 'err-connect':
                            jQuery('#DBcheckstatusText').html('Restoring from local back up...')
                            worker.postMessage('check-file-backup');
                            break;
                        case 'no-data':
                            jQuery('section#dataDbCheck').hide();
                            jQuery('#managerial').show();
                            notifications.notify({
                                type: "ok",
                                title: "Complete",
                                msg: "No backup found!"
                            });
                            break;
                        case 'data-restored':
                            //re-run transaction
                            $scope.db.transaction('r', $scope.db.users, $scope.db.orders, $scope.db.categories, $scope.db.items, $scope.db.settings, $scope.db.withdrawals, () => {
                                    $scope.transactionableFetch();
                                })
                                .then(() => {
                                    notifications.notify({
                                        type: "ok",
                                        title: "Complete",
                                        msg: "Data restored!"
                                    });
                                    jQuery('section#dataDbCheck').hide();
                                    //show managerial if users is still not 0
                                    if ($scope.users.length == 0) {
                                        jQuery('#managerial').show();
                                    } else {
                                        jQuery('#login').show();
                                    }
                                })
                            break;
                        case 'err-file-backup':
                            notifications.notify({
                                type: "error",
                                title: "Network Error",
                                msg: "Failed:Error connecting to server.Check your network connection"
                            });
                            jQuery('section#dataDbCheck').hide();
                            jQuery('#managerial').show();
                            break;
                    }
                }
            } else if ($scope.users.length == 0) {
                jQuery('#managerial').show();
            }
            if (sessionStorage.getItem('user') != null && $scope.users.length !== 0) {
                jQuery('#login').hide()
                $scope.currentUser = JSON.parse(sessionStorage.getItem('user'))
            } else if (sessionStorage.getItem('user') == null && $scope.users.length !== 0) {
                jQuery('#login').show();
            }
        })
        .then(() => {
            /**
             * @function socket create sockets on serve
             */
            const express = require('express');
            const socket = require('socket.io');
            //set up server
            const module = express();
            const server = module.listen(Number($scope.settings.broadcast_port), () => {
                console.log(`listening to request on port ${$scope.settings.broadcast_port}...`);
            });
            $scope.io = socket(server);

            let connected_peers = 0;
            $scope.io.on("connection", (socket) => {
                socket.emit('connected', {
                    status: true
                });
                console.log("made server connection", socket.id);
                Status.insertRight(`<i class="material-icons blue-text">wifi_tethering</i> ${connected_peers +1} peer(s) connected`);
                //sending before sending in intervals
                //1.0 sending overall records
                worker.postMessage("get-reports");
                //to get daily reports
                //2.0 sending records of day
                /*setInterval(() => {
                    worker.postMessage("get-daily-reports");
                }, 60000);*/
                //listening to workers
                worker.onmessage = (e)=>{
                    try{
                        //console.log(e);
                        const response = JSON.parse(e.data);
                        if(response.type === 'daily-reports') {
                            console.log("Recieved daily records");
                            console.log("Broadcasting daily records...");
                            socket.emit("database", JSON.stringify(response.reports));
                        }
                        //for overall reports
                        if(response.type === "overall-reports") {
                            console.log("Recieved overall records");
                            console.log("Broadcasting overall records...");
                            socket.emit("records", JSON.stringify(response.reports));
                        }
                    }catch(e) {
                        //console.error(e);
                        return;
                    }
                };
                //listening from client
                socket.on('get-records', ()=>{
                    if ($scope.settings.hostBroadcast) {
                        worker.postMessage("get-reports");
                    } else {
                        socket.on('rejected', "Host computed denied request.<br> Make sure <strong>Enable broadcast</strong> is enabled in host <strong>Host > Network</strong>.")
                    }
                });

                socket.on('process_orders', (data)=>{
                    if ($scope.settings.remotePrinting != true) {
                        socket.emit('process_orders_result', JSON.stringify({type:false,msg:`Host computer rejected print request.<br> Make sure <strong>"Allow remote printing"</strong> is enabled in host computer <strong>Settings > Network</strong>`}));
                        return;
                    }
                    const order = JSON.parse(data);

                    order.data.date = new Date(order.data.date);
                    console.log(order);
                    $scope.db.orders.add(order.data)
                        .then(()=>{
                            if(order.print) {
                                $scope.printOrders(order.data);
                                socket.emit('process_orders_result', JSON.stringify({type:false,msg:`Oder added to print que`}));
                            } else {
                                //console.log(order.data);
                                socket.emit('process_orders_result', JSON.stringify({type:false,msg:`Oder saved.`}));
                            }
                        }).catch((err)=>{
                        console.error(err);
                        socket.emit('process_orders_result', JSON.stringify({type:false,msg:`Host computer to process request.`}));
                        notifications.notify({
                            type: "error",
                            title: `Error! code: -48`,
                            msg: `Failed to save order from peer computer`
                        }, 4000, true)
                    });
                });

            });
        })
        .catch(err => {
            console.log(err)
        });
    //=========== MANAGERIAL ACCOUNT! ========
    $scope.createManagerFxn = (login) => {
        //img = document.querySelector('#managerialImgInput').files[0];
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
                title: "Invalid values",
                msg: "Please fill all fields!",
                type: "error"
            })
            return false;
        }
        //converting first character to upper case
        $scope.createManagerialFormInputName = $scope.createManagerialFormInputName[0].toUpperCase() + $scope.createManagerialFormInputName.slice(1).toLowerCase();
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
                        if (login) {
                            $scope.currentUser = mgr;
                            if (typeof $scope.currentUser.img_url !== 'string') {
                                $scope.profile_pic = URL.createObjectURL($scope.currentUser.img_url)
                            }
                            sessionStorage.setItem('user', JSON.stringify($scope.currentUser));
                            jQuery('#managerial').hide();
                            jQuery('#login').hide();
                        } else {
                            $scope.managers = [];
                            $scope.staffs = [];
                            $scope.createManagerialFormInputName = "";
                            $scope.createManagerialFormPassword = "";
                            notifications.notify({
                                type: "ok",
                                title: "Complete",
                                msg: "New manager added!"
                            });
                            $scope.users.forEach(element => {
                                if (element.is_mgr) {
                                    $scope.managers.push(element);
                                } else {
                                    $scope.staffs.push(element);
                                }
                            });
                        }
                        $scope.$apply();
                    })
            })

    }
    //for button to create mangarial account on set up...
    jQuery("#createMgrBtn1").on('click', () => {
        $scope.createManagerFxn(true);
    })
    //users,staff
    //======LOGIN=============================================================================================
    jQuery('#loginForm').on('submit', (e) => {
        e.preventDefault();
        if (typeof $scope.usernameLogin !== 'string' || typeof $scope.passwordLogin !== 'string') {
            notifications.notify({
                title: "Ivalid values",
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
                        title: "Error",
                        type: "error",
                        msg: "Wrong user name!"
                    });
                    return false;
                }
                if (data.password !== $scope.passwordLogin) {
                    notifications.notify({
                        title: "Error",
                        type: "error",
                        msg: "Wrong password!"
                    });
                    return false;
                }
                if (data.status == 'suspend') {
                    notifications.notify({
                        title: "Account suspended",
                        type: "error",
                        msg: "Your account is currently suspended,please contact your Manager!"
                    })
                    return false;
                }
                if (data.status == 'inactive') {
                    notifications.notify({
                        title: "Access denied!",
                        type: "error",
                        msg: "Your don't have enough permissions to use this application!,Please contact your manager"
                    }, 7500)
                    return false;
                }
                //accept and proccess
                $scope.currentUser = data;
                if ($scope.currentUser.is_mgr) {
                    //to activate menu click mgr items
                    if (process.platform === 'darwin') {
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 2].enabled = true;
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 1].enabled = true;
                    } else {
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 2].enabled = true;
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 1].enabled = true;
                    }
                } else {
                    //to de-activate menu click mgr items
                    var date = $scope.currentUser.startDate.split("/");
                    date = new Date(`${date[2]}-${date[1]}-${date[0]}`);
                    if (Date.now() < date.getTime()) {
                        notifications.notify({
                            type: 'error',
                            title: 'Access denied!',
                            msg: `Your account is inactive at the moment<br>It would be active from ${$scope.currentUser.startDate}`
                        }, 9000)
                        return;
                    }
                    if (process.platform === 'darwin') {
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 2].enabled = false;
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 1].enabled = false;
                    } else {
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 2].enabled = false;
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 1].enabled = false;
                    }
                }
                //activate login button
                if (process.platform === 'darwin') {
                    actionMenu.items[0].submenu.items[0].submenu.items[1].enabled = true;
                } else {
                    actionMenu.items[0].submenu.items[actionMenu.items[0].submenu.items.length - 2].enabled = true;
                }
                //get image
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
    //console.log(actionMenu.items[3].submenu.items);
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
                    //to de-activate menu click mgr items and logout
                    if (process.platform === 'darwin') {
                        actionMenu.items[4].submenu.items[actionMenu.items[4].submenu.items.length - 2].enabled = false;
                        actionMenu.items[4].submenu.items[actionMenu.items[4].submenu.items.length - 1].enabled = false;
                        //logout
                        actionMenu.items[1].submenu.items[actionMenu.items[1].submenu.items.length - 2].enabled = false;
                    } else {
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 2].enabled = false;
                        actionMenu.items[3].submenu.items[actionMenu.items[3].submenu.items.length - 1].enabled = false;
                        //log out for windows process
                        actionMenu.items[0].submenu.items[actionMenu.items[0].submenu.items.length - 2].enabled = false;
                    }
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
    };
    //open external
    $scope.openExternal = ({
        type,
        msg
    }) => {
        switch (type) {
            case 'url':
                shell.openExternal(msg);
                break;
        }
    }

    /*offline and online function
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
*/
    /*
        ====================== PRINTER FUCTION ======================
    */
    $scope.printOrders = (data, extra = false) => {
        if (typeof $scope.settings.defaultPrinter !== "string") {
            notifications.notify({
                title: "Printer error",
                msg: "Printer not configured, go to settings > printer and select default printer",
                type: "error"
            });

            return;
        }

        const date = `${data.date.getDate()}/${data.date.getMonth()+1}/${data.date.getFullYear()} ,${data.date.getHours()}:${data.date.getMinutes()}`;
        let print_data = [
            {
                type: 'bodyInit',
                css: {
                    "margin": "0 0 0 0",
                    "width": '250px'
                }
            },
            {
                type: 'text',
                value: '<h1 style="margin-bottom: 0;">SnapBurger</h1>',
                style: `font-family:kaushan Script;text-align:center;font-weight:bold;`
            },{
                type: 'text',
                value:`${data.inv} - ${data.waiter}`,
                style: `text-align:center;font-size:0.7rem;font-weight:bold;margin: 2%;font-family:inconsolata;`
            },
            {
                type: 'text',
                value: date,
                style: `font-size: 14px;text-align:center;font-family:inconsolata;`
            }]
        //FileSaver.js
        let th = "";
        data.items.forEach(el => {
            $scope.products.orderCategories.map((il) => {
                if (el.orderCategory === il.name) {
                    il.template +=  `<tr style="border-bottom:1px dotted #999;padding:5px 0;text-align:center;">
             <td style="padding:7px 2px;">${el.name}</td>
             <td style="padding:7px 2px;">${el.quantity}</td></tr>`;
                }
            });
            th += `<tr style="border-bottom:1px dotted #999;padding:5px 0;text-align:center;">
             <td style="padding:7px 2px;">${el.name}</td>
             <td style="padding:7px 2px;">${el.quantity}</td>
             <td style="padding:7px 2px;">${$filter('currency')(el.rate, "", 0)}</td>
             <td style="padding:7px 2px;">${$filter('currency')(el.rate * el.quantity, "", 0)}</td>
         </tr>`;
        })

        print_data = print_data.concat([
            {
                type: 'text',
                value: `<div style="min-height:250px;"><table style="width: 100%;display: table;border-collapse: collapse;border-spacing: 0;margin:15px 0;font-family:inconsolata;">
        <thead>
           <th>Nom</th>
           <th>Qte</th>
           <th>Prix</th>
           <th>Total</th>
       </thead>
        <tbody style="border-top:1px solid #999">
           ${th}
        </tbody>
        </table></div>`,
                style: `font-size: 14px;text-align:center;`
            },
            {
                type: 'text',
                value: `Total: ${$filter('currency')(data.totalPrice, "FCFA ", 0)}`,
                style: `margin:25px 0 0 0;text-align:center;border-top:1px solid #999;font-size: 17px;font-family:inconsolata;font-weight:bold`
            },
            {
                type: 'text',
                value: 'Merci pour votre fidélité',
                style: `text-align:center;font-size: 14px;font-family:inconsolata;`
            },
            {
                type: 'text',
                value: '@snapburger17',
                style: `text-align:center;font-size: 12px`
            }
     ]);
        //printing....
        print.print58m({
            data: print_data,
            preview: $scope.settings.printPreview,
            deviceName: $scope.settings.defaultPrinter,
            timeoutPerLine: $scope.settings.timeoutPerLine
        }).then((data) => {
            if (data) {
                notifications.notify({
                    msg: "Added to printing queue",
                    type: "ok"
                });
            } else {
                notifications.notify({
                    title: "Print error",
                    msg: "Error printing. <br> -Check printer configuration in settings <br> -Make sure printer is connected.",
                    type: "error"
                });
            }
        }).catch(err => {
            console.error(err);
            notifications.notify({
                title: "Print error",
                msg: "-Make sure printer is connected to PC<br>-Check if printer drivers are up-to-date",
                type: "error"
            });
        });
        //iterating tipring categories list
        if (extra) {
            for (let i = 0;i < $scope.products.orderCategories.length;i++) {
                if ($scope.products.orderCategories[i].template !== '') {
                    const _print = [{
                        type: 'text',
                        value: '<h1 style="margin-bottom: 0;">SnapBurger</h1>',
                        style: `font-family:kaushan Script;text-align:center;font-weight:bold;`
                    },{
                        type: 'text',
                        value:`${data.inv} - ${data.waiter}`,
                        style: `text-align:center;font-size:0.7rem;font-weight:bold;margin: 2%;font-family:inconsolata;`
                    },{
                        type: 'text',
                        value: `<table><tbody>${$scope.products.orderCategories[i].template}</tbody></table>`,
                        style: `font-family: inconsolata;text-align:center;`
                    }]
                    //printing....
                    print.print58m({
                        data: _print,
                        preview:false,
                        deviceName: 'XP-80C',
                        timeoutPerLine: 400
                    }).then((data) => {
                        if (data) {
                            notifications.notify({
                                msg: "Added to printing queue",
                                type: "ok"
                            });
                        } else {
                            notifications.notify({
                                title: "Print error",
                                msg: "Error printing",
                                type: "error"
                            });
                        }
                    }).catch(err => {
                        console.error(err);
                        notifications.notify({
                            title: "Print error",
                            msg: "-Make sure printer is connected to PC<br>-Check if printer drivers are up-to-date",
                            type: "error"
                        });
                    });
                }
            }
        }
    }
    //function to print withdrawals
    $scope.printWithdrawals = (data) => {
        const date = `${data.date.getDate()}/${data.date.getMonth()+1}/${data.date.getFullYear()} ,${data.date.getHours()}:${data.date.getMinutes()}`;
        var print_data = [
            {
                type: 'bodyInit',
                css: {
                    "margin": "0 0 0 0",
                    "width": '250px'
                }
            },
            {
                type: 'text',
                value: 'Withdrawal receipt',
                style: `font-size: 18px;text-align:center;font-weight:bold;`
            },
            {
                type: 'text',
                value: data.inv,
                style: `font-size: 17px;text-align:center;font-weight:bold;`
            },
            {
                type: 'text',
                value: date,
                style: `font-size: 14px;text-align:center;`
            },
            {
                type: 'text',
                value: `Category: ${data.category}`,
                style: `font-size: 16px;`
            },
            {
                type: 'text',
                value: `Reason: ${data.reason}`,
                style: `font-size: 16px;`
            }
     ]
        print_data = print_data.concat([
            {
                type: 'text',
                value: `Total: ${$filter('currency')(data.amount, "FCFA ", 0)}`,
                style: `margin:25px 0 0 0;font-size: 17px;font-weight:bold`
            },
            {
                type: 'text',
                value: `Issued by: ${data.staff}`,
                style: `font-size: 16px;`
            },
            {
                type: 'text',
                value: `Received by: ${data.receiver}`,
                style: `font-size: 16px;`
            },
            {
                type: 'text',
                value: '@snapburger17',
                style: `text-align:center;font-size: 12px`
            }
     ])
        //printing....
        print.print58m({
            data: print_data,
            preview: $scope.settings.printPreview,
            deviceName: $scope.settings.defaultPrinter,
            timeoutPerLine: $scope.settings.timeoutPerLine
        }).then((data) => {
            if (data) {
                notifications.notify({
                    msg: "Added to printing queue",
                    type: "ok"
                });
            } else {
                notifications.notify({
                    title: "Print error",
                    msg: "Error printing",
                    type: "error"
                });
            }
        }).catch(err => {
            notifications.notify({
                title: "Print error",
                msg: "-Make sure printer is connected to PC<br>-Check if printer drivers are up-to-date",
                type: "error"
            });
        })
    }
    //client side for app

    //create redrawal
    jQuery('#createRedrawalForm').on('submit', (e) => {
        e.preventDefault();
        if (typeof $scope.redrawReason !== 'string' || $scope.redrawReason == '') {
            notifications.notify({
                type: "error",
                title: "Reason required",
                msg: "A reason for this withdrawal is required",
            })
            return;
        }
        if (typeof $scope.redrawAmount !== 'number' || $scope.redrawAmount == '') {
            notifications.notify({
                type: "error",
                title: "A Valid amount is required",
                msg: "Please insert a valid Amount",
            })
            return;
        }
        if (typeof $scope.redrawCategory !== 'string' || $scope.redrawCategory == '') {
            notifications.notify({
                type: "error",
                title: "Category required",
                msg: 'Please select a category'
            })
            return;
        }
        if (typeof $scope.redrawReciever !== 'string' || $scope.redrawReciever == '') {
            notifications.notify({
                type: "error",
                title: "Reciever required",
                msg: 'Please insert a reciever'
            })
            return;
        }
        if (confirm(`Confirm redrawal of '${$filter('currency')($scope.redrawAmount,'FCFA ',0)}'`)) {
            //data:withdrawals:"++id,inv,reason,amount,date",
            $scope.createNewWithdrawal = () => {
                const invc = `SBR${Math.floor(Math.random() * (9999 - 1000) ) + 1000}`;
                var data = {
                    inv: invc,
                    category: $scope.redrawCategory,
                    reason: $scope.redrawReason,
                    receiver: $scope.redrawReciever,
                    amount: $scope.redrawAmount,
                    date: new Date(),
                    staff: $scope.currentUser.name
                }
                $scope.db.transaction('rw', $scope.db.withdrawals, () => {
                        $scope.db.withdrawals.add(data)
                        //refresh data
                        $scope.db.withdrawals.toArray()
                            .then(data => {
                                $scope.withdrawals = data;
                                $scope.$apply();
                            })
                    })
                    .then(() => {
                        $scope.printWithdrawals(data);
                        notifications.notify({
                            type: "ok",
                            title: "Withrawal registered!",
                            msg: `You have withdrawed a sum of:<br /> ${$filter('currency')($scope.redrawAmount,'FCFA ',0)}`
                        })
                        document.querySelector('#createRedrawalForm').reset();
                    })
                    .catch(() => {
                        $scope.createNewWithdrawal();
                    })
            }
            $scope.createNewWithdrawal();
        }
    });



    $scope.setPushDate = ()=>{
        $scope.PUSH_DATE_INTERVAL = jQuery('#push_select').val();
        localStorage.setItem("PUSH_DATE",$scope.PUSH_DATE_INTERVAL);
    };
    /*
     ========================    hooks ================
    */
    //items
    //TODO uncomment the back up file from worker in controller js
    worker.postMessage('update-db-file');
    Status.insertLeft(`<i class="material-icons grey-text">info</i> Configurations loaded`);

    $scope.client_socket = null;

    $scope.connectToHost = (connect) => {
        if (connect) {
            $scope.client_socket = io.connect(`http://${$scope.settings.host_url}:${$scope.settings.host_port}`);
            $scope.client_socket.on('connected', ()=>{
                //$scope.SETTINGS.connect_host = true;
                console.log("connected.");
                //starting progress bar
                Status.progress(1.5);
                Status.insertLeft("Connecting to host...");
            });
            //
            $scope.client_socket.on('records', (records) => {
                console.log("records");
                const data = JSON.parse(records);
                const _total_ = data.sales.length + data.products.category.length + data.products.items.length + data.users.length + data.withdrawals.length;

                $scope.db.transaction('rw', $scope.db.users, $scope.db.orders, $scope.db.categories, $scope.db.items, $scope.db.withdrawals,()=>{
                    $scope.db.categories.clear().then(()=>{
                        $scope.db.categories.bulkPut(data.products.category).then(()=>{
                            Status.progress(((data.products.category.length) / (_total_) ) * 100);
                        });
                    });

                    $scope.db.items.clear().then(()=>{
                        $scope.db.items.bulkPut(data.products.items).then(() => {
                            Status.progress(((data.products.category.length + data.products.items.length ) / (_total_) ) * 100);
                        })
                    });

                    $scope.db.orders.clear().then(()=>{
                        $scope.db.orders.bulkPut(data.sales).then(() => {
                            Status.progress(((data.products.category.length + data.products.items.length + data.sales.length) / (_total_) ) * 100);
                        })
                    });

                    $scope.db.withdrawals.clear().then(() => {
                        $scope.db.withdrawals.bulkPut(data.withdrawals).then(() => {
                            Status.progress(((data.products.category.length + data.products.items.length + data.sales.length + data.withdrawals.length) / (_total_) ) * 100);
                        })
                    });

                    $scope.db.users.clear().then(()=> {
                        $scope.db.users.bulkPut(data.users).then(() => {
                            Status.progress(((data.products.category.length + data.products.items.length + data.sales.length + data.withdrawals.length + data.users.length) / (_total_) ) * 100);
                        })
                    })
                }).then(()=> {
                    $scope.SETTINGS.connect_host = true;
                    Status.insertLeft(`<i class="material-icons green-text">check_circle</i> Connected to host.`);
                    //show disabled message
                    Status.insertRight(`<i class="material-icons brown-text">portable_wifi_off</i> Host server disabled.`);
                    Status.progress("end");
                    $scope.$apply();
                }).catch((err)=>{
                    console.error(err);
                })
            });
            //on printer results
            $scope.client_socket.on('process_orders_result', (data) => {
                const response = JSON.parse(data);
                if (data.type) {
                    notifications.notify({
                        type:"success",
                        title:"Host computer",
                        msg:data.msg
                    });
                } else {
                    notifications.notify({
                        type:"error",
                        title:"Host computer",
                        msg:data.msg
                    });
                }
            });
            //rejected messages
            $scope.client_socket.on('rejected', (msg)=>{
                notifications.notify({
                    type:"error",
                    title:"Host computer",
                    msg:msg
                });
            });
            //disconnect
            $scope.client_socket.on('disconnect',()=>{
                $scope.SETTINGS.connect_host = false;
                Status.insertRight(`<i class="material-icons blue-text">wifi_tethering</i> Host server running.`);
                Status.insertRight("Not connected to host.");
            })

        } else {
            $scope.SETTINGS.connect_host = false;
            Status.insertLeft("Not connected to host.");
            Status.insertRight(`<i class="material-icons blue-text">wifi_tethering</i> Host server running.`);
        }
    };

    //refresh db
    $scope.refreshDB = () => {
        $scope.client_socket.emit("get-records",true);
    }

    //update settings



}); //end main controller, nothing should come after here!
