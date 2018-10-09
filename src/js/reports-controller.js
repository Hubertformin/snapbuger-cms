app.controller('reportsCtr',($scope)=>{
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#reportsLink').addClass('active');
    //and now preview default active tab
    jQuery('.nav-tabs li').on('click',(e)=>{
        var data = jQuery(e.target).data("target");
        jQuery('.nav-tabs li').removeClass('active');
        jQuery('.tab-prev').hide("fast");
        jQuery(e.target).addClass("active");
        jQuery(data).fadeIn("fast");
    })
    //refetcing orders
    $scope.graph;$scope.uniqueDateOrders = [];$scope.graphData = {x:[],y:[]};
    $scope.db.orders.toArray()
   .then((data)=>{
        $scope.uniqueDateOrders = [];
        $scope.orders = data;
        $scope.orders.sort(function(a,b){
            return (a.id < b.id)?1:((b.id < a.id)? -1:0);
        });
        for(var i = 0;i<$scope.orders.length;i++){
            //$scope.orders[i].date = toDate($scope.orders[i].date)
            if(i>0 && toDate($scope.orders[i-1].date) == toDate($scope.orders[i].date)){
                continue;
            }
            $scope.uniqueDateOrders.push($scope.orders[i].date)
        }
        //plotting graph
        var i = ($scope.uniqueDateOrders.length>30)?(Math.floor($scope.uniqueDateOrders.length/30)*30)-1 : 0;
        for(i;i<$scope.uniqueDateOrders.length;i++){
            $scope.graphData.x.unshift($scope.cleaner($scope.uniqueDateOrders[i]));
            let counter = 0;
            for(var y = 0;y<$scope.orders.length;y++){
                if($scope.orders[y].date.toDateString() == $scope.uniqueDateOrders[i].toDateString()){
                    counter += 1;
                }
            }
            $scope.graphData.y.unshift(counter);
        }
        //area charts 
        var ctx = document.getElementById('orderChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
            labels:$scope.graphData.x,
            datasets: [{
                label: "Orders",
                backgroundColor: 'rgba(255, 99, 132,0.6)',
                borderColor: 'rgb(255, 99, 132)',
                data:$scope.graphData.y,
            }]
            },

            // Configuration options go here
            options: {}
        });
        //
        $scope.$apply();
   })
   //Instantiating
   $('select').formSelect();
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
        return `${time.getDate()}/${time.getMonth()+1}/${time.getFullYear()}-${hour}:${min}`;
    }
    //for date display array, first we reverse sort
    function toDate(dt){
        return new Date(dt).toDateString();
    }
    function toGraphDate(dt){
        var dte = new Date(dt);
        return `${dte.getFullYear()}-${dte.getMonth()+1}-${dte.getDate()}`
    }
    //cleaner function that formats date and show it in the left pane of the orders table
    $scope.cleaner = (dt)=>{
        dt = dt.toDateString();
        var time = new Date(dt).getTime(),now = Date.now(),d;
        d = Math.round((now - time)/3600000)
        if(d<24){
            return "Today";
        }else if(d >= 24 && d < 48){
            return "Yesterday";
        }else{
            return dt;
        }
    }
    //function, used to show the corresponding date orders when date on left pane is clicked
    $scope.filterOrdersView = (dt)=>{
        jQuery('#collection a').on('click',(e)=>{
            jQuery('#collection a').removeClass('active');
            jQuery(e.target).addClass('active');

        })
        dt = dt.toDateString();
        jQuery('#allOrders tr').hide();
        jQuery(`#allOrders tr[data-date="${dt}"]`).show();
        //console.log(jQuery(`#allOrders tr[data-date="${dt}"]`))

    }
    //count orders in specific dates
    $scope.countDateOrders = (dt)=>{
        var n = 0;
        for(var x = 0;x<$scope.orders.length;x++){
            if($scope.orders[x].date.toDateString() == dt.toDateString()){
                n += 1;
            }
        }
        return n;
    }
    //delete orders
    $scope.deleteOrder = (i)=>{
        if(confirm(`Are you sure you want to delete order: ${$scope.orders[i].inv}?`)){
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
                el.style.display = "table-row";
            }else if(staff.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "table-row";
            }else if(items.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "table-row";
            }
            else if(price.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "table-row";
            }else if(qty.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "table-row";
            }else if(time.indexOf(val)>-1){
                jQuery('#collection a').show();
                el.style.display = "table-row";
            }
        })
    }
    //round up function
    $scope.roundUp = (num) => {
        return Math.round(num);
    }
    //lastly charts
    //creating graph data
//update graph
$scope.updateGraph = ()=>{
    //empty and repass variables into the graph
    $scope.graphData = [];
    var i = ($scope.orders.length>30)?$scope.orders.length-31:0;
    for(i = 0;i<$scope.uniqueDateOrders.length;i++){
        var el = {x:toGraphDate($scope.uniqueDateOrders[i]),y:0}
        for(var y = 0;y<$scope.orders.length;y++){
            if($scope.orders[y].date.toDateString() == $scope.uniqueDateOrders[i].toDateString()){
                el.y += 1;
            }
        }
        $scope.graphData.push(el);
    }
    $scope.graph.setData($scope.graphData)
}
//setInterval($scope.updateGraph,6000);
//===================== LOGS ==============
//1.Plotting the curve
var ctx = document.getElementById("logsChart").getContext('2d');
var barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Quantity ordered',
            data: [],
            backgroundColor: getRandomColor(),
            borderWidth: 0.5
        }]
    }
});
var ctx = document.getElementById("logsPieChart").getContext('2d');
var pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            label: 'Quantity ordered',
            data: [],
            backgroundColor: getRandomColor(),
            borderWidth: 0.5
        }]
    },
    options: {
        angleLines:{
            display:true,
            color:'rgba(0, 0, 0, 0.6)'
        }
    }
});
function getRandomColor(num = 1) {
    var letters = '0123456789ABCDEF',counter = 0,colors = [],
    color = '#';
    do{
        color = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.7)`
        counter++;
        colors.push(color)
    }
    while(counter < num);
    return colors;
}
//init..
$scope.logsCurrentOrders = [],$scope.logsAllItems = [],$scope.logTotalPrice = 0;$scope.barData = {x:[],y:[]};
//logs dunction
$scope.logsController = (dt)=>{
    //1. hide overview container
    $scope.hideOverviewContainer = true;
    $scope.displayDate = $scope.cleaner(dt);
    //re emptying
    $scope.logsCurrentOrders = [];$scope.logsAllItems = [];$scope.itemNames = [];$scope.logTotalPrice = 0;
    $scope.logTotalQty = 0;
    //1.first get all orders of this date
    $scope.orders.forEach(el=>{
        if(el.date.toDateString() == dt.toDateString()){
            $scope.logsCurrentOrders.push(el);
            el.items.forEach(ele=>{    
                $scope.logsAllItems.push(ele);
                $scope.logTotalQty += Number(ele.quantity);
                $scope.itemNames.push(ele.inv);
                $scope.logTotalPrice += Number(ele.price);
            })
        }
    })
    //2. getting unique items
    $scope.uniqueItems = [];
    $scope.itemNames.sort();
    for(let i = 0;i<$scope.itemNames.length;i++){
        if(i > 0 && $scope.itemNames[i-1] == $scope.itemNames[i]){
            continue;
        }
        $scope.uniqueItems.push($scope.itemNames[i]);
    }
    //3. generating data
    $scope.barData = {x:[],y:[]}
    for(let i = 0;i<$scope.uniqueItems.length;i++){
        $scope.barData.x.push($scope.uniqueItems[i]);
        let counter = 0;
        for(let j =0;j<$scope.logsAllItems.length;j++){
            if($scope.uniqueItems[i] == $scope.logsAllItems[j].name){
                counter += Number($scope.logsAllItems[j].quantity);
            }
        }
        $scope.barData.y.push(counter);

    }
    barChart.config.data = {
        labels: $scope.barData.x,
        datasets: [{
            label: 'Quantity ordered',
            data: $scope.barData.y,
            backgroundColor: getRandomColor($scope.barData.x.length),
            borderWidth: 0.5
        }]
    }
    barChart.update();
    pieChart.config.data = {
        labels: $scope.barData.x,
        datasets: [{
            label: 'Quantity ordered',
            data: $scope.barData.y,
            backgroundColor: getRandomColor($scope.barData.x.length),
            borderWidth: 0.5
        }]
    }
    pieChart.update();
}
//function to show overview 
$scope.showOverview = ()=>{
    //1. show overview container
    $scope.hideOverviewContainer = false;
}


})