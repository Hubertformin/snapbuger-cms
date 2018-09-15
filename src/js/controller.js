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
app.controller("itemsCtr",($scope)=>{
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
    //initializing collapse
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
    //initializing select
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
    //categories table
    var data = [
        [
            "Cocktails",
            "Available",
            "N/A"
        ],
        [
            "Food",
            "Available",
            "N/A"
        ],
        [
            "Lemonade",
            "Available",
            "N/A"
        ]
    ]
    $('#categories').DataTable( {
        data:data,
        keys: true,
        columnDefs: [
            {
                targets: [ 0, 1, 2 ],
                className: 'mdl-data-table__cell--non-numeric'
            }
        ]
    } );
})
app.controller("staffCtr",($scope)=>{
    $('#staff').DataTable( {
        columnDefs: [
            {
                targets: [ 0, 1, 2 ],
                className: 'mdl-data-table__cell--non-numeric'
            }
        ]
    } );
})