const { ipcRenderer, ipcMain } = require('electron');
var token = ipcRenderer.sendSync('get_user');

$(document).ready( function() {
    SocketConnect( function() {
        getAllData( function() {
            addDefaultContent();
            imSocket.on('add_msg_take', () => {
                var indexElDef = $('.body_msg_users').find('.selected').index();
                addDefaultBodyChat(indexElDef);
            })    
        });
    });
});

$('.close_index_button').click( function() {
    ipcRenderer.send('close');
});

$('.user_block').click( function() {
    ipcRenderer.send('delet_user');
});

$('.body_msg_add_button_toggle').click( function() {
    $('.add_box').fadeToggle('fast', function() {
        $('#add_user').focus();
    });
    $('.body_msg_add_button_in').toggleClass('selected');
});

$('.add_box_header_go').on('click', function() {
    var text = $('#add_user').val();
    socketPost('messenger', 'cheack_users', {
        data: text,
    }, function(data) {
        if(data != 'error') {
            $('.add_box_body').empty();
            data.forEach((element) => {
                var templateText = function() {/*
                    <div class="add_box_body_line" data='%data%'>
                        <div class="add_box_body_line_img">
                            <img src="%img%" alt="">
                        </div>
                        <span>%name% %last_name%</span>
                    </div>
                */}.toString().slice(15, -3);
                templateText = templateText.replace(new RegExp("%data%", 'g'), element._id);
                if(element.img == null) {
                    element.img = './assets/img/default_user.png';
                }
                templateText = templateText.replace(new RegExp("%img%", 'g'), element.img);
                templateText = templateText.replace(new RegExp("%name%", 'g'), element.name);
                templateText = templateText.replace(new RegExp("%last_name%", 'g'), element.last_name);
                $('.add_box_body').append(templateText);
            });
            $('.add_box_body_line').click( function() {
                var dataText = $(this).attr('data');
                socketPost('messenger', 'add_user_msg', {
                    userId: dataText,
                    token: token,
                }, function(data) {
                    if(data == 'ok') {
                        $('.add_box').fadeOut('fast');
                        getAllData( function() {
                            addDefaultContent();
                        });
                    }
                });
            })
        } else {
            alertText('Пользователи не найдены...');
        }
    });
})

var imSocket = null;
var im_socket_server_to_connect = "";

function SocketConnect(callback) {
    delete imSocket;
    imSocket = null;
    im_socket_server_to_connect = global_data.data_url_localhost;
    imSocket = io.connect(im_socket_server_to_connect, { query: 'token=' + token });

    imSocket.on('connect', function() {
        callback();
    });    
}

function getAllData(callback) {
    socketPost('messenger', 'get_all_data', {
        token: token,
    }, function(data) {
        if(data == 'error') {
            ipcRenderer.send('delet_user');
        } else {
            global_use = data;
            var nameSimvol = data.user.name.slice(0, 1);
            if(global_use.user.img == null) 
            {
                $('.user_block').empty();
                $('.user_block').append('<span>' + nameSimvol + '</span>');
            }
            callback();
        }
        
    });
}

function addDefaultContent() {
    addDefaultLeftMenu( function(data) {
        addDefaultBodyChat(0);
        clickUserLine();
    });
}

function addDefaultLeftMenu(callback) 
{
    $('.body_msg_users').empty();
    var asyncFor = new Promise((resolve, reject) => 
    { 
        global_use.user.friends.forEach((element, index, array) => 
        {
            var templateText = function() {/*
                <div class="user_line" data="%user_id%">
                    <div class="user_line_img">
                        <img src="%img%" alt="">
                    </div>
                    <div class="user_line_text">
                        <h1>%name% %last_name%</h1>
                        <span>%close_msg%</span>
                    </div>
                </div>
            */}.toString().slice(15, -3);

            socketPost('messenger', 'get_line_data', {
                userId: element.id,
                chatId: element.chatId,
            }, function(data) {
                if(data.img == null) {
                    data.img = './assets/img/default_user.png'
                }
                templateText = templateText.replace(new RegExp("%user_id%", 'g'), element.chatId);
                if(!data.user.img) 
                {
                    data.user.img = 'assets/img/default_user.png';
                }
                templateText = templateText.replace(new RegExp("%img%", 'g'), data.user.img);
                templateText = templateText.replace(new RegExp("%name%", 'g'), data.user.name);
                templateText = templateText.replace(new RegExp("%last_name%", 'g'), data.user.last_name);
                templateText = templateText.replace(new RegExp("%close_msg%", 'g'), truncate(data.last_message, 25));
                $('.body_msg_users').append(templateText);
                if (index === array.length -1) resolve();
            })
        })
    });

    asyncFor.then(() => {
        callback();
    })
}

var not_me = null;

function addDefaultBodyChat(number) 
{
    $('.body_chat_msgs_in').empty();
    var element = $('.user_line:eq('+ number +')');
    $('.user_line').removeClass('selected');
    element.addClass('selected');
    var elementId = element.attr('data');
    not_me  = elementId;

    socketPost('messenger', 'get_messages', {
        id: elementId,
    }, function(data) {

        $('.chat_info_block_in span').html(element.find('.user_line_text h1').html());

        data.forEach(msg => {
    
            var notMyMsg = function() {/*
                <div class="msg_line">
                    <div class="msg_line_user">
                        <img src="%img%" alt="">
                    </div>
                    <div class="msg_line_text">
                        <span>%text%</span>
                    </div>
                </div>  
            */}.toString().slice(15, -3);
            
            var myMsg = function() {/*
                <div class="msg_line_me">
                    <div class="msg_line_user">
                        <img src="%img%" alt="">
                    </div>
                    <div class="msg_line_text">
                        <span>%text%</span>
                    </div>
                </div>
            */}.toString().slice(15, -3);
    
            if(msg.from == global_use.user.userId) {
                if(typeof msg.photo != "undefined") {
                    msg.message = '<img src="'+ data_img +''+msg.from+'/img/'+msg.photo+'" alt="">';
                }
                var imgPut = './assets/img/default_user.png';
                myMsg = myMsg.replace(new RegExp("%text%", 'g'), msg.message);
                if(global_use.user.img != null) 
                {
                    imgPut = global_use.user.img;
                }
                myMsg = myMsg.replace(new RegExp("%img%", 'g'), imgPut);
                $('.body_chat_msgs_in').append(myMsg);
                
            } else {
                if(typeof msg.photo != "undefined") {
                    msg.message = '<img src="'+ data_img +''+msg.from+'/img/'+msg.photo+'" alt="">';
                }
                var imgPut = './assets/img/default_user.png';
                notMyMsg = notMyMsg.replace(new RegExp("%text%", 'g'), msg.message);
                notMyMsg = notMyMsg.replace(new RegExp("%img%", 'g'), imgPut);
                $('.body_chat_msgs_in').append(notMyMsg);
            }
        });
    
        var imgPutHead = './assets/img/default_user.png';
        var templateText = function() {/*
            <img src="%img%" alt="">
        */}.toString().slice(15, -3);
        templateText = templateText.replace(new RegExp("%img%", 'g'), imgPutHead);
        $('.info_block_img span').html(templateText);
    
        $('.info_block_header_text h1').html(element.find('.user_line_text h1').html());
        
        scroolBottom();
    })

}



$('.add_msg_input').click( function() {
    addMsgGo();
})

$('#header_input').on('keydown', function(e) {
    if (e.keyCode === 13) {
        addMsgGo();
    }
})


function addMsgGo() {
    if(not_me != null) {
        var msg = $('#header_input').val();
        if(msg.length > 0) {
            $('#header_input').val('');
            var eqLine = $('.user_line[data="'+ not_me +'"]').index();
            imSocket.emit('msg', {
                token: token,
                chatId: not_me,
                text: msg,
            }, function(data) {
                if(data == 'ok') {
                    updateMsgs(eqLine);
                }
            });
        }
    }
}

function updateMsgs(eqLine) {
    addDefaultBodyChat(eqLine);
    scroolBottom();
}

function scroolBottom() {
    var div = $(".body_chat_msgs_in");
    div.scrollTop(div.prop('scrollHeight'));
}

function clickUserLine() {
    $('.user_line').click( function() {
        var eq = $(this).index();
        addDefaultBodyChat(eq);
    })
}

$('.add_img_input').click(function() {
    $('#input_img')[0].click();
});

$('#input_img').on('change', function() {
    if(typeof $(this)[0].files[0] != 'undefined') {
        if(not_me) {
            socketPost('messenger', 'add_photo_chat', {
                photo: $(this)[0].files[0],
                token: token,
                chatId: not_me,
                type: $(this)[0].files[0].type,
            }, function(data) {
                if(data == 'ok') {
                    var eqLine = $('.user_line[data="'+ not_me +'"]').index();
                    updateMsgs(eqLine);
                    $('#input_img').val('');
                    scroolBottom();
                } else {
                    alertText('Ошибка отправки фото');
                }
            })
        }
    };
})

