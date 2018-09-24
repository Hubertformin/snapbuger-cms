
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
})

/*app.directive('PascalCase',()=>{
    return {
        require:'ngModel',
        link:(scope,elem,attr,mCtr)=>{
            function convert(val){
               val = val[0].toUpperCase()+val.slice(1);
               return val;
            }
            mCtr.$parsers.push(convert);
        }
    }
})*/

app.controller("mainCtr", ($scope) => {
    /*
    ============ DATABASES ===============
    using Dexie JS
    */
   //initializing data's
   $scope.orders = [];
   $scope.staffs = [];
    $scope.managers = [];
    $scope.users = [];
    $scope.products = {
        tableNumber:0,
        categories:[],
        items:[]
    }
    //
   var Dexie = require('dexie');
   $scope.db = new Dexie("snapBurgerDb")
   $scope.db.version(1).stores({
       users:"++id,name,password,position,startDate,salary,status,is_mgr",
       categories:"++id,name,status,action",
       items:"++id,name,rate,category,status,action",
       tableNumber:"++id,number",
       orders:"++id,name,date,*items,totalPrice,totalQuantity"
   })
   //fetching Data
   $scope.db.users.toArray()
   .then((data)=>{
       $scope.users = data;
       $scope.users.forEach(element => {
        if (element.is_mgr == true) {
            $scope.managers.push(element);
        } else {
            $scope.staffs.push(element)
        }
    });
    $scope.db.categories.toArray()
    .then((data)=>{
        $scope.products.categories = data;
    })
    $scope.db.items.toArray()
    .then((data)=>{
        $scope.products.items = data;
    })
    $scope.db.tableNumber.toArray()
    .then(data=>{
        $scope.products.tableNumber = data;
    })
    //fetching data
    $scope.$apply();
   })
   $scope.db.orders.toArray()
   .then((data)=>{
        $scope.orders = data;
   })
   //=========== MANAGERIAL ACCOUNT! ========
   jQuery('#createManagerialForm').submit((e)=>{
    e.preventDefault();
    var name = jQuery('#createManagerialFormInputName').val(),
    password = jQuery('#createManagerialFormPassword').val();
    if(typeof name == "string" || password == ""){
        notifications.notify({msg:"Please fill all fields!",type:"error"})
        return false;
    }
    $
})
//users,staff
    $scope.currentUser = '';
    if (sessionStorage.getItem('user') != null) {
        jQuery('#login').hide()
        $scope.currentUser = JSON.parse(sessionStorage.getItem('user'))
    } else {
        jQuery('#login').show();
    }
    //======LOGIN=============================================================================================
    $scope.usernameInput = '';
    $scope.passwordInput = '';
    jQuery('#loginForm').on('submit', (e) => {
        e.preventDefault();
        if ($scope.usernameInput == '' || $scope.passwordInput == '') {
            notifications.notify({
                msg: "Please fill the form!",
                type: "error"
            })
            return false;
        }
        //check if user exist
        for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.usernameInput.toLowerCase() == $scope.users[i].name.toLowerCase()) {
                if ($scope.passwordInput == $scope.users[i].password) {
                    $scope.currentUser = $scope.users[i];
                    $scope.$apply();
                    break;
                }
            }
        }
        if ($scope.usernameInput != 'undefined' && $scope.passwordInput != 'undefined' && $scope.currentUser == '') {
            notifications.notify({
                msg: "Wrong username or password!<br><small>Forgotten credentials? contact manager</small>",
                type: "error"
            })
            return false;
        }
        if ($scope.currentUser.status == 'suspend') {
            notifications.notify({
                msg: "Account suspended!<br><small>Contact Manager!</small>",
                type: "error"
            })
            return false;
        }
        //accept and proccess
        document.querySelector('#loginForm').reset();
        sessionStorage.setItem('user', JSON.stringify($scope.currentUser));
        jQuery('#login').fadeOut();
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
        name:'',
        date:'',
        table:1,
        items:[],
        totalPrice:0,
        totalQuantity:0
    }
})

