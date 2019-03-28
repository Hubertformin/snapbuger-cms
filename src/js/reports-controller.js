app.controller('reportsCtr',($scope)=>{
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#reportsLink').addClass('active');
})