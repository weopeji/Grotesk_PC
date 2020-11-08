const { ipcRenderer, ipcMain } = require('electron');

$('.close_button').click( function() {
    ipcRenderer.send('close');
});

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

$('#reg_phone').on("keydown", function(e) {
    if (e.ctrlKey && e.keyCode === 65) return false;

    if (e.shiftKey && ((e.keyCode === 37 && this.selectionStart < 4) || (e.keyCode === 39 && this.selectionStart < 3)
    || e.keyCode === 38 || e.keyCode === 40)) 
    return false;

    if (e.keyCode == 46 && this.selectionStart < 2)
        return false;
    else if (e.keyCode == 8 && this.selectionStart < 3)
        return false;
});

$('#auth_phone').on("keydown", function(e) {
    if (e.ctrlKey && e.keyCode === 65) return false;

    if (e.shiftKey && ((e.keyCode === 37 && this.selectionStart < 4) || (e.keyCode === 39 && this.selectionStart < 3)
    || e.keyCode === 38 || e.keyCode === 40)) 
    return false;

    if (e.keyCode == 46 && this.selectionStart < 2)
        return false;
    else if (e.keyCode == 8 && this.selectionStart < 3)
        return false;
});

$('#go_reg').click( function() {
    var phone           = $('#reg_phone').val().replace(/\s+/g, ' ').trim();
    var name            = $('#reg_name').val().replace(/\s+/g, ' ').trim();
    var last_name       = $('#reg_last_name').val().replace(/\s+/g, ' ').trim();
    var password        = null;
    var password_again  = null;

    if(cheack == 0) {
        var err = false;
        if(phone.length != 12 || name.length == 0 || last_name.length == 0) {
            err = true;
        }
        if(err == true) {
            alertText('Заполните все поля правильно!');
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
            alertText('Пароль должен быть больше 6 символов!');
            return;
        } 
        if(password != password_again) {
            alertText('Пароли должны совпадать!');
            return;
        }

        $('.index_body_registration').fadeOut( function() {
            $('.preloader_reg').fadeIn( function() {
                socketPost('registration_page', 'registration', {
                    phone: phone,
                    password: password,
                    name: name,
                    last_name: last_name,
                }, function(data) {
                    if(typeof data.userId != "undefined") {
                        socketPost('registration_page', 'auth', {
                            phone: phone,
                            password: password,
                        }, function(data) {
                            if(typeof data.accessToken != "undefined") {
                                ipcRenderer.send('add_user', data.accessToken);
                                ipcRenderer.send('auth_go');
                            } else {

                            }
                        })
                    } else {
                        alertText('Такой пользователь существует!');
                        $('.preloader_reg').fadeOut( function() {
                            $('.second_reg').css({
                                "display":"none",
                            });
                            $('.first_reg').css({
                                'display': "block",
                            })
                            $('.index_body_registration').fadeIn( function() {
                                cheack = 0;
                            })
                        })
                    }
                })
            })
        })
    }
})


$('#go_auth_now').click( function() {
    var phone           = $('#auth_phone').val();
    var password        = $('#auth_password').val();

    if(phone.length < 1 || password < 1) {
        alertText('Заполните все поля!');
        return;
    }

    socketPost('registration_page', 'auth', {
        phone: phone,
        password: password,
    }, function(data) {
        if(typeof data.accessToken != "undefined") {
            ipcRenderer.send('add_user', data.accessToken);
            ipcRenderer.send('auth_go');
        } else {
            alertText("Такого пользователя не существует");
        }
    });
});