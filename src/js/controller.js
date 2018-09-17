
//the notification class
const notifications = new Alerts();
//angular module
var app = angular.module('mainApp',["ngRoute"]);
app.config(($routeProvider)=>{
    $routeProvider
    .when("/",{
        templateUrl:"dashboard.html"
    })
    .when("/items",{
        templateUrl:"items.html"
    })
    .when("/emp",{
        templateUrl:"employee.html"
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

app.controller("mainCtr",($scope)=>{

//All data
//users,staff
    $scope.staff_data = [
        {name:"Mathew",position:"Waiter",age:21,startDate:"2018/08/21",salary:"XAF 30,000"},
        {name:"Kelly",position:"Cook",age:25,startDate:"2018/07/30",salary:"XAF 60,000"},
        {name:"Boris",position:"Bartender",age:22,startDate:"2018/09/01",salary:"XAF 30,000"},
        {name:"Mimi",position:"Waitress",age:20,startDate:"2018/08/17",salary:"XAF 30,000"},
        {name:"Mary",position:"Cook",age:19,startDate:"2018/07/31",salary:"XAF 70,000"},
        {name:"Fabrice",position:"Cleaner",age:26,startDate:"2018/09/03",salary:"XAF 20,000"},
        {name:"Janice",position:"Waitress",age:22,startDate:"2018/08/01",salary:"XAF 30,000"},
        {name:"Brenda",position:"Cook",age:19,startDate:"2018/07/01",salary:"XAF 30,000"},
        {name:"Auriel",position:"Cook",age:21,startDate:"2018/07/21",salary:"XAF 50,000"},
        {name:"Auriel",position:"Cook",age:21,startDate:"2018/07/21",salary:"XAF 50,000"},
        {name:"Auriel",position:"Cook",age:21,startDate:"2018/07/21",salary:"XAF 50,000"},
        {name:"Auriel",position:"Cook",age:21,startDate:"2018/07/21",salary:"XAF 50,000"},
        {name:"Auriel",position:"Cook",age:21,startDate:"2018/07/21",salary:"XAF 50,000"},
        {name:"Auriel",position:"Cook",age:21,startDate:"2018/07/21",salary:"XAF 50,000"},
        {name:"Maurice",position:"Cleaner",age:21,startDate:"2018/08/21",salary:"XAF 20,000"}
    ]
    $scope.managers = [
        {name:"Randalls Ndobs",position:"Manager",age:20,startDate:"2018/05/21",salary:"N/A"},
        {name:"Fai Brian",position:"Manager",age:19,startDate:"2018/05/21",salary:"N/A"},
    ]
    //items
    $scope.categories = [
        {name:"Food",status:"available",action:true},
        {name:"Wine",status:"unavailable",action:false}
    ]
    $scope.items = [
        {name:"Burger",rate:2000,category:"Food",status:"available",action:"N/A"}
    ]
})
app.controller("dashCtr",($scope)=>{
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
    let owl = jQuery('.owl-carousel');
    owl.owlCarousel({
        loop:true,
        margin:10,
        nav:true,
        indicators:false,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:3
            },
            1000:{
                items:5
            }
        }
    })
    jQuery('#owlFood').on('mousewheel', '.owl-stage', function (e) {
        if (e.deltaY<0) {
            jQuery(this).trigger('next.owl');
        } else {
            jQuery(this).trigger('prev.owl');
        }
        e.preventDefault();
    });
    jQuery('#owlDrinks').on('mousewheel', '.owl-stage', function (e) {
        if (e.deltaY<0) {
            jQuery(this).trigger('next.owl');
        } else {
            jQuery(this).trigger('prev.owl');
        }
        e.preventDefault();
    });


})
//itemsCtr
app.controller("itemsCtr",($scope)=>{
    $scope.category_status = "available";$scope.item_status = "available";
    //initializing collapse
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
    //categories table
    //1. Create Categories
    jQuery('#createCategoryForm').on('submit',(e)=>{
        e.preventDefault();
        if($scope.category_name == '') return false;
        let action = true;
        if($scope.category_status != "available"){
            action = false;
        }
        $scope.categories.push({name:$scope.category_name,status:$scope.category_status,action:action})
        $scope.$apply();
        notifications.notify({msg:"Added!",type:"done"})
        //console.log( $scope.categories);
    })
    $scope.updateCategories = (i)=>{
        if($scope.categories[i].status == "available"){
            $scope.categories[i].action = true;
        }else{
            $scope.categories[i].action = false;
        }
        //console.log($scope.categories);
    }
    //deleting categories
    $scope.deleteCategories = (i)=>{
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
                $scope.categories.splice(i,1);
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
    jQuery('#createItemForm').on('submit',(e)=>{
        e.preventDefault();
        if($scope.item_name == '' || $scope.item_rate == '' || $scope.item_category == ''){
            notifications.notify({msg:"Please fill all fields!",type:"error"});
            return false;
        }
        $scope.items.push({name:$scope.item_name,rate:$scope.item_rate,category:$scope.item_category,status:$scope.item_status})
        $scope.$apply();
        //reseting variables
        $scope.item_name = '';
        //nitifications
        notifications.notify({msg:"Added!",type:"done"})
    })
    //update Itemms
    $scope.updateItems = (i)=>{
        //console.log($scope.items);
    }
    //delet

})
app.controller("staffCtr",($scope)=>{
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
    jQuery('#staff').DataTable( {
        data:$scope.staff_data,
        columns:[
            {data:'name'},
            {data:'position'},
            {data:'age'},
            {data:'startDate'},
            {data:'salary'}
        ],
        columnDefs: [
            {
                targets: [ 0, 1, 2 ],
                className: 'mdl-data-table__cell--non-numeric'
            },
        ],
        dom: 'Bfrtip',
        buttons: [ {
            extend: 'excelHtml5',
            text:'Export as Excel',
            filename:'SnapBurger_Staff',
            customize: function( xlsx ) {
                var sheet = xlsx.xl.worksheets['sheet1.xml'];

                jQuery('row c[r^="C"]', sheet).attr( 's', '2' );
                }
            },
            {
                extend: 'pdf',
                className:'btn-export-pdf',
                filename:'SnapBurger_Staff',
                title:'Snap Burger',
                message:'Staffs',
                text: 'Export as PDF',
                exportOptions: {
                    modifier: {
                        page: 'current'
                    }
                }
            }
         ]
    } );
    jQuery('#managers').DataTable( {
        data:$scope.managers,
        columns:[
            {data:'name'},
            {data:'position'},
            {data:'age'},
            {data:'startDate'},
            {data:'salary'}
        ],
        columnDefs: [
            {
                targets: [ 0, 1, 2 ],
                className: 'mdl-data-table__cell--non-numeric'
            },
        ],
        dom: 'Bfrtip',
        buttons: [ {
            extend: 'excelHtml5',
            text:'Export as Excel',
            filename:'SnapBurger_Managers',
            customize: function( xlsx ) {
                var sheet = xlsx.xl.worksheets['sheet1.xml'];

                jQuery('row c[r^="C"]', sheet).attr( 's', '2' );
                }
            },
            {
                extend: 'pdf',
                filename:'SnapBurger_Managers',
                title:'Snap Burger',
                className:'btn-export-pdf',
                message:'Staffs',
                text: 'Export as PDF',
                exportOptions: {
                    modifier: {
                        page: 'current'
                    }
                }
            }
         ]
    } );
})
