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
        items: []
    }
    $scope.settings = [];
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
    })

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
        $scope.db.orders.get(1,(data)=>{
            $scope.orders.push(data);
        })
        //fetching withrawals
        $scope.db.withdrawals.toArray()
            .then((data) => {
                $scope.withdrawals = data;
            })
        //fetched data and now apply
        $scope.$apply();
    }
    //fetching Data
    $scope.db.transaction('r', $scope.db.users, $scope.db.orders, $scope.db.categories, $scope.db.items, $scope.db.settings, $scope.db.withdrawals, () => {
            $scope.transactionableFetch();
        })
        .then(() => {
            //code to write when fetching of database succedeed!
            jQuery('#appLoader').waitMe("hide");
            jQuery('#loginInputs').css({
                visibility: "visible"
            })
            //jQuery('#loader').remove();
            if ($scope.users.length == 0 && $scope.products.categories.length == 0 &&
                $scope.orders.length == 0 && $scope.products.items.length == 0 &&
                $scope.withdrawals.length == 0) {
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
        .catch(err => {
            console.log(err)
        })
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
    $scope.printOrders = (data) => {
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
                value: '<h1>SnapBurger</h1>',
                style: `font-family:kaushan Script;text-align:center;font-weight:bold;`
            },
            {
                type: 'text',
                value: date,
                style: `font-size: 14px;text-align:center;font-family:inconsolata;`
            }]
        //FileSaver.js
        var th = "";
        data.items.forEach(el => {
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
     ])
        //printing....
        print.print58m({
            data: print_data,
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
        })
    }
    //fucntion to print withwrals
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
            preview: false,
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
    })

    /**
     * @function socket create sockets on serve
     */
    const express = require('express');
    const socket = require('socket.io');
    //set up server
    const module = express();
    const server = module.listen(4000, () => {
        console.log("listening to request on port 4000..");
    })
    $scope.io = socket(server);

    Status.insertRight(`<i class="material-icons blue-text">wifi_tethering</i> Host server running.`);


    var connected_peers = 0;
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
        setInterval(() => {
            worker.postMessage("get-daily-reports");
        }, 60000)
        //listening to workers
        worker.onmessage = (e)=>{
            try{
                //console.log(e);
                const response = JSON.parse(e.data);
                if(response.type === 'daily-reports') {
                    console.log("recieved daily records");
                    socket.emit("database", JSON.stringify(response.reports));
                }
                //for overall reports
                if(response.type === "overall-reports") {
                    console.log("recieved overall records");
                    socket.emit("records", JSON.stringify(response.reports));
                }
            }catch(e) {
                //console.error(e);
                return;
            }
        }
    });
    
    $scope.io.on("disconnect", () => {
        console.log("disconnect");
    })


    $scope.setPushDate = ()=>{
        console.log()
        $scope.PUSH_DATE_INTERVAL = jQuery('#push_select').val();
        localStorage.setItem("PUSH_DATE",$scope.PUSH_DATE_INTERVAL);
    }
    /*
     ========================    hooks ================
    */
    //items
    $scope.db.items.hook('reading', function (obj) {
        worker.postMessage('update-db-file');
        Status.insertLeft(`<i class="material-icons grey-text">info</i> Configurations loaded.`);

        return obj;
    });

}) //end main controller, nothing should come after here!
