app.controller('settingsCtr',($scope)=>{
    //getting db
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
    }).then(() => {
        //getting system printers
        ipcRenderer.on('list_printers', (event, arg) => {
            $scope.systemPrinters = arg;
            //checking settings
            if(typeof $scope.settings.defaultPrinter === "undefined") {
                $scope.settings.defaultPrinter = arg.filter(el => {
                    return el.isDefault === true;
                })[0].name;
                //save
                $scope.updateSettings();
                $scope.$apply();
            }

        });
        ipcRenderer.send('get_list_printers');
    });

    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#settingsLink').addClass('active');
    //the time picker ..

    //on change of to and from inputs
    jQuery('#orders_from').change(()=>{
        $scope.settings.time_range.from = jQuery('#orders_from').val();
        $scope.updateSettings();
    })
    jQuery('#orders_to').change(()=>{
        $scope.settings.time_range.to = jQuery('#orders_to').val();
        $scope.updateSettings();
    })

    //function to update settings
    $scope.updateSettings = ()=>{
        //now updating to database
        console.log($scope.settings);
        $scope.db.settings.put($scope.settings)
            .then(()=>{
                $scope.db.settings.get(1)
                    .then(res=>{
                        $scope.settings = res;
                        Status.insertRight(($scope.settings.hostComputer)?`<i class="material-icons blue-text">wifi_tethering</i> Host server running.`:`<i class="material-icons blue-text">nature</i> Peer computer.`);;
                        $scope.$apply();
                    })
            })
    };

});