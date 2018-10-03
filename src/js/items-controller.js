app.controller("itemsCtr", ($scope) => {
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#productsLink').addClass('active');
    //
    $scope.category_status = "available";
    $scope.item_status = "available";
    //initializing collapse
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
    //=============== Table Number =========================
    $scope.updateTableNumber = ()=>{
        if(typeof $scope.settings.tableNumber !== 'number'){
            //notifications.notify({type:"error",msg:"Invalid Table Number!"})
            //console.log($scope.settings.tableNumber[0].number)
            //$scope.products.tableNumber = 1;
            return false;
        }
        //{number:$scope.settings.tableNumber}
        $scope.db.settings.put($scope.settings)
        .then(()=>{
            //console.log("Done!");
        })
        .catch((err)=>{
            notifications.notify({msg:`Erorr! ${err}`,type:"error"})
        })
    }
    //categories table
    //=========================== Categories ======================
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
        .then(()=>{
            $scope.db.categories.toArray()
             .then((data)=>{
                $scope.products.categories = data;
                $scope.category_name = "";
                $scope.$apply();
                //console.log($scope.products.categories)
                notifications.notify({
                    msg: "Added!",
                    type: "done"
                })
            })
            .catch(err=>{
                notifications.notify({msg:`An error occured: Unable to refetch!`,type:"error"})
            })
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
            .then(()=>{
                $scope.db.categories.toArray()
                .then((data)=>{
                    $scope.products.categories = data;
                    $scope.$apply();
                    //console.log($scope.products.categories)
                    notifications.notify({
                         msg: "Removed!",
                         type: "done"
                    })
                 })
                .catch(err=>{
                    notifications.notify({msg:`An error occured: Unable to refetch!`,type:"error"})
                })
            })
            .catch(()=>{
                notifications.notify({msg:`An error occured: Unable to delete!`,type:"error"}) 
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
        //converting first character to upper case
        $scope.item_name = $scope.item_name[0].toUpperCase()+$scope.item_name.slice(1);
        //date
        let data = {name: $scope.item_name,rate: $scope.item_rate,category: $scope.item_category,status: $scope.item_status,action:true}
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
            .catch(()=>{
                notifications.notify({msg:'An error occured: Unable to refetch!',type:"error"})
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
                //console.log($scope.products.items)
                //reseting variables
                //nitifications
            })
            .catch(()=>{
                notifications.notify({msg:'An error occured: Unable to refetch!',type:"error"})
            })
        })
        .catch(()=>{
            notifications.notify({msg:'An error occured: Unable to Update!',type:"error"})
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
                    //console.log($scope.products.items)
                    //reseting variables
                     //nitifications
                    notifications.notify({
                        msg: 'Deleted!',
                         type: "done"
                    })
                })
                .catch(()=>{
                    notifications.notify({msg:'An error occured: Unable to refetch!',type:"error"})
                })
                //
            })
            .catch(()=>{
                notifications.notify({msg:'An error occured: Unable to Delete!',type:"error"})
            })
            //
        }
        
    }

})