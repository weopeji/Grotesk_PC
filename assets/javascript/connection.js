var imSocket = null;
var im_socket_server_to_connect = global_data.data_url_localhost;;
imSocket = io.connect(im_socket_server_to_connect);
imSocket.on('connect', function() {
    console.log('Connecting to host...');
});