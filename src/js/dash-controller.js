app.controller("dashCtr", ($scope,$filter) => {
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#dashboardLink').addClass('active');
    
    //====================== FETCH AND COMPUTE =======================
    const today = new Date().toDateString();

    $scope.order_waiter = "";

    $scope.fetchAndComputeOrders = () => {
        //fetched users and now fetching categories
       /*$scope.db.categories.toArray()
       .then((data) => {
           $scope.products.categories = data;
        })*/
       //fetcing items
       /*$scope.db.items.toArray()
       .then((data) => {
           $scope.products.items = data;
       })*/
        /*$scope.db.orders.toArray()
            .then((data)=>{
                $scope.todaysCompletedOrders = [];
                $scope.todaysCompletedOrdersTotals = 0;
                $scope.orders = data;
                $scope.orders.forEach(elems=>{
                    if(elems.date.toDateString() == today){
                        $scope.todaysCompletedOrders.push(elems);
                        $scope.todaysCompletedOrdersTotals += Number(elems.totalPrice);
                    }
                })
                $scope.$apply();
            })*/
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
    //input current date into date picker input by default
    jQuery('#orderDate').val(formatDate());
    /*jQuery('.scrollContainer').on('mousewheel', function (e) {
        if (e.deltaY < 0) {
            jQuery(this).scrollLeft(jQuery(this).scrollLeft()+40);
        } else {
            jQuery(this).scrollLeft(jQuery(this).scrollLeft()-40);
        }
        e.preventDefault();
    });*/
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
    /*$scope.removeItem = (e,name)=>{
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
        if(e != null){
            jQuery(e.target).siblings('div.inputDiv').children('input.qty').val(1);
        }
        //jQuery('input.qty').val(1);
        //$scope.currentOrder.items = array
        console.log()
    }*/
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
    //this sections used to preview items when input is put
    $scope.showPreviewItems = [];

    $scope.getPreviewItems = (e)=>{
        //loader
        jQuery('#previewItemsLoader').waitMe({
            effect : 'bounce',
            text : '',                
            bg : 'rgba(255,255,255,1)',
            color : '#ef5350 ',
        });
        
        $scope.showPreviewItems = [];
        
        const view = $('#previewItems');
        
        jQuery('#previewItemsLoader').fadeIn("fast");
        
        if(e.currentTarget.value == "") {
            view.fadeOut("fast");
        }
        
        if(!/[a-zA-Z]/.test(e.currentTarget.value)) return;
        
        view.fadeIn("fast");
        
        $scope.db.items.where("name").startsWithIgnoreCase(e.currentTarget.value.toLowerCase()).limit(6).toArray()
        .then((data)=>{
            if(data.length !== 0) {

                $scope.showPreviewItems = data;
                jQuery('#previewItemsLoader').fadeOut("fast");
                $scope.$apply();
            
            } else {
                $scope.db.items.where("category").startsWithIgnoreCase(e.currentTarget.value.toLowerCase()).limit(6).toArray()
                .then((data)=>{
                    if (data.length !== 0) {
                        
                        $scope.showPreviewItems = data;
                        jQuery('#previewItemsLoader').fadeOut("fast");

                    } else {
                        jQuery('#previewItemsLoader').html("No items found.")
                        jQuery('#previewItemsLoader').waitMe("hide");
                    }
                    $scope.$apply();
                })
            }
        
            
        })
        /*for(let i = 0; i < $scope.products.items.length;i++) {
            if(counter === 5) break;
            if($scope.products.items[i].name.toLowerCase().indexOf(e.currentTarget.value.toLowerCase()) > -1) {
                $scope.showPreviewItems.push($scope.products.items[i]);
                counter += 1;
            }else if ($scope.products.items[i].category.toLowerCase().indexOf(e.currentTarget.value.toLowerCase()) > -1) {
                $scope.showPreviewItems.push($scope.products.items[i]);
                counter += 1;
            }
        }
        //no results
        if(counter == 1) {
            view.fadeOut("fast");
        }*/
        //console.log($scope.products.items);
    }
    //when item from preview is clicked
    $scope.currItem = {name:'',rate:0,qty:1}
    $scope.selectItem = (i)=>{
        $('#prevItemName').val($scope.showPreviewItems[i].name);
        $('#prevItemRate').val($scope.showPreviewItems[i].rate);
        $scope.currItem = $scope.showPreviewItems[i];
        $scope.currItem.quantity = 1;
        //console.log($scope.currItem);
        $('#previewItems').fadeOut("fast");
    }
    //now adding to car
    $scope.toCart = () => {
        //checking for invalid numerals
        if (Number($('#prevItemQty').val()) < 1 ) {
            notifications.notify({title:"Invalid quantity",type:"error",msg:"There should be at least 1 quantity!"});
            return;
        }
        //taking new qty
        $scope.currItem.quantity = Number($('#prevItemQty').val());
        $scope.currItem.rate = Number($('#prevItemRate').val());
        if($scope.currItem.name == '' || $scope.currItem.rate == 0) {
            notifications.notify({title:"No selected item!",type:"error",msg:"Please select item to proceed"});
            return;
        };
        //checking if item already exit
        for(let i = 0; i < $scope.currentOrder.items.length; i++ ) {
            if($scope.currentOrder.items[i].id === $scope.currItem.id) {
                notifications.notify({title:"Item is already added!",type:"error",msg:""});
                return;
            }
        }
        //adding item to cart
        $scope.currItem.price = $scope.currItem.quantity * $scope.currItem.rate;
        $scope.currentOrder.items.push($scope.currItem);
        //adding the
        $scope.currentOrder.totalPrice = $scope.currentOrder.totalPrice + Number($scope.currItem.price);
        $scope.currentOrder.totalQuantity = $scope.currentOrder.totalQuantity + Number($scope.currItem.quantity);
        //reseting form
        $('#prevItemName').val('');
        $('#prevItemRate').val(0);
        $('#prevItemQty').val(1);

    }
    //remove items
    $scope.removeItem = (i)=>{ 
        //resuming totals
        $scope.currentOrder.totalPrice -= Number($scope.currentOrder.items[i].price);
        $scope.currentOrder.totalQuantity -= Number($scope.currentOrder.items[i].quantity);
        //removing
        $scope.currentOrder.items.splice(i,1);
    }


    ///Finally creating order, first by setting the default table number to 1
    $scope.orderTableNumber = '1';
    $scope.orderInv = `SBO${Math.floor(Math.random() * (99999 - 10000) ) + 10000}`;

    /**
     * @function createOrder
     */
    $scope.createOrder = (print)=>{
        if($scope.currentOrder.items.length == 0){
            notifications.notify({title:"No Items selected",type:"error",msg:"Please select items to proceed"})
            return false;
        }
        const staff = JSON.parse(sessionStorage.getItem('user'))
        //creating current order
        $scope.currentOrder.inv = $scope.orderInv;
        $scope.currentOrder.date = new Date();
        $scope.currentOrder.tableNum = $scope.orderTableNumber;
        $scope.currentOrder.staff = staff.name;
        $scope.currentOrder.waiter = $scope.order_waiter;
        const current = $scope.currentOrder;
        //and now pushing to main --
        $scope.db.orders.add(current)
        .then(()=>{
                //$scope.fetchAndComputeOrders();
                $scope.orderInv = `SBO${Math.floor(Math.random() * (99999 - 10000) ) + 10000}`;
                $scope.currentOrder.items = [];
                $scope.currentOrder.totalQuantity = 0;
                $scope.currentOrder.totalPrice = 0;
                $scope.currentOrder.waiter = "";
                $scope.order_waiter = "";
                //$scope.removeItem(null,'deleteAll');
                //jQuery('input.qty').val(1);
                $scope.$apply();
                
                 //hide modal
                 jQuery("#printModal").fadeOut("fast");
                //print if print was specified
                if (print) {
                    //printing orders
                    $scope.db.orders.get(current.id)
                    .then(data=>{
                        swal("Order saved","added to printer queue","success");
                        $scope.printOrders(data);
                        //deleting current id because next order would still have that id
                        //and dexie would return an exception.
                        delete current.id;
                        //deleting current id because next order would still have that id
                        //and dexie would return an exception.
                    })
                } else {
                    swal("Order saved", "proccess completed","success");
                    delete current.id;
                    return false;
                }
                /*swal({
                    title: "Order completed!",
                    text: "Added to orders queue",
                    icon: "success",
                    buttons:['Cancel','Print'],
                    dangerMode: false,
                })
                .then((click) => {
                    
                    
                });*/
        })
        .catch(err=>{
            $scope.orderInv = `SBO${Math.floor(Math.random() * (99999 - 10000) ) + 10000}`;
            $scope.createOrder(print);
            console.log(err);
        })
          //reseting order custom form
          //$scope.orderInv = "";
          //$scope.removeItem('deleteAll') 
        //console.log($scope.todaysOrders);
    }
    //



    async function showEstimatedQuota() {
        if (navigator.storage && navigator.storage.estimate) {
          const estimation = await navigator.storage.estimate();
          console.log(`Quota: ${estimation.quota}`);
          console.log(`Usage: ${estimation.usage}`);
        } else {
          console.error("StorageManager not found");
        }
      }
      //showEstimatedQuota();
    

      /**
       * @function saveOders
       * @params {orders}
       */
      $scope.showSaveOrder = (show = true) => {
          if(show) {
            jQuery("#printModal").fadeIn("fast");
          } else {
              $scope.order_waiter = "";
            jQuery("#printModal").fadeOut("fast");
          }
      }

      

})