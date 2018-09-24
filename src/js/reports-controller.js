app.controller('reportsCtr',($scope)=>{
    var ctx = document.getElementById("myChart").getContext('2d');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: [5,10],
        options: {showLines:true}
    });
})