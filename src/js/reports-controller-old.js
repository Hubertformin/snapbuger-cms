app.controller('reportsCtr',($scope)=>{
    document.querySelector('canvas').addEventListener('contextmenu', (e) => {
        e.preventDefault();
        graphMenu.popup({window: remote.getCurrentWindow()})
      }, false);
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#reportsLink').addClass('active');

    //loaders
    jQuery('#orderChartDiv').waitMe({
        effect : 'rotateplane',
        text : 'Drawing graph ...',
        bg : 'rgba(255,255,255,1)',
        color : '#424242',
        maxSize : '',
        waitTime : -1,
        textPos : 'vertical',
        fontSize : '',
        });

    //date instances
    var elems = document.querySelectorAll('.datepicker');
    var instances = M.Datepicker.init(elems);
    var startDatepicker = M.Datepicker.getInstance(jQuery('#startDate')),endDatepicker = M.Datepicker.getInstance(jQuery('#endDate'));
    //and now preview default active tab
    jQuery('.nav-tabs li').on('click',(e)=>{
        if(jQuery(e.target).is('li')){
            let data = jQuery(e.target).data("target");
            jQuery('.nav-tabs li').removeClass('active');
            jQuery('.tab-prev').hide("fast");
            jQuery(data).show("fast");
            jQuery(e.target).addClass("active");
        }else{
            var data = jQuery(e.target).parent().data("target");
            jQuery('.nav-tabs li').removeClass('active');
            jQuery('.tab-prev').hide("fast");
            jQuery(data).show("fast");
            jQuery(e.target).parent().addClass("active");
        }
        
    })
    //refetcing orders and withdrawals, first declare empty variables
    $scope.graph;$scope.uniqueDateOrders = [];$scope.uniqueDateWithdrawals = [];$scope.graphData = {x:[],y:[]};
    //fetcing...
    $scope.db.transaction('r',$scope.db.orders,$scope.db.withdrawals,()=>{
        $scope.db.orders.toArray()
        .then((data)=>{ 
            $scope.uniqueDateOrders = [];
            $scope.orders = data;
            $scope.orders.reverse();
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
                    backgroundColor:'rgba(237, 69, 125,0.6)',
                    borderColor:'rgb(183, 28, 28)',
                    data:$scope.graphData.y,
                }]
                },
    
                // Configuration options go here
                options: {}
            });
            jQuery('#orderChartDiv').waitMe("hide");
            //applying
            $scope.$apply();
       })
       //fetcing for withddawals
       //this is the total amount of withdrawals
       $scope.amountWithdrawals = 0;
       $scope.db.withdrawals.toArray()
       .then((data)=>{
           $scope.withdrawals = data;
           $scope.uniqueDateWithdrawals = [];
            $scope.withdrawals.reverse();
            for(var i = 0;i<$scope.withdrawals.length;i++){
                $scope.amountWithdrawals += Number($scope.withdrawals[i].amount);
                //$scope.orders[i].date = toDate($scope.orders[i].date)
                if(i>0 && toDate($scope.withdrawals[i-1].date) == toDate($scope.withdrawals[i].date)){
                    continue;
                }
                $scope.uniqueDateWithdrawals.push($scope.withdrawals[i].date);
            }
          //applying
       $scope.$apply();  
       })
       .catch(err=>{
           console.error(err);
       })
       
    })
    .then(()=>{
        instances = M.Datepicker.init(elems,{
        autoClose:true,
          minDate:$scope.uniqueDateOrders[$scope.uniqueDateOrders.length - 1],
            maxDate:$scope.uniqueDateOrders[0]
        });
        startDatepicker.options = {
            defaultDate:$scope.uniqueDateOrders[$scope.uniqueDateOrders.length - 1],
            setDefaultDate:$scope.uniqueDateOrders[$scope.uniqueDateOrders.length - 1]
        }
        endDatepicker.options = {
            defaultDate:$scope.uniqueDateOrders[0],
            setDefaultDate:$scope.uniqueDateOrders[0]
        }
        //to plot on the 'money curve'
        overviewCalculator($scope.uniqueDateOrders[$scope.uniqueDateOrders.length-1],$scope.uniqueDateOrders[0]);
        $scope.$apply();
    })
    .catch(()=>{
        notifications.notify({
            title:"Failed to fetch Database",
            msg:"Database error,possibly caused by:<br>-Failed to read database.<br>-Database was probably deleted by another application.<br>Close the app, re-open with internet connection",
            type:"error"
        })
    })
  
   //Instantiating
   $('select').formSelect();
    //var instance = M.Tabs.init(jQuery('.tabs'));
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
    //for date display array, first we reverse sort
    function toDate(dt){
        return new Date(dt).toDateString();
    }
    //cleaner function that formats date and show it in the left pane of the orders table
    $scope.cleaner = (en,type = 'string')=>{
        dt = en.toDateString();
        var time = new Date(dt).getTime(),now = Date.now(),d;
        d = Math.round((now - time)/3600000)
        if(d<24){
            return "Today";
        }else if(d >= 24 && d < 48){
            return "Yesterday";
        }else{
            //return `${en.getDate()}/${en.getMonth()+1}/${en.getFullYear()}`;
            if(type == 'string'){
                return dt;
            }else{
               return `${en.getDate()}/${en.getMonth()+1}/${en.getFullYear()}`;  
            }
            
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
    //count withdrawals in specific dates
    $scope.countDatewithdrawals = (dt)=>{
        var n = 0;
        for(var x = 0;x<$scope.withdrawals.length;x++){
            if($scope.withdrawals[x].date.toDateString() == dt.toDateString()){
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
                    notifications.notify({title:"Complete",type:"ok",msg:"Order deleted!"})
                })
                .catch(err=>{
                    notifications.notify({title:"Unknown error",type:"error",msg:`Unable to delete order`})
                })
            })
        }
    }
    //delete withdrawals
    $scope.deleteWithdrawals = (i)=>{
        if(confirm(`Are you sure you want to delete : ${$scope.withdrawals[i].inv}?`)){
            $scope.db.withdrawals.delete($scope.withdrawals[i].id)
            .then(()=>{
                $scope.db.withdrawals.toArray()
                .then(data=>{
                    $scope.withdrawals = data;
                    $scope.$apply();
                    notifications.notify({title:"Complete",type:"ok",msg:"Withdrawal deleted!"})
                })
                .catch(err=>{
                    notifications.notify({title:"Unknown error",type:"error",msg:`Unable to delete withdrawal`})
                })
            })
        }
    }
    //search
    $scope.searchOrders = (e)=>{
        let val = jQuery(e.target).val().toLowerCase();
        jQuery('#collection a').each((i,el)=>{
            el.style.display = "none";
            if(el.innerHTML.toLowerCase().indexOf(val)>-1){
                el.style.display = "block";
            }
        })
        let tr = jQuery('#allOrders tr');
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
    //withdrawala
    $scope.searchWithdrawals = (e)=>{
        var val = jQuery(e.target).val().toLowerCase();
        jQuery('#widrawalsCollection a').each((i,el)=>{
            el.style.display = "none";
            if(el.innerHTML.toLowerCase().indexOf(val)>-1){
                el.style.display = "block";
            }
        })
        var tr = jQuery('#withdrawalsTable tr');
        tr.each((i,el)=>{
            el.style.display = "none";
            var inv = el.getElementsByTagName('td')[0].innerHTML.toLowerCase(),
            staff = el.getElementsByTagName('td')[4].innerHTML.toLowerCase(),
            reason = el.getElementsByTagName('td')[1].innerText.toLowerCase(),
            price = el.getElementsByTagName('td')[2].innerHTML.toLowerCase(),
            time = el.getElementsByTagName('td')[3].innerHTML.toLowerCase();
            if(inv.indexOf(val)>-1){
                jQuery('#widrawalsCollection a').show();
                el.style.display = "table-row";
            }else if(staff.indexOf(val)>-1){
                jQuery('#widrawalsCollection a').show();
                el.style.display = "table-row";
            }else if(reason.indexOf(val)>-1){
                jQuery('#widrawalsCollection a').show();
                el.style.display = "table-row";
            }
            else if(price.indexOf(val)>-1){
                jQuery('#widrawalsCollection a').show();
                el.style.display = "table-row";
            }else if(time.indexOf(val)>-1){
                jQuery('#widrawalsCollection a').show();
                el.style.display = "table-row";
            }
        })
    }
    //round up function
    $scope.roundUp = (num) => {
        return Math.round(num);
    }
    //the withrawals, settings variables
    $scope.displayWithdrawDate = "All day";
    $scope.numWithdrawals = $scope.withdrawals.length;
    //the function
    $scope.renderInViewWithdraw = (dt)=>{
        $scope.displayWithdrawDate = $scope.cleaner(dt);
        //calculating totol widthdrawas and items
        $scope.numWithdrawals = 0,$scope.amountWithdrawals = 0;
        for(var x = 0;x<$scope.withdrawals.length;x++){
            if($scope.withdrawals[x].date.toDateString() == dt.toDateString()){
                $scope.numWithdrawals += 1;
                $scope.amountWithdrawals += Number($scope.withdrawals[x].amount);
            }
        }
        jQuery('#withdrawalsTable tr').hide();
        jQuery(`#withdrawalsTable tr[data-date='${$scope.displayWithdrawDate}']`).css({display:''});
    }
    //lastly charts
    //creating graph data
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
function getRandomColor(num = 1,alpha = 0.7) {
    var letters = '0123456789ABCDEF',counter = 0,colors = [],
    color;
    do{
        color = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${alpha})`
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
                $scope.itemNames.push(ele.name);
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
/* 
-=================================================----------- OVERVIEW ----------================================

*/
var ele = document.querySelector('#lineMoneychart');
var ctx = ele.getContext('2d');
var lineChart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
    labels:[],
    datasets: [{
        label: "ORDERS",
        backgroundColor: 'rgba(183, 28, 28,0)',
        borderWidth:2,
        borderColor:'rgb(0, 102, 102)',
        data:[],
    },{
        label: "WITHDRAWALS",
        backgroundColor: 'rgba(0, 121, 107,0)',
        borderWidth:2,
        borderColor:'rgb(27, 94, 32)',
        data:[],
    }
    ]
    },

    // Configuration options go here
    options: {}
});
//get salary
$scope.totalSalary = 0;$scope.ordersPrice = 0,$scope.withdrawalsAmount = 0;$scope.netProfit = 0;
$scope.staffs.forEach(el=>{
    $scope.totalSalary += Number(el.salary)
})
//function to show overview 
//
$scope.showOverview = ()=>{
    //1. show overview container
    $scope.hideOverviewContainer = false;
    overviewCalculator(jQuery('#startDate').val(),jQuery('#endDate').val());
    //console.log(jQuery('#startDate').val(),jQuery('#endDate').val());
}
function overviewCalculator(min,max){
    if(min == '' || max == '')return;
    var startDate = new Date(min),endDate = new Date(max), data = {x:[],orders:[],withdrawals:[]}
    if(startDate.getTime() > endDate.getTime()){
        notifications.notify({
            title:"Invalid Range",
            type:"error",
            msg:"Start date can not be greater than end date"
        },5000)
        return;
    }
    let old = startDate,interval = [],i,price,amount;
    $scope.ordersPrice = 0,$scope.withdrawalsAmount = 0;$scope.netProfit = 0;
    while(1 == 1){
        interval.push(old);
        data.x.push($scope.cleaner(old,'other'))
        if(old.toDateString() == endDate.toDateString()) break;
        old = new Date(old.getTime() + 86400000)
    }
    interval = (Math.floor(interval.length/31)>0)?interval.slice((Math.floor(interval.length/31)*31)-1):interval;
    for(i = 0;i<interval.length;i++){
        price = 0;
        $scope.orders.forEach(el=>{
            if(el.date.toDateString() == interval[i].toDateString()){
                price += el.totalPrice;
                $scope.ordersPrice += el.totalPrice;
            }
            
        })
        data.orders.push(price);
        //withdrawals
        amount = 0;
        $scope.withdrawals.forEach(el=>{
            if(el.date.toDateString() == interval[i].toDateString()){
                amount += el.amount;
                $scope.withdrawalsAmount += el.amount;
            }
            
        })
        data.withdrawals.push(amount);
    }
    //Caculate net profit  but substraction of salaries should anly bedone at end of month
    $scope.totalSalary *= Math.floor(interval.length/30);
    $scope.netProfit = $scope.ordersPrice - ($scope.withdrawalsAmount + $scope.totalSalary);
    $scope.percentageProfit = ($scope.netProfit > 0)?Math.round(($scope.netProfit/$scope.ordersPrice)*100):Math.round(($scope.netProfit/$scope.withdrawalsAmount)*100);
    $scope.percentageProfit = Math.abs($scope.percentageProfit);
    $scope.percentageProfitIcon = ($scope.netProfit > 0)?true:false;
    //console.log('o: '+$scope.netProfit+' and w: '+$scope.withdrawals+' and Total sal: '+$scope.totalSalary);
    //chart
    lineChart.config.data = {
        labels: data.x,
        datasets: [
            {
                label: 'ORDERS',
                data:data.orders,
                backgroundColor:'rgba(33, 150, 243,0.6)',
                borderColor: 'rgb(33, 150, 243)',
                borderWidth:2
            },{
                label: 'WITHDRAWALS',
                data:data.withdrawals,
                backgroundColor:'rgba(244, 67, 54,0.6)',
                borderColor:'rgb(244, 67, 54)',
                borderWidth:2
            }
       ]
    }
    lineChart.update();
    
}


})