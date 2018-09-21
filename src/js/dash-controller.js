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
        selectedItem.quantity = btn.siblings('.inputDiv').children('input').val();
        selectedItem.price =  selectedItem.quantity * selectedItem.rate;
        
        //
        if(btn.data("clicked") == false){
            if($scope.currentOrder.items.push(selectedItem)){
                //computing prices and qunatity
                $scope.currentOrder.totalPrice += selectedItem.price;
                $scope.currentOrder.totalQuantity += Number(selectedItem.quantity);
                //misc
                $scope.products.items[i].added = true;
                btn.siblings().children('.btns').css({cursor:"default"})
            }
        }else{
            $scope.removeItem(selectedItem.name);
            //re-computing prices and qunatity
            $scope.currentOrder.totalPrice -= selectedItem.price;
            $scope.currentOrder.totalQuantity -= Number(selectedItem.quantity);
            //misc
            $scope.products.items[i].added = false;
            btn.siblings().children('.btns').css({cursor:"pointer"})
        }
    }

})