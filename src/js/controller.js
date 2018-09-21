//the notification class
const notifications = new Alerts();
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
    */ 
   var Dexie = require('dexie');
   $scope.db = new Dexie('snapBurgerDatabase');
   $scope.db.version(1).stores({
    users: "++id, &name,password,position,startDate,salary,status,is_mgr",
    products: "++id,tableNumber,*categories,*items",
    orders:"++id,name,date,table,*items,totalPrice,totalQuantity"
});
//create new
/*$scope.db.users.add({
    name: "Brian",
    password: "1234",
    position: "Manager",
    startDate: "21/02/2018",
    salary: "N/A",
    status: "active",
    is_mgr: true
})
//fetch
$scope.db.users
    .toArray()
    .then((dt)=>{
        console.log(dt)
    })
    //update 
$scope.db.users.put({
    id:2,
    name: "Hubert",
    password: "1234",
    position: "Manager",
    startDate: "21/02/2018",
    salary: "N/A",
    status: "active",
    is_mgr: true
    //delete
})
$scope.db.users.delete(2);*/
    //fetching
    $scope.news = []
    $scope.db.users
    .toArray()
    .then((data)=>{
        $scope.news.push(data);
        console.log($scope.news)
    })
    .catch((err)=>{
        console.log(err)
    })
    console.log($scope.news)
    //console.log($scope.products);
   $scope.products = {
        tableNumber:10,
        categories:[
        {
            name: "Food",
            status: "available",
            action: true
        },
        {
            name: "Cocktails",
            status: "available",
            action: true
        },
        {
            name: "Lemonade",
            status: "available",
            action: true
        },
        {
            name: "Wine",
            status: "available",
            action: true
        }
        ],    
        items:[
        {
            name: "Burger",
            rate: 2000,
            category: "Food",
            status: "available",
            action: true
        },
        {
            name: "King Burger",
            rate: 2500,
            category: "Food",
            status: "available",
            action: true
        },
        {
            name: "Baileys",
            rate: 12000,
            category: "Wine",
            status: "available",
            action: true
        },
        {
            name: "Red verlet",
            rate: 1000,
            category: "Food",
            status: "available",
            action: true
        },
        {
            name: "Djuino",
            rate: 700,
            category: "Cocktails",
            status: "available",
            action: true
        },
        {
            name: "Lisade",
            rate: 1200,
            category: "Lemonade",
            status: "available",
            action: true
        },
        {
            name: "Fries",
            rate: 600,
            category: "Food",
            status: "available",
            action: true
        },
        {
            name: "Milky burger",
            rate: 2000,
            category: "Food",
            status: "available",
            action: true
        },
        {
            name: "Red Label",
            rate: 8000,
            category: "Wine",
            status: "available",
            action: true
        },
        {
            name: "Pineaps",
            rate: 900,
            category: "Cocktails",
            status: "available",
            action: true
        },
        {
            name: "Blured",
            rate: 1500,
            category: "Lemonade",
            status: "available",
            action: true
        }
]
    }  
//users,staff
    $scope.staffs = [];
    $scope.managers = [];
    $scope.users = [
        {
            name: "Mathew",
            password: "1234",
            position: "Waiter",
            startDate: "21/07/2018",
            salary: "30,000",
            status: "active",
            is_mgr: false
        },
        {
            name: "Kelly",
            password: "1234",
            position: "Cook",
            startDate: "30/06/2018",
            salary: "60,000",
            status: "active",
            is_mgr: false
        },
        {
            name: "Boris",
            password: "1234",
            position: "Bartender",
            startDate: "01/09/2018",
            salary: "30,000",
            status: "suspend",
            is_mgr: false
        },
        {
            name: "Mimi",
            password: "1234",
            position: "Waitress",
            startDate: "27/08/2018",
            salary: "30,000",
            status: "active",
            is_mgr: false
        },
        {
            name: "Mary",
            password: "1234",
            position: "Cook",
            startDate: "31/07/2018",
            salary: "70,000",
            status: "suspend",
            is_mgr: false
        },
        {
            name: "Fabrice",
            password: "1234",
            position: "Cleaner",
            startDate: "01/09/2018",
            salary: "20,000",
            status: "active",
            is_mgr: false
        },
        {
            name: "Randalls",
            password: "1234",
            position: "Manager",
            startDate: "21/02/2018",
            salary: "N/A",
            status: "active",
            is_mgr: true
        },
        {
            name: "Brian",
            password: "1234",
            position: "Manager",
            startDate: "21/02/2018",
            salary: "N/A",
            status: "active",
            is_mgr: true
        },
]
    $scope.users.forEach(element => {
        if (element.is_mgr) {
            $scope.managers.push(element);
        } else {
            $scope.staffs.push(element)
        }
    });
    $scope.currentUser = '';
    if (sessionStorage.getItem('user') != null) {
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

