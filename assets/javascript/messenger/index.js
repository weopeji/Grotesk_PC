const { ipcRenderer, ipcMain } = require('electron');
var token = ipcRenderer.sendSync('get_user');

$(document).ready( function() {
    SocketConnect( function() {
        getAllData();
    });
});

$('.close_index_button').click( function() {
    ipcRenderer.send('close');
});

$('.body_msg_add_button_toggle').click( function() {
    $('.add_menu').slideToggle();
});

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

function getAllData() {
    socketPost('messenger', 'get_all_data', {
        token: token,
    }, function(data) {
        global_use = data;
        putMsgs();
        putImg();
    })
}

function putMsgs() {

    $('.body_msg_users').empty();

    var msgs = global_use.messages;

    var templateText = function() {/*
        <div class="user_line" data="%user_id%">
            <div class="user_line_img">
                <img src=".%img%" alt="">
            </div>
            <div class="user_line_text">
                <h1>%name% %last_name%</h1>
                <span>%close_msg%</span>
            </div>
        </div>
    */}.toString().slice(15, -3);

    msgs.forEach(element => {
        templateText = templateText.replace(new RegExp("%user_id%", 'g'), element.user);
        templateText = templateText.replace(new RegExp("%img%", 'g'), element.img);
        templateText = templateText.replace(new RegExp("%name%", 'g'), element.name);
        templateText = templateText.replace(new RegExp("%last_name%", 'g'), element.last_name);
        templateText = templateText.replace(new RegExp("%close_msg%", 'g'), truncate(element.messages[0].msg, 25));
        $('.body_msg_users').append(templateText);
    });

    selectFirstMsg();
}

function selectFirstMsg() {

    $('.body_chat_msgs').empty();

    var element = $('.user_line:eq(0)');
    element.addClass('selected');
    $('.body_chat').attr('data', element.attr('data'));

    global_use.messages.forEach(line => {
        if(line.user == element.attr('data')) {
            $('.chat_info_block_in span').html(line.name + ' ' + line.last_name);

            line.messages.forEach(msg => {

                var notMyMsg = function() {/*
                    <div class="msg_line">
                        <div class="msg_line_user">
                            <img src="./assets/img/YPx1-WuF0Zk.jpg" alt="">
                        </div>
                        <div class="msg_line_text">
                            <span>%text%</span>
                        </div>
                    </div>  
                */}.toString().slice(15, -3);
                
                var myMsg = function() {/*
                    <div class="msg_line_me">
                        <div class="msg_line_user">
                            <img src="./assets/img/YPx1-WuF0Zk.jpg" alt="">
                        </div>
                        <div class="msg_line_text">
                            <span>%text%</span>
                        </div>
                    </div>
                */}.toString().slice(15, -3);

                if(msg.user == global_use.user.userId) {
                    myMsg = myMsg.replace(new RegExp("%text%", 'g'), msg.msg);
                    $('.body_chat_msgs').append(myMsg);
                } else {
                    notMyMsg = notMyMsg.replace(new RegExp("%text%", 'g'), msg.msg);
                    $('.body_chat_msgs').append(notMyMsg);
                }
            })
        }
    })

    scroolBottom();

    $('.add_msg_input').click( function() {
        var msg     = $('.chat_input input').val();
        var not_me  = $('.body_chat').attr('data');
        $('.chat_input input').val('');

        imSocket.emit('msg', {
            token: token,
            not_me: not_me,
            text: msg,
        },function(data){
            if(data == 'ok') {
                updateMsgs();
            }
        });

    })

}

function putImg() {
    var nameSimvol = global_use.user.name.slice(0, 1);
    if(global_use.user.img == null) {
        $('.user_block').append('<span>' + nameSimvol + '</span>');
    }
}

function updateMsgs() {

    $('.body_chat_msgs').empty();

    var data = token;

    socketPost('messenger', 'get_msgs', data, function(data) {
        global_use.messages = data;
        var useChat = $('.body_chat').attr('data');
        global_use.messages.forEach(line => {
            if(line.user == useChat) {
                line.messages.forEach(msg => {

                    var notMyMsg = function() {/*
                        <div class="msg_line">
                            <div class="msg_line_user">
                                <img src="./assets/img/YPx1-WuF0Zk.jpg" alt="">
                            </div>
                            <div class="msg_line_text">
                                <span>%text%</span>
                            </div>
                        </div>  
                    */}.toString().slice(15, -3);
                    
                    var myMsg = function() {/*
                        <div class="msg_line_me">
                            <div class="msg_line_user">
                                <img src="./assets/img/YPx1-WuF0Zk.jpg" alt="">
                            </div>
                            <div class="msg_line_text">
                                <span>%text%</span>
                            </div>
                        </div>
                    */}.toString().slice(15, -3);

                    if(msg.user == global_use.user.userId) {
                        myMsg = myMsg.replace(new RegExp("%text%", 'g'), msg.msg);
                        $('.body_chat_msgs').append(myMsg);
                    } else {
                        notMyMsg = notMyMsg.replace(new RegExp("%text%", 'g'), msg.msg);
                        $('.body_chat_msgs').append(notMyMsg);
                    }
                    
                })
            }
        })

        scroolBottom();
    })
}

function scroolBottom() {
    var div = $(".body_chat_msgs");
    div.scrollTop(div.prop('scrollHeight'));
}



