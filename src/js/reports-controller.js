app.controller('reportsCtr',($scope)=>{
    //var ctx = document.getElementById("myChart").getContext('2d');
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
    //date strinf
    $scope.toDate = (dt)=>{
        return new Date(dt).toDateString();
    }
})