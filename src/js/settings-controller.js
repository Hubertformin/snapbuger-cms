app.controller('settingsCtr',($scope)=>{
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#settingsLink').addClass('active');
//the time picker ..
    var elems = document.querySelectorAll('.timepicker');
    var instances = M.Timepicker.init(elems,{
        twelveHour:false
    });
    //and now lets get our specific time picker element
    /*var instance_time_from = M.Timepicker.getInstance(jQuery('#orders_from')),
    instance_time_to = M.Timepicker.getInstance(jQuery('#orders_to'));*/
    //
    jQuery('#orders_from').val($scope.settings.time_range.from);
    jQuery('#orders_to').val($scope.settings.time_range.to);
    //function to update settings
    $scope.updateSettings = (con)=>{
        if(typeof jQuery('#orders_from').val() !== 'string' || typeof jQuery('#orders_to').val() !== 'string'){
            notifications.notify({title:"Error",type:"error",msg:"Please select time properly!"})
            return false;
        }
        if(con == 'reset-default'){
            $scope.settings.time_range.from = "8:00";
            $scope.settings.time_range.to = "21:30";
            jQuery('#orders_from').val("8:00");
            jQuery('#orders_to').val("21:30");
        }else{
            $scope.settings.time_range.from = jQuery('#orders_from').val();
            $scope.settings.time_range.to = jQuery('#orders_to').val();
        }
        //now lets make sure time ranges are valid
        var from = $scope.settings.time_range.from.split(":");
        var to = $scope.settings.time_range.to.split(":");
        if(Number(from[0]) > Number(to[0]) || Number(from[0]) == Number(to[0]) && Number(from[1]) >= Number(to[1])){
            notifications.notify({title:"Invalid Time",msg:"Starting time cannot be greater than or equal to stopping time",type:"error"});
            jQuery('#orders_from').val("8:00");
            jQuery('#orders_to').val("21:30");
            return false;
        }

        //now updating to database
        $scope.db.settings.put($scope.settings)
        .then(()=>{
            $scope.db.settings.get(1)
            .then(res=>{
                $scope.settings = res;
                console.log(res)
                $scope.$apply();
            })
        })
    }
    //on change of to and from inputs
    jQuery('#orders_from').change(()=>{
        $scope.settings.time_range.from = jQuery('#orders_from').val();
        $scope.updateSettings();
    })
    jQuery('#orders_to').change(()=>{
        $scope.settings.time_range.to = jQuery('#orders_to').val();
        $scope.updateSettings();
    })

});