app.controller("dashCtr", ($scope) => {
    //modals
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems,{opacity:0.2});
    //collapsible
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
    //=========== add items to selected Items array but first let's define remove item array
    $scope.removeItem = (name)=>{
        if(name == 'deleteAll'){
            var viewSelectedModal = M.Modal.getInstance(jQuery('#viewSelectedORders'));
            $scope.currentOrder.items = [];
            $scope.currentOrder.totalPrice = 0;
            $scope.currentOrder.totalQuantity = 0;
            //activate all buttons
            $scope.products.items.forEach(el=>{
                el.added = false;
            })
            viewSelectedModal.close();
            return true;
        }
        for(var i=0;i<$scope.currentOrder.items.length;i++){
            if($scope.currentOrder.items[i].name === name){
                $scope.currentOrder.items.splice(i,1);
                break;
            }
        }
        //$scope.currentOrder.items = array
        //console.log($scope.currentOrder.items)
    }
    $scope.addItem = (e,i) =>{
        var btn = jQuery(e.target), selectedItem = $scope.products.items[i];
        selectedItem.quantity = btn.siblings('.inputDiv').children('input.qty').val();
        selectedItem.price =  selectedItem.quantity * selectedItem.rate;
        //
        if(btn.data("clicked") == false){
            if($scope.currentOrder.items.push(selectedItem)){
                //computing prices and qunatity
                $scope.currentOrder.totalPrice = $scope.currentOrder.totalPrice + Number(selectedItem.price);
                $scope.currentOrder.totalQuantity = $scope.currentOrder.totalQuantity + Number(selectedItem.quantity);
                //misc
                $scope.products.items[i].added = true;
                btn.siblings().children('.btns').css({cursor:"default"})
                //cant use this because i usign two buttons and I toggle view
                //btn.data("clicked") == true;
            }
        }else{
            $scope.removeItem(selectedItem.name);
            //re-computing prices and qunatity
            $scope.currentOrder.totalPrice = $scope.currentOrder.totalPrice - Number(selectedItem.price);
            $scope.currentOrder.totalQuantity = $scope.currentOrder.totalQuantity - Number(selectedItem.quantity);
            //misc
            $scope.products.items[i].added = false;
            btn.siblings().children('.btns').css({cursor:"pointer"})
            //btn.data("clicked") == false;
        }
    }
    ///Finally creating order, first by setting the default table number to 1
    $scope.orderTableNumber = '1';
    $scope.createOrder = ()=>{
        if(typeof $scope.orderName == 'undefined'){
            notifications.notify({type:"error",msg:"Enter a name!"})
            return false;
        }
        if($scope.currentOrder.items.length == 0){
            notifications.notify({type:"error",msg:"Please select items"})
            return false;
        }
        //creating current order
        $scope.currentOrder.name = $scope.orderName;
        $scope.currentOrder.date = jQuery('#orderDate').val();
        $scope.currentOrder.table = $scope.orderTableNumber;
        var current = $scope.currentOrder;
        //and now pushing to main --
        //checking if order already exist
        /*$scope.todaysOrders.forEach(el=>{
            if(JSON.stringify(el) === JSON.stringify($scope.currentOrder)){
                notifications.notify({type:"error",msg:"Order already exist!"})
                return false;
            }
        })*/
        //$scope.todaysOrders.push(current);
        $scope.db.orders.add(current)
        .then(()=>{
            $scope.db.orders.toArray()
            .then((data)=>{
                $scope.orders = data;
                $scope.orderName = "";
                $scope.$apply();
                console.log($scope.orders)
                //
                swal({
                    title: "Done!",
                    text: "Added to list of orders!",
                    icon: "success",
                    button: "Okay",
                  });
                  //
                  $scope.removeItem('deleteAll') 
            })
        })
          //reseting order custom form
          //$scope.orderName = "";
          //$scope.removeItem('deleteAll') 
        //console.log($scope.todaysOrders);
    }

})