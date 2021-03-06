var global_use = new Array();

const global_data = {
    data_url_localhost: 'http://localhost:3000'
    //data_url_localhost: 'http://192.168.0.13:3000'
}

var data_img = "http://localhost/server/users/";
//data_img = "http://192.168.0.13/users/";


//========= Cookies ===================================================================

function deleteAllCookies() {

    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    location.reload();
}

function delCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    location.reload();
}

function getCookie(name) {

    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));

}

function setCookie(name, value, days, path) {
    
    path = path || '/';
    days = days || 10;

    var last_date = new Date();
    last_date.setDate(last_date.getDate() + days);
    var value = escape(value) + ((days==null) ? "" : "; expires="+last_date.toUTCString());
    document.cookie = name + "=" + value + "; path=" + path; // вешаем куки
}

function $_GET(key) {

    var s = window.location.search;
    s = s.match(new RegExp(key + '=([^&=]+)'));
    return s ? s[1] : false;

}


//======== mains ======================================================================

function updateURL(url) {
    if (history.pushState) {
        var baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        var newUrl = baseUrl + '?' + url;
        history.pushState(null, null, newUrl);
    }
    else {
        console.warn('History API не поддерживается');
    }
}

function truncate(input, num) {
    if (input.length > num)
       return input.substring(0,num) + '...';
    else
       return input;
};

function socketPost(param, action, data, callback) {
    data = data || {};
    imSocket.emit(param, {
        action:action,
        data:data
    },function(response){
        if(callback) callback(response);
    });
}

function checkToken(callback) {
    var token = getCookie('token');
    if(token) {
        callback();
    } else {
        showRegBlock();
    }
}

function alertText(data) {
    var templateText = function() {/*
        <div class="alert_text">
            <div class="alert_text_in">
                <span>%text%</span>
            </div>
        </div>
    */}.toString().slice(15, -3);
    templateText = templateText.replace(new RegExp("%text%", 'g'), data);
    $("body").append(templateText);
    var heightBlock = $('.alert_text').height();
    $('.alert_text').css({
        "display": "block",
        "top": "-" + heightBlock,
    }).animate({
        "top": '20px',
    }, 1000, function() {
        setTimeout( function() {
            $('.alert_text').animate({
                "top": "-" + heightBlock,
            }, 1000, function() {
                $(this).remove();
            });
        }, 2000)
    });
}



