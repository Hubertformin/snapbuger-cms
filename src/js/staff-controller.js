app.controller("staffCtr", ($scope) => {
    $scope.fetchAndComputeStaffs = ()=>{
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
             $scope.totalSalary = 0;
            $scope.staffs.forEach(el=>{
                 $scope.totalSalary += Number(el.salary);
            })
             $scope.$apply();
            })
            .catch(()=>{
                notifications.notify({title:"Unknow error",msg:"Unable to get list of users",type:"error"})
            })
    }
    $scope.fetchAndComputeStaffs();
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
    //
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
        //and exception might occur in user inputs number with multiple dots
        try{
            if (typeof $scope.staff_name == 'undefined' ||
            typeof $scope.staff_password == 'undefined' ||
            typeof $scope.staff_position == 'undefined' ||
            inputDate == '' || typeof $scope.staff_salary == 'undefined') {
            notifications.notify({
                title:"Invalid values",
                type: "error",
                msg: "Please fill all fields!"
            })
            return false;
            }
        }
        catch(e){
         console.log(e);   
        }
        if(typeof $scope.staff_name !== 'string' || $scope.staff_name == ''){
            notifications.notify({
                title:"Invalid value",
                type: "error",
                msg: "Please insert a valid name"
            })
            return;
        }
        //individually checking values
        if(typeof $scope.staff_password !== 'string' || $scope.staff_password == ''){
            notifications.notify({
                title:"Invalid value",
                type: "error",
                msg: "Please insert a password"
            })
            return;
        }
        if(typeof $scope.staff_position !== 'string' || $scope.staff_position == ''){
            notifications.notify({
                title:"Invalid value",
                type: "error",
                msg: "Please insert user's position"
            })
            return;
        }
        if(typeof inputDate !== 'string' || inputDate == ''){
            notifications.notify({
                title:"Invalid value",
                type: "error",
                msg: "Please select start date"
            })
            return;
        }
        if(typeof $scope.staff_salary !== 'number' || $scope.staff_salary == ''){
            notifications.notify({
                title:"Invalid value",
                type: "error",
                msg: "Please insert a valid salary"
            })
            return;
        }
        //lets check if username exist
        /*for(var i=0;i<$scope.users.length;i++){
            if($scope.users[i].name.toLowerCase() === $scope.staff_name.toLowerCase()){
                notifications.notify({
                    title:"Failed!",
                    type: "error",
                    msg: "Username already in use, choose another name!"
                })
                return false;
            }
        }*/
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
            notifications.notify({title:"Complete",type:'ok', msg: "Acount Created!"})
            $scope.fetchAndComputeStaffs()
        })
        .catch(e=>{
            notifications.notify({
                type:"error",
                title:"Unable to create user",
                msg:"Creating staff failed, please make sure the name doesn't already exist!"
            },9000)
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
                notifications.notify({title:"Unknow error",msg:"Unable to refresh users",type:"error"})
            })
            
        })
        .catch(err=>{
            notifications.notify({
                title:"Failed to update staff",
                msg:"Unable to update staff,please make sure the name doesn't already exist",
                type:"error"})
        },9000)
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
                    notifications.notify({title:"Unknow error",msg:"An error occured: Unable to refresh",type:"error"})
                })
                
            })
            .catch(err=>{
                notifications.notify({title:"Unknow error",msg:"Unable to delete staff",type:"error"})
            })
        }
    }
    $scope.deleteMgr = (i) => {
        if(confirm(`Are you sure you want to delete ${$scope.managers[i].name}'s Account?`)){
            $scope.db.users.delete($scope.managers[i].id)
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
        jQuery('#closeLoginBtn').fadeIn();
        jQuery("#createMgrBtn2").show();
        jQuery("#createMgrBtn1").hide();
        jQuery('#managerial').show(); 
    }
    //
    let i = 0;
    jQuery("#createMgrBtn2").on('click',()=>{
        console.log(i+=1)
        $scope.createManagerFxn(false);
    })
    //cancel
    jQuery('#closeLoginBtn').on('click',()=>{
        jQuery('#managerial').hide();
        jQuery('#closeLoginBtn').fadeOut();
    })
})