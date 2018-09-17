var $ = require('jquery')
const {AuthenticateUser} = require('../src/js/Backbone')
var user = new AuthenticateUser();
$('form').on('submit',(e)=>{
    e.preventDefault();
    user.login({
        user_id:$('#user').val(),
        password:$('#password').val()
    })
})
