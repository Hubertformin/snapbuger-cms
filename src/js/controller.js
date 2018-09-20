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

    //All data
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
            action: false
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
    $scope.currentOrder = {
        name:'',
        date:'',
        table:1,
        items:[],
        totalPrice:0,
        totalQuantity:0
    }

})
app.controller("dashCtr", ($scope) => {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
    var instance = M.Collapsible.getInstance(jQuery('#OrderCollapse'));
    instance.open()
    //datepicker
     let currentDate = new Date();
    var thisYear = currentDate.getFullYear();
    var elems = document.querySelectorAll('.datepicker');
    var instances = M.Datepicker.init(elems, {
        format: 'dd/mm/yyyy',
        minDate: currentDate,
        defaultDate: currentDate,
        yearRange: [thisYear, thisYear + 2]
    });
    //input current date into date picker input by default
    jQuery('#orderDate').val(formatDate());
    jQuery('.scrollContainer').on('mousewheel', function (e) {
        if (e.deltaY < 0) {
            jQuery(this).scrollLeft(jQuery(this).scrollLeft()+40);
        } else {
            jQuery(this).scrollLeft(jQuery(this).scrollLeft()-40);
        }
        e.preventDefault();
    });
    //add order numbers buttons
    $scope.addOrderNumber = (e,i)=>{
        if(jQuery(e.target).is('i')){
            var val = Number(jQuery(e.target).parent().siblings('input').val());
            if(val == 1 && i < 0) return false;
            //console.log(val +i)
            //console.log(num) 
            jQuery(e.target).parent().siblings('input').val(val+i);
        }else{
            var val = Number(jQuery(e.target).siblings('input').val())
            if(val == 1 && i < 0) return false;
                jQuery(e.target).siblings('input').val(val + i);
        }
    }


})
//itemsCtr
app.controller("itemsCtr", ($scope) => {
    $scope.category_status = "available";
    $scope.item_status = "available";
    //initializing collapse
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
    //categories table
    //1. Create Categories
    jQuery('#createCategoryForm').on('submit', (e) => {
        e.preventDefault();
        if ($scope.category_name == '') return false;
        let action = true;
        if ($scope.category_status != "available") {
            action = false;
        }
        $scope.products.categories.push({
            name: $scope.category_name,
            status: $scope.category_status,
            action: action
        })
        $scope.$apply();
        notifications.notify({
            msg: "Added!",
            type: "done"
        })
        //console.log( $scope.products.categories);
    })
    //update categories
    $scope.updateCategories = (i) => {
        if ($scope.products.categories[i].status == "available") {
            $scope.products.categories[i].action = true;
        } else {
            $scope.products.categories[i].action = false;
            $scope.products.items.forEach(elems=>{
                if(elems.category == $scope.products.categories[i].name){
                    elems.action = false;
                    elems.status = 'unavailable';
                }else{
                    elems.action = true;
                    elems.status = 'available';
                }
            })
        }
        //console.log($scope.products.categories);
    }
    //deleting categories
    $scope.deleteCategories = (i) => {
        //confirm(`Are you sure `);
        swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to revert this!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    $scope.products.categories.splice(i, 1);
                    $scope.$apply();
                    swal("Deleted!", {
                        icon: "success",
                    });
                } else {
                    swal("Your imaginary file is safe!");
                }
            });
    }
    //Create Items
    jQuery('#createItemForm').on('submit', (e) => {
        e.preventDefault();
        if ($scope.item_name == '' || $scope.item_rate == '' || $scope.item_category == '') {
            notifications.notify({
                msg: "Please fill all fields!",
                type: "error"
            });
            return false;
        }
        $scope.products.items.push({
            name: $scope.item_name,
            rate: $scope.item_rate,
            category: $scope.item_category,
            status: $scope.item_status
        })
        $scope.$apply();
        //reseting variables
        $scope.item_name = '';
        //nitifications
        notifications.notify({
            msg: "Added!",
            type: "done"
        })
    })
    //update Itemms
    $scope.updateItems = (i) => {
        $scope.products.items[i].action = true;
        if ($scope.products.items[i].status !== 'available') {

            $scope.products.items[i].action = false;
        }
        //console.log($scope.products.items[i]);
    }
    //delete Items
    $scope.deleteItems = (i) => {
        //confirm(`Are you sure `);
        swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to revert this!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    $scope.products.items.splice(i, 1);
                    $scope.$apply();
                    swal("Deleted!", {
                        icon: "success",
                    });
                } else {
                    swal("Your imaginary file is safe!");
                }
            });
    }

})
app.controller("staffCtr", ($scope) => {
    //initialiing ...
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {
        dismissible: false,
        preventScrolling: true
    });
    //collapseible
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {
        accordion: false
    });
    //date picker
    let currentDate = new Date();
    var thisYear = currentDate.getFullYear();
    //console.log($scope.today);
    var elems = document.querySelectorAll('.datepicker');
    var instances = M.Datepicker.init(elems, {
        format: 'dd/mm/yyyy',
        minDate: currentDate,
        defaultDate: currentDate,
        yearRange: [thisYear, thisYear + 2]
    });
    //create staff
    jQuery('#createStaffsForm').on('submit', (e) => {
        e.preventDefault();
        var inputDate = jQuery('#startDate').val();
        if (typeof $scope.staff_name == 'undefined' ||
            typeof $scope.staff_password == 'undefined' ||
            typeof $scope.staff_position == 'undefined' ||
            inputDate == '' || typeof $scope.staff_salary == 'undefined') {
            notifications.notify({
                type: "error",
                msg: "Please fill all fields!"
            })
            return false;
        }
        $scope.staffs.push({
            name: $scope.staff_name,
            password: $scope.staff_password,
            position: $scope.staff_position,
            startDate: inputDate,
            salary: $scope.staff_salary,
            status: "active",
            is_mgr: false
        })
        notifications.notify({
            type: 1,
            msg: "Acount Created!"
        })
        //re initializing users
        $scope.users = $scope.staffs.concat($scope.managers)
        $scope.$apply();
        //console.log($scope.users)
    })
    //update staffs
    $scope.updateStaffs = (i) => {
        console.log($scope.staffs)
    }
    //delete staffs
    $scope.deleteStaffs = (i) => {
        if(confirm(`Are you sure you want to delete '${$scope.staffs[i].name}'?`)){
            $scope.staffs.splice(i, 1);
            //re initializing users
            $scope.users = $scope.staffs.concat($scope.managers)
            //$scope.$apply()
        }
    }
})
