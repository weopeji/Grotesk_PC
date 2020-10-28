function socketPost(param, action, data, callback) {
    data = data || {};
    imSocket.emit(param, {
        action:action,
        data:data
    },function(response){
        if(callback) callback(response);
    });
}

const global_data = {
    data_url_localhost: 'http://localhost:3000'
}
var imSocket = null;
var im_socket_server_to_connect = "";


imSocket = null;
im_socket_server_to_connect = global_data.data_url_localhost;
imSocket = io.connect(im_socket_server_to_connect);
imSocket.on('connect', function() {
    console.log('Connecting to host...');
});


const { ipcRenderer, ipcMain } = require('electron');

$('.close_button').click( function() {
    ipcRenderer.send('close');
})

$('.reg_on').click( function() {
    $('.index_body_default').fadeOut( function() {
        $('.index_body_registration').fadeIn();
    })
})

$('.buttons_login_on').click( function() {
    $('.index_body_default').fadeOut( function() {
        $('.index_body_login').fadeIn();
    })
})

var cheack = 0;
var onePusk = 0;

$('#go_reg').click( function() {
    var phone           = $('#reg_phone').val();
    var name            = $('#reg_name').val();
    var last_name       = $('#reg_last_name').val();
    var password        = null;
    var password_again  = null;
    if(cheack == 0) {
        var err = false;
        if(phone.length == 0 || name.length == 0 || last_name.length == 0) {
            err = true;
        }
        if(err == true) {
            return;
        } else {
            $('.first_reg').fadeOut( function() {
                $('.second_reg').fadeIn( function() {
                    cheack = cheack + 1;
                })
            })
        }
    } else {

        password        = $('#reg_password').val();
        password_again  = $('#reg_password_again').val();

        if(password.length < 6) {
            return;
        } 
        if(password != password_again) {
            return;
        }

        $('.index_body_registration').fadeOut( function() {
            $('.preloader_reg').fadeIn( function() {
                if(onePusk == 0) {
                    socketPost('registration_page', 'registration', {
                        phone: phone,
                        password: password,
                        name: name,
                        last_name: last_name,
                    }, function(data) {
                        if(typeof data.userId != undefined) {
                            socketPost('registration_page', 'auth', {
                                phone: phone,
                                password: password,
                            }, function(data) {
                                if(typeof data.accessToken != undefined) {
                                    ipcRenderer.send('add_user', data.accessToken);
                                    ipcRenderer.send('auth_go');
                                } else {

                                }
                            })
                        } else {

                        }
                    })
                } else {
                    onePusk = 1;
                }
            })
        })

        
        
    }
    
})


$('#go_auth_now').click( function() {
    var phone           = $('#auth_phone').val();
    var password        = $('#auth_password').val();

    socketPost('registration_page', 'auth', {
        phone: phone,
        password: password,
    }, function(data) {
        if(typeof data.accessToken != undefined) {
            ipcRenderer.send('add_user', data.accessToken);
            ipcRenderer.send('auth_go')
        } else {

        }
    })
})