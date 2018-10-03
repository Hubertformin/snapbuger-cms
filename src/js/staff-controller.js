app.controller("staffCtr", ($scope) => {
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#staffLink').addClass('active');
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
    //==================== FUNCTIONS =============
    //compute total of salaries
    $scope.computeSalary = ()=>{
        $scope.totalSalary = 0;
         $scope.staffs.forEach(el=>{
            $scope.totalSalary += Number(el.salary);
        })
    }
    $scope.computeSalary();
    //date picker to date string
    $scope.formatDatePicker = (dt)=>{
        const od = dt.split("/");
        var nd = new Date(`${od[1]}/${od[0]}/${od[2]}`);
        return nd.toDateString();
    }
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
        //lets check if username exist
        for(var i=0;i<$scope.users.length;i++){
            if($scope.users[i].name.toLowerCase() === $scope.staff_name.toLowerCase()){
                notifications.notify({
                    type: "error",
                    msg: "Username already in use, choose another name!"
                })
                return false;
            }
        }
        //now changing username to pascal case and converting number to number
        $scope.staff_name = $scope.staff_name[0].toUpperCase()+$scope.staff_name.slice(1).toLowerCase();
        $scope.staff_salary = Number($scope.staff_salary);
        //adding to database
        $scope.db.users.add({
            name: $scope.staff_name,
            password: $scope.staff_password,
            position: $scope.staff_position,
            startDate: inputDate,
            salary: $scope.staff_salary,
            status: "active",
            is_mgr: false,
            img_url:'img/user-grey.png'
        })
        .then(()=>{
            notifications.notify({type: 1, msg: "Acount Created!"})
            $scope.db.users.toArray()
            .then((data)=>{
                $scope.managers = [],$scope.staffs = [];
                $scope.users = data;
                $scope.users.forEach(element => {
                 if (element.is_mgr) {
                     $scope.managers.push(element);
                 } else {
                     $scope.staffs.push(element)
                 }
             });
             $scope.staff_name = "";$scope.staff_password = "";$scope.staff_position = "";$scope.staff_salary = "";
             $scope.computeSalary();
             $scope.$apply();
            })
            .catch(()=>{
                notifications.notify({msg:"An error occured: Unable to refetch!",type:"error"})
            })
            
        })
    })
    //update staffs
    $scope.updateStaffs = (i) => {
        $scope.db.users.put($scope.staffs[i])
        .then(()=>{
            $scope.db.users.toArray()
            .then((data)=>{
                $scope.managers = [],$scope.staffs = []
                $scope.users = data;
                $scope.users.forEach(element => {
                 if (element.is_mgr) {
                     $scope.managers.push(element);
                 } else {
                     $scope.staffs.push(element)
                 }
             });
             $scope.$apply();
            })
            .catch(()=>{
                notifications.notify({msg:"An error occured: Unable to refetch!",type:"error"})
            })
            
        })
    }
    //delete staffs
    $scope.deleteStaffs = (i) => {
        if(confirm(`Are you sure you want to delete ${$scope.staffs[i].name}'s Account?`)){
            $scope.db.users.delete($scope.staffs[i].id)
            .then(()=>{
                $scope.db.users.toArray()
                .then((data)=>{
                    $scope.managers = [],$scope.staffs = []
                    $scope.users = data;
                    $scope.users.forEach(element => {
                     if (element.is_mgr) {
                         $scope.managers.push(element);
                     } else {
                         $scope.staffs.push(element)
                     }
                 });
                 $scope.$apply();
                })
                .catch(()=>{
                    notifications.notify({msg:"An error occured: Unable to refetch!",type:"error"})
                })
                
            })
        }
    }
    //create Manager
    $scope.createmanager = ()=>{
        jQuery('#managerial').css({display:"block"})
        console.log(jQuery('#managerial'));
    }
})