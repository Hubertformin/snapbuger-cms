app.controller("todayCtr",($scope)=>{
     //first thing, setting the sidenav link to active
     jQuery('.sideNavLink').removeClass('active');
     jQuery('#todaysLink').addClass('active');
     //fetch database
     var d = new Date(),today = d.toDateString();
     $scope.todaysCompletedOrders = [];
     $scope.todaysCompletedOrdersTotals = 0;
    $scope.fetchAndComputeOrders = () => {
        $scope.db.orders.toArray()
            .then((data)=>{
                $scope.todaysCompletedOrders = [];
                $scope.todaysCompletedOrdersTotals = 0;
                $scope.orders = data;
                $scope.orders.forEach(elems=>{
                    if(elems.date.toDateString() == today){
                        $scope.todaysCompletedOrders.push(elems);
                        console.log(elems)
                        $scope.todaysCompletedOrdersTotals += Number(elems.totalPrice);
                    }
                })
                $scope.$apply();
            }).catch(err=>{

            })
    }
    $scope.fetchAndComputeOrders();
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
    
})