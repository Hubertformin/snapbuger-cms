app.controller("todayCtr",($scope)=>{
     //first thing, setting the sidenav link to active
     jQuery('.sideNavLink').removeClass('active');
     jQuery('#todaysLink').addClass('active');
     //date
    const start = new Date(), end = new Date();
    start.setHours(0,0); end.setHours(23,59);
     //fetch database
    //getting settings
    $scope.db.settings.get(1).then((settings)=> {

        $scope.settings = settings;

        $scope.settings.host_url =  ($scope.settings.host_url === undefined)?"localhost":$scope.settings.host_url;
        $scope.settings.host_port =  ($scope.settings.host_port === undefined)? 4000 :$scope.settings.host_port;
        $scope.settings.hostComputer =  ($scope.settings.hostComputer === undefined)? false :$scope.settings.hostComputer;
        $scope.settings.hostBroadcast =  ($scope.settings.hostBroadcast === undefined)? false :$scope.settings.hostBroadcast;
        $scope.settings.remotePrinting =  ($scope.settings.remotePrinting === undefined)? false :$scope.settings.remotePrinting;
        $scope.settings.broadcast_port =  ($scope.settings.broadcast_port === undefined)? 4000 :$scope.settings.broadcast_port;
        $scope.settings.printOrders = $scope.settings.printOrders === undefined ? true : $scope.settings.printOrders;
        $scope.settings.printPreview = $scope.settings.printPreview === undefined ? false : $scope.settings.printPreview;
        $scope.settings.timeoutPerLine = $scope.settings.timeoutPerLine === undefined ? 400 : $scope.settings.timeoutPerLine;
        $scope.settings.printOrderCompartments = $scope.settings.printOrderCompartments === undefined ? false : $scope.settings.printOrderCompartments;
        $scope.settings.ordersAutoCompletion = $scope.settings.ordersAutoCompletion === undefined ? true : $scope.settings.ordersAutoCompletion;

        $scope.$apply();
        //jQuery('#orders_from').val($scope.settings.time_range.from);
        //jQuery('#orders_to').val($scope.settings.time_range.to);
    })

     $scope.todaysCompletedOrders = [];
     $scope.Amounts =  {
         all:0,
         unCompleted:0,
         completed:0
     };
    $scope.fetchAndComputeOrders = () => {
        $scope.db.orders.where('date').between(start, end, true, true).toArray()
            .then((data)=>{
                $scope.Amounts =  {
                    all:0,
                    unCompleted:0,
                    completed:0
                };

                $scope.todaysCompletedOrders = data;

                $scope.completedOrders = data.filter(el => {
                    return el.completed === true;
                });

                $scope.unCompletedOrders = data.filter(el => {
                    return el.completed !== true;
                });

                //getting totals
                data.forEach(el => {
                    $scope.Amounts.all += Number(el.totalPrice); //summing all orders
                    if (el.completed) {
                        $scope.Amounts.completed += Number(el.totalPrice);
                    } else {
                        $scope.Amounts.unCompleted += Number(el.totalPrice);
                    }
                })

                $scope.$apply();
            }).catch(err=>{
                console.error(err);
            })
    };
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
    //promt print
    //prompt print
    $scope.promptPrint = (order)=>{
        if(confirm("Are you sure you want to print this order?")){
            $scope.printOrders(order);
        }
    };

    //complete orders
    $scope.onCompleteOrders = (obj) => {
        if (obj.completed) {
            obj.completed = true;
            $scope.db.orders.put(obj).then(()=>{
                //refetch
                $scope.fetchAndComputeOrders();
            });
        } else {
            if (confirm("Are you sure you want to uncheck? this can cause computation errors.")) {
                if (!$scope.currentUser.is_mgr) {
                    obj.completed = true;
                    notifications.notify({type:"error",title:"Operation failed!", msg:"You're not authorized to perform this operation"});
                    return;
                }
                //unchecking orders
                obj.completed = false;
                $scope.db.orders.put(obj).then(()=>{
                    //refetch
                    $scope.fetchAndComputeOrders();
                });
            } else {
                obj.completed = true;
            }
        }
    }


});