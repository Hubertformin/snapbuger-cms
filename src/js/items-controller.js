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
            notifications.notify({msg:`Unable to update Table Number`,title:"Unknown error",type:"error"})
        })
    }
    //categories table
    //=========================== Categories ======================
    //1. Create Categories
    jQuery('#createCategoryForm').on('submit', (e) => {
        e.preventDefault();
        if (typeof $scope.category_name !== 'string' || $scope.category_name == ''){
            notifications.notify({title:"Category name required!",msg:"Please insert a valid category name",type:"error"});
            return false;
        }
        let action = true;
        if ($scope.category_status != "available") {
            action = false;
        }
        //converting first character to upper case
        $scope.category_name = $scope.category_name[0].toUpperCase()+$scope.category_name.slice(1).toLowerCase();
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
                    title:"Complete",
                    msg: "New category added to list",
                    type: "done"
                })
            })
            .catch(err=>{
                notifications.notify({title:"Unknown error!",msg:`Unable refresh categories list`,type:"error"})
            })
        })
        .catch(err=>{
            notifications.notify({
                title:"Unable to Add category to list",
                msg:"Failed to add category,please make sure the category does not already exist!",
                type:"error"
            },9000)
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
                        title:"Complete",
                         msg: "Category removed from list",
                         type: "done"
                    })
                 })
                .catch(err=>{
                    notifications.notify({title:"Unknow error",msg:`Unable to refresh categories`,type:"error"})
                })
            })
            .catch(()=>{
                notifications.notify({title:"Unknow error",msg:`Unable to delete category`,type:"error"}) 
            })
            
        }
        
    }
    //===========================ITEMS ==========================================================================
    //Create Items
    jQuery('#createItemForm').on('submit', (e) => {
        e.preventDefault();
        if(typeof $scope.item_name !== 'string' && typeof $scope.item_rate !== 'number' && typeof $scope.item_category !== 'string') {
            notifications.notify({
                title:"Empty values!",
                msg: "Please fill in the form",
                type: "error"
            });
            return;
        }
        if(typeof $scope.item_name !== 'string' || $scope.item_name == ''){
            notifications.notify({
                title:"Item name required!",
                msg: "Please add a valid item name",
                type: "error"
            });
            return;
        }
        if(typeof $scope.item_rate !== 'number'){
            notifications.notify({
                title:"Item rate required!",
                msg: "Please add price of the item",
                type: "error"
            });
            return;
        }
        if(typeof $scope.item_category !== 'string' || $scope.item_category == ''){
            notifications.notify({
                title:"Item category required!",
                msg: "Please select a category.",
                type: "error"
            });
            return;
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
                    title:"Complete",
                    msg: "New item added to list",
                    type: "done"
                })
            })
            .catch(()=>{
                notifications.notify({title:"Unknow error",msg:' Unable to refresh items list',type:"error"})
            })
        })
        .catch(err=>{
            notifications.notify({
                type:"error",
                title:"Unable to add item to list",
                msg:"Failed to add item to list,please make sure this item does not already exist"
            },9000)
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
                notifications.notify({title:"Unknown error",msg:'Unable to refresh of items list',type:"error"})
            })
        })
        .catch(()=>{
            notifications.notify({
                title:"Unknown error",
                msg:'Unable to update items list,please make sure new item doesn\'t already exist!',
                type:"error"},9000)
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
                        title:"Complete",
                        msg: 'item removed from list',
                         type: "done"
                    })
                })
                .catch(()=>{
                    notifications.notify({title:"Unknown error",msg:'Unable to refresh items list',type:"error"})
                })
                //
            })
            .catch(()=>{
                notifications.notify({title:"Unnown rror",msg:'Unable to Delete item',type:"error"})
            })
            //
        }
        
    }

})