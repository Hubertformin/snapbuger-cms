app.controller('profileCtr',($scope)=>{
    jQuery('#Image').click(()=>{
        document.querySelector('#profileImg').click();
    })
    //process image
    $scope.inputFile = false;
    document.querySelector('#profileImg').onchange = function(e){
        $scope.inputFile = true;
        var file = e.target.files[0];
        if(file.size > 400000){
            notifications.notify({type:"error",msg:"File size large, please upload a picture below 4MB"})
            return false;
        }
        var img = document.querySelector('#Image'),
        url = URL.createObjectURL(file);
        img.src = url;
    }
    //updating users
    /*jQuery('#updateUser').on('click', () => {
        var img = document.querySelector('#profileImg').files[0],blob;
        if(typeof img == 'object'){
            blob = new Blob([img],{type:img.type})
            $scope.currentUser.img_url = blob;
        }
        $scope.currentUser.name = $scope.currentUser.name[0].toUpperCase()+$scope.currentUser.name.slice(1).toLowerCase()
        $scope.db.users.put($scope.currentUser)
        .then(()=>{
            $scope.db.users.get($scope.currentUser.id)
            .then((data)=>{
                $scope.currentUser = data;
                if(typeof $scope.currentUser.img_url !== 'string'){
                    $scope.profile_pic = URL.createObjectURL($scope.currentUser.img_url);
                }else{
                    $scope.profile_pic = $scope.currentUser.img_url;
                }
                //$scope.$apply();
                notifications.notify({msg:"Updated!",type:"ok"})
            })
            
        })
    })*/
})