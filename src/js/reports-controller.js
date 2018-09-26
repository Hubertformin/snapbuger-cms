app.controller('reportsCtr',($scope)=>{
    //refetcing orders
    $scope.db.orders.toArray()
   .then((data)=>{
        $scope.orders = data;
        $scope.orders.sort(function(a,b){
            return (a.id < b.id)?1:((b.id < a.id)? -1:0);
        });
   })
    //var instance = M.Tabs.init(jQuery('.tabs'));
    $scope.toTime  = (dt)=>{
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
    //for date display array, first we reverse sort
    function toDate(dt){
        return new Date(dt).toDateString();
    }
    $scope.uniqueDateOrders = []
    for(var i = 0;i<$scope.orders.length;i++){
        //$scope.orders[i].date = toDate($scope.orders[i].date)
        if(i>0 && toDate($scope.orders[i-1].date) == toDate($scope.orders[i].date)){
            continue;
        }
        $scope.uniqueDateOrders.push($scope.orders[i].date)
    }
    var v = [];
    for(var i = 0;i<$scope.uniqueDateOrders.length;i++){
        var el = {x:$scope.uniqueDateOrders[i],y:0}
        for(var y = 0;y<$scope.orders.length;y++){
            if($scope.orders[y].date.toDateString() == $scope.uniqueDateOrders[i].toDateString()){
                el.y += 1;
            }
        }
        v.unshift(el);
    }
    console.log(v);
    //counting each date
    //for(var y=0;y<$scope.uniqueDateOrders.length;y++){
        
    //}
    //fucntion used to show proper time 
    $scope.cleaner = (dt)=>{
        dt = dt.toDateString();
        var time = new Date(dt).getTime(),now = Date.now(),d;
        d = Math.round((now - time)/3600000)
        if(d<24){
            return "Today";
        }else if(d > 24 && d < 48){
            return "Yesterday";
        }else{
            return dt;
        }
    }
    //functions
    $scope.filterOrdersView = (dt)=>{
        dt = dt.toDateString();
        jQuery('#allOrders tr').hide();
        jQuery(`#allOrders tr[data-date="${dt}"]`).show();
        //console.log(jQuery(`#allOrders tr[data-date="${dt}"]`))

    }
    //delete orders
    $scope.deleteOrder = (i)=>{
        if(confirm(`Are you sure you want to delete ${$scope.orders[i].name}'s order?`)){
            $scope.db.orders.delete($scope.orders[i].id)
            .then(()=>{
                $scope.db.orders.toArray()
                .then(data=>{
                    $scope.orders = data;
                    $scope.$apply();
                    notifications.notify({type:"ok",msg:"Deleted!"})
                })
                .catch(err=>{
                    notifications.notify({type:"error",msg:`An error occured! ${err}`})
                })
            })
        }
    }
    //search
    $scope.searchOrders = (e)=>{
        var val = jQuery(e.target).val().toLowerCase();
        jQuery('#collection a').each((i,el)=>{
            el.style.display = "none";
            if(el.innerHTML.toLowerCase().indexOf(val)>-1){
                el.style.display = "block";
            }
        })
        var tr = jQuery('#allOrders tr');
        tr.each((i,el)=>{
            el.style.display = "none";
            var name = el.getElementsByTagName('td')[0].innerHTML.toLowerCase(),
            staff = el.getElementsByTagName('td')[4].innerHTML.toLowerCase(),
            items = el.getElementsByTagName('td')[1].innerText.toLowerCase(),
            price = el.getElementsByTagName('td')[2].innerHTML.toLowerCase(),
            qty = el.getElementsByTagName('td')[3].innerHTML.toLowerCase(),
            time = el.getElementsByTagName('td')[5].innerHTML.toLowerCase();
            if(name.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "block";
            }else if(staff.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "block";
            }else if(items.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "block";
            }
            else if(price.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "block";
            }else if(qty.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "block";
            }else if(time.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "block";
            }
        })
    }

    //lastly charts
    //area charts 
    var graph =  Morris.Area({
        element: 'orderChart',
        data: [
            {x: '2018-9-30',y:76},
            {x: '2018-9-29',y:28},
            {x: '2018-9-28',y:23},
            {x: '2018-9-27',y:46},
            {x: '2018-9-26',y:13},
            {x: '2018-9-25',y:23},
            {x: '2018-9-24',y:36},
            {x: '2018-9-23',y:33},
            {x: '2018-9-22',y:20},
            {x: '2018-9-21',y:23},
            {x: '2018-9-20',y:27},
            {x: '2018-9-19',y:45},
            {x: '2018-9-18',y:26},
            {x: '2018-9-17',y:102},
            {x: '2018-9-16',y:45},
            {x: '2018-9-15',y:64},
            {x: '2018-9-14',y:75},
            {x: '2018-9-13',y:98},
            {x: '2018-9-12',y:78},
            {x: '2018-9-11',y:26},
            {x: '2018-9-10',y:56},
            {x: '2018-9-9',y:26},
            {x: '2018-9-8',y:24},
            {x: '2018-9-7',y:78},
            {x: '2018-9-6',y:85},
            {x: '2018-9-5',y:50},
            {x: '2018-9-4',y:100},
            {x: '2018-9-3',y:60},
            {x: '2018-9-2',y:43},
            {x: '2018-9-1',y:33},
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
   
})