app.controller("staffCtr", ($scope) => {
    //initialiing ...
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {
        dismissible: false,
        preventScrolling: true
    });
    //collapseible
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {
        accordion: false
    });
    //date picker
    let currentDate = new Date();
    var thisYear = currentDate.getFullYear();
    //console.log($scope.today);
    var elems = document.querySelectorAll('.datepicker');
    var instances = M.Datepicker.init(elems, {
        format: 'dd/mm/yyyy',
        minDate: currentDate,
        defaultDate: currentDate,
        yearRange: [thisYear, thisYear + 2]
    });
    //create staff
    jQuery('#createStaffsForm').on('submit', (e) => {
        e.preventDefault();
        var inputDate = jQuery('#startDate').val();
        if (typeof $scope.staff_name == 'undefined' ||
            typeof $scope.staff_password == 'undefined' ||
            typeof $scope.staff_position == 'undefined' ||
            inputDate == '' || typeof $scope.staff_salary == 'undefined') {
            notifications.notify({
                type: "error",
                msg: "Please fill all fields!"
            })
            return false;
        }
        $scope.staffs.push({
            name: $scope.staff_name,
            password: $scope.staff_password,
            position: $scope.staff_position,
            startDate: inputDate,
            salary: $scope.staff_salary,
            status: "active",
            is_mgr: false
        })
        notifications.notify({
            type: 1,
            msg: "Acount Created!"
        })
        //re initializing users
        $scope.users = $scope.staffs.concat($scope.managers)
        $scope.$apply();
        //console.log($scope.users)
    })
    //update staffs
    $scope.updateStaffs = (i) => {
        console.log($scope.staffs)
    }
    //delete staffs
    $scope.deleteStaffs = (i) => {
        if(confirm(`Are you sure you want to delete '${$scope.staffs[i].name}'?`)){
            $scope.staffs.splice(i, 1);
            //re initializing users
            $scope.users = $scope.staffs.concat($scope.managers)
            //$scope.$apply()
        }
    }
})