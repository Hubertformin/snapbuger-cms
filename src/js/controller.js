//Require fucntions and classes
require('../src/js/main.js');
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
    $scope.Gcategories = [
        {name:"Food",status:"available",action:true},
        {name:"Wine",status:"unavailable",action:false}
    ]
    $scope.items_data = [
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
    $scope.categories = $scope.Gcategories;
    $scope.category_status = "available";$scope.item_status = "available";

    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
    //initializing collapse
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
    //initializing select
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
    //categories table
    var categoriesTable = jQuery('#categories').DataTable( {
        data:$scope.categories,
        columns:[
            {data:"name"},
            {data:"status"},
            {data:"action"}
        ],
        columnDefs: [
            {
                targets: [ 0, 1, 2 ],
                className: 'mdl-data-table__cell--non-numeric'
            }
        ]
    } );
    //row click to update or delete category tabIndex is initiallized
    $scope.categoriesTableIndex;
    jQuery('#categories tbody').on( 'click', 'tr', function () {
        $scope.updateCategoriesBtn = false;
        var instance = M.Modal.getInstance(jQuery('#updateCategoryModal'));
        //
        instance.open();
        $scope.categoriesTableIndex = categoriesTable.row( this ).index()
        $scope.updateCategories = $scope.categories[$scope.categoriesTableIndex];
        //alert( 'Row index: '+table.row( this ).index() );
    } );
    //on submit
    jQuery('#updateCategoriesBtn').on('click',()=>{
        if($scope.updateCategories.name == ''){
            notifications.notify({msg:"You must insert valid values!",type:"error"})
            return false;
        }
        if($scope.updateCategories.status == 'available'){
            $scope.updateCategories.action = true;
        }else{
            $scope.updateCategories.action = false;
        }
        $scope.categories[$scope.categoriesTableIndex] = $scope.updateCategories;
        /*=====================================================================================
        update Category database here!
        =====================================================================================*/
        console.log($scope.categories[$scope.categoriesTableIndex]);
        //actions to do after datatables refresh
        notifications.notify({msg:"Changed!",type:"success"})
        jQuery('#categories').DataTable().draw(true);
    })
    //functions 1.to create category
    jQuery('#createCategoryForm').on('submit',(e)=>{
        e.preventDefault();
        if(typeof $scope.category_name !== 'string') {jQuery('.categories_error').html('Enter a name!'); return false;}
        if(/[a-zA-Z0-9]/.test($scope.category_name) == false){ jQuery('.categories_error').html("Invalid name must contain letters or numbers!"); return false;}
        if(typeof $scope.category_status !== 'string') {jQuery('.categories_error').html("Please select status!"); return false;}
        jQuery('.categories_error').html('');
        let action = true;
        if($scope.category_status != 'available'){action = false;}
        var newData = {name:$scope.category_name,status:$scope.category_status,action:action};
        console.log(newData)
        $scope.categories.push(newData);
        //reseting form
        document.querySelector('#createCategoryForm').reset();
        //reseting category status variable
        $scope.category_status = "available";
        //showing message
        swal("Done!", "Category Created!", "success");
        //redrawing adding and drawing
        jQuery('#categories').DataTable().rows.add([newData]).draw();
        //for delete
        //table.row( $button.parents('tr') ).remove().draw();

    })
    //Item DataTable
    var itemsTable = jQuery('#items').DataTable( {
        data:$scope.items_data,
        columns:[
            {data:'name'},
            {data:'rate'},
            {data:'category'},
            {data:'status'},
            {data:'action'},
        ],
        dom: 'Bfrtip',
        buttons: [ {
            extend: 'excelHtml5',
            text:'Export as Excel',
            filename:'Categories',
            customize: function( xlsx ) {
                var sheet = xlsx.xl.worksheets['sheet1.xml'];

                jQuery('row c[r^="C"]', sheet).attr( 's', '2' );
                }
            },
            {
                extend: 'pdf',
                filename:'Categories',
                title:'Snap Burger',
                className:'btn-export-pdf',
                message:'Categories Table',
                text: 'Export as PDF',
                exportOptions: {
                    modifier: {
                        page: 'current'
                    }
                }
            }
         ],
        columnDefs: [
            {
                targets: [ 0, 1, 2 ],
                className: 'mdl-data-table__cell--non-numeric'
            }
        ]
    } );
    //submit item
    jQuery('#createItemForm').on('submit',(e)=>{
        e.preventDefault();
        if(typeof $scope.item_name !== 'string' || typeof $scope.item_status !== 'string' || typeof $scope.item_rate !== 'number' || typeof $scope.item_category !== 'string') {
            jQuery('.item_error').html('Please fill all fields!');
            console.log("an error!")
            return false;
        }
        let newData = {name:$scope.item_name,rate:$scope.item_rate,status:$scope.item_status,category:$scope.item_category,action:"N/A"};
        jQuery('.item_error').html('');
        $scope.items_data.push(newData)
        document.querySelector('#createItemForm').reset();
        swal("Done!", "Item Created!", "success");
        jQuery('#items').DataTable().rows.add([newData]).draw();
    });
    //update items
    $scope.itemTableIndex;
    jQuery('#items tbody').on( 'click', 'tr', function () {
        var instance = M.Modal.getInstance(jQuery('#updateItemsModal'));
        //
        instance.open();
        $scope.itemTableIndex = itemsTable.row( this ).index()
        $scope.updateItems = $scope.items_data[$scope.itemTableIndex];
        //alert( 'Row index: '+table.row( this ).index() );
    } );
    jQuery('#updateItemsForm').on('submit',(e)=>{
        e.preventDefault();
        if($scope.updateItems.name == "" || $scope.updateItems.rate == ""){
            Alerts.notify({msg:"No empty fields!",type:"error"})
            return false;
        }
        $scope.items_data[$scope.itemTableIndex] = $scope.updateItems;
        /*====================================================================
        Update Items here
        =====================================================================*/
        notifications.notify({msg:"Done!",type:"success"})
        console.log($scope.items_data)
    })
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
