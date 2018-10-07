app.controller("dashCtr", ($scope,$filter) => {
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#dashboardLink').addClass('active');
    //====================== FETCH AND COMPUTE =======================
    const today = new Date().toDateString();$scope.todaysCompletedOrders = [];
    $scope.fetchAndComputeOrders = () => {
        $scope.db.orders.toArray()
            .then((data)=>{
                $scope.todaysCompletedOrders = [];
                $scope.orders = data;
                $scope.orders.forEach(elems=>{
                    if($scope.currentUser.is_mgr){
                        if(elems.date.toDateString() == today){
                            $scope.todaysCompletedOrders.push(elems)
                        }
                    }else if(!$scope.currentUser.is_mgr){
                        if(elems.date.toDateString() == today && elems.staff ==$scope.currentUser.name){
                            $scope.todaysCompletedOrders.push(elems)
                        }
                    }
                    
                })
                $scope.$apply();
            })
    }
    $scope.fetchAndComputeOrders();
    //modals
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems,{opacity:0.2});
    //collapsible
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
    var instance = M.Collapsible.getInstance(jQuery('#OrderCollapse'));
    //instance.open()
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
    $scope.removeItem = (e,name)=>{
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
            jQuery('input.qty').val(1);
            return true;
        }
        for(var i=0;i<$scope.currentOrder.items.length;i++){
            if($scope.currentOrder.items[i].name === name){
                $scope.currentOrder.items.splice(i,1);
                break;
            }
        }
        jQuery(e.target).siblings('div.inputDiv').children('input.qty').val(1)
        //jQuery('input.qty').val(1);
        //$scope.currentOrder.items = array
        console.log()
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
            $scope.removeItem(e,selectedItem.name);
            //re-computing prices and qunatity
            $scope.currentOrder.totalPrice = $scope.currentOrder.totalPrice - Number(selectedItem.price);
            $scope.currentOrder.totalQuantity = $scope.currentOrder.totalQuantity - Number(selectedItem.quantity);
            //misc
            $scope.products.items[i].added = false;
            btn.siblings().children('.btns').css({cursor:"pointer"})
            //btn.data("clicked") == false;
        }
    }
    //
    //this section represents the activity and the today's orders table
    $scope.Time  = (dt)=>{
        var time = new Date(dt),hour = time.getHours(),min = time.getMinutes();
        if(hour < 10){
            hour = '0'+hour;
        }
        if(min < 10){
            min = '0'+min;
        }
        //console.log(dt)
        return `${hour}:${min}`;
    }
    //========================================================


    ///Finally creating order, first by setting the default table number to 1
    $scope.orderTableNumber = '1';
    $scope.orderInv = `SB${Math.floor(Math.random() * 999) + 1000}`;
    $scope.createOrder = ()=>{
        if($scope.currentOrder.items.length == 0){
            notifications.notify({type:"error",msg:"Please select items"})
            return false;
        }
        const staff = JSON.parse(sessionStorage.getItem('user'))
        //creating current order
        $scope.currentOrder.name = $scope.orderInv;
        $scope.currentOrder.date = new Date();
        $scope.currentOrder.table = $scope.orderTableNumber;
        $scope.currentOrder.staff = staff.name;
        const current = $scope.currentOrder;
        //and now pushing to main --
        $scope.db.orders.add(current)
        .then(()=>{
                $scope.fetchAndComputeOrders();
                $scope.orderInv = `SB${Math.floor(Math.random() * 999) + 1000}`;
                $scope.removeItem('deleteAll');
                jQuery('input.qty').val(1);
                $scope.$apply();
                //console.log($scope.orders)
                //
                swal({
                    title: "Order completed!",
                    text: "Added to orders queue",
                    icon: "success",
                    buttons:['Cancel','Print'],
                    dangerMode: false,
                })
                .then((click) => {
                    
                    if (click) {
                        //printing orders
                        $scope.db.orders.get(current.id)
                        .then(data=>{
                            console.log(data);
                            $scope.printOrders(data);
                            //deleting current id because next order would still have that id
                            //and dexie would return an exception.
                            delete current.id;
                        })
                        
                        //$scope.printOrders();
                        //deleting current id because next order would still have that id
                        //and dexie would return an exception.
                        //console.log(current)
                    } else {
                        delete current.id;
                        return false;
                    }
                });
        })
        .catch(err=>{
            console.log(err)
        })
          //reseting order custom form
          //$scope.orderInv = "";
          //$scope.removeItem('deleteAll') 
        //console.log($scope.todaysOrders);
    }
    //prompt print
    $scope.promptPrint = (order)=>{
        if(confirm("Are you sure you want to print this order?")){
            $scope.printOrders(order);
        }
    }
    async function showEstimatedQuota() {
        if (navigator.storage && navigator.storage.estimate) {
          const estimation = await navigator.storage.estimate();
          console.log(`Quota: ${estimation.quota}`);
          console.log(`Usage: ${estimation.usage}`);
        } else {
          console.error("StorageManager not found");
        }
      }
      showEstimatedQuota();
    

})