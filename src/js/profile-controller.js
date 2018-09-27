app.controller('profileCtr',($scope)=>{
    jQuery('#Image').click(()=>{
        document.querySelector('#profileImg').click();
    })
    //process image
    document.querySelector('#profileImg').onchange = function(e){
        var img = document.querySelector('#Image'),
        url = URL.createObjectURL(e.target.files[0]);
        img.src = url;
        console.log(typeof e.target.files[0])
    }
    //updating users
    $scope.updateUser = ()=>{
        var img = document.querySelector('#profileImg').files[0],blob;
        if(typeof img !== 'object'){
            blob = new Blob([img],{type:img.type})
            $scope.currentUser.img_url = blob;
        }
        $scope.db.users.put($scope.currentUser)
        .then(()=>{
           notifications.notify({msg:"Updated!",type:"ok"})
        })
    }
})