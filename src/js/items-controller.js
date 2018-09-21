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