app.controller('reportsCtr',($scope)=>{
    //var instance = M.Tabs.init(jQuery('.tabs'));
    //for date display array, first we reverse sort
    function toDate(dt){
        return new Date(dt).toDateString();
    }
    $scope.uniqueDateOrders = []
    for(var i = 0;i<$scope.orders.length;i++){
        $scope.orders[i].date = toDate($scope.orders[i].date)
        if(i>0 && toDate($scope.orders[i-1].date) == toDate($scope.orders[i].date)){
            continue;
        }
        $scope.uniqueDateOrders.push($scope.orders[i])
    }
    //area charts 
    var graph =  Morris.Area({
        element: 'orderChart',
        data: [
            {x: '2018-10-03',y:76},
            {x: '2018-10-02',y:28},
            {x: '2018-10-01',y:23},
            {x: '2018-09-30',y:46},
            {x: '2018-09-29',y:13},
            {x: '2018-09-28',y:23},
            {x: '2018-09-27',y:36},
            {x: '2018-09-26',y:33},
            {x: '2018-09-25',y:20},
            {x: '2018-09-24',y:23},
        ],
        xkey: 'x',
        ykeys: ['y'],
        labels: ['Orders'],
        hideHover: 'auto',
        resize: true,
        lineColors:['#009688'],
        behaveLikeLine:true
    });
    $scope.update = ()=>{
        graph.setData([
            {x: '2018-10-03',y:76},
            {x: '2018-10-02',y:28},
            {x: '2018-10-01',y:23},
            {x: '2018-09-30',y:46},
            {x: '2018-09-29',y:28},
            {x: '2018-09-28',y:23},
            {x: '2018-09-27',y:36},
            {x: '2018-09-26',y:33},
            {x: '2018-09-25',y:20},
            {x: '2018-09-24',y:23},
        ])
    }
    //functions
    $scope.filterOrdersView = (dt)=>{
        jQuery('#allOrders tr').hide();
        jQuery(`#allOrders tr[data-date="${dt}"]`).show();

    }
    //showing todays orders
   
})