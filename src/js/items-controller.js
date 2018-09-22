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
        //converting first character to upper case
        $scope.category_name = $scope.category_name[0].toUpperCase()+$scope.category_name.slice(1);
        //data
        var data = {name: $scope.category_name,status: $scope.category_status,action: action}
        $scope.db.categories.add(data)
        //$scope.products.categories.push(data);
        //$scope.$apply();
        $scope.db.categories.toArray()
        .then((data)=>{
            $scope.products.categories = data;
            $scope.$apply();
            console.log($scope.products.categories)
            notifications.notify({
                msg: "Added!",
                type: "done"
            })
            $scope.category_name = ""
        })
        .catch(err=>{
            notifications.notify({msg:`An error occured:${err}`,type:"error"})
        })
        //console.log( $scope.products.categories);
    })
    //update categories
    /*$scope.updateCategories = (i) => {
        if ($scope.products.categories[i].status == "available") {
            $scope.products.categories[i].action = true;
        } else {
            $scope.products.categories[i].action = false;
        }
        //updating in db
        $scope.db.categories.put($scope.products.categories[i])
        $scope.db.categories.toArray()
        .then((data)=>{
            $scope.products.categories = data;
            $scope.$apply();
            console.log($scope.products.categories)
            notifications.notify({
                msg: "Added!",
                type: "done"
            })
        })
    }*/
    //deleting categories
    $scope.deleteCategories = (i) => {
        if(confirm(`Are you sure you want to delete '${$scope.products.categories[i].name}'?`)){
            $scope.db.categories.delete($scope.products.categories[i].id)
            $scope.db.categories.toArray()
            .then((data)=>{
                $scope.products.categories = data;
                $scope.$apply();
                console.log($scope.products.categories)
                notifications.notify({
                    msg: "Removed!",
                    type: "done"
                })
            })
            .catch(err=>{
                notifications.notify({msg:`An error occured:${err}`,type:"error"})
            })
        }
        
    }
    //===========================ITEMS ==========================================================================
    //Create Items
    jQuery('#createItemForm').on('submit', (e) => {
        e.preventDefault();
        if (typeof $scope.item_name !== 'string' || typeof $scope.item_rate !== 'number' || typeof $scope.item_category !== 'string') {
            notifications.notify({
                msg: "Invalid values!",
                type: "error"
            });
            return false;
        }
        let data = {name: $scope.item_name,rate: $scope.item_rate,category: $scope.item_category,status: $scope.item_status}
        //$scope.products.items.push()
        //Add to database
        $scope.db.items.add(data)
        .then(()=>{
            $scope.db.items.toArray()
            .then(data=>{
                $scope.products.items = data;
                $scope.item_name = '';
                $scope.item_rate = '';
                $scope.$apply();
                //console.log($scope.products.items)
                //reseting variables
                //nitifications
                notifications.notify({
                    msg: "Added!",
                    type: "done"
                })
            })
        })
    })
    //update Itemms
    $scope.updateItems = (i) => {
        $scope.products.items[i].action = true;
        if ($scope.products.items[i].status !== 'available') {

            $scope.products.items[i].action = false;
        }
        //updating database
        $scope.db.items.put($scope.products.items[i])
        .then(()=>{
            $scope.db.items.toArray()
            .then(data=>{
                $scope.products.items = data;
                $scope.item_name = '';
                $scope.item_rate = '';
                $scope.$apply();
                console.log($scope.products.items)
                //reseting variables
                //nitifications
                notifications.notify({
                    msg: "Added!",
                    type: "done"
                })
            })
        })
        //console.log($scope.products.items[i]);
    }
    //delete Items
    $scope.deleteItems = (i) => {
        if(confirm(`Are you sure you want to delete '${$scope.products.items[i].name}'?`)){
            //updating database
            $scope.db.items.delete($scope.products.items[i].id)
            .then(()=>{
                $scope.db.items.toArray()
                .then(data=>{
                    $scope.products.items = data;
                    $scope.$apply();
                    console.log($scope.products.items)
                    //reseting variables
                     //nitifications
                    notifications.notify({
                        msg: 'Deleted!',
                         type: "done"
                    })
                })
            })
        }
        
    }

})