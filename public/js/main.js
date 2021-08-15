let socket = io("http://localhost:3000");

$(document).ready(function() {
    socket.on("server-send-data", function(data) {
        $("#title_data").append(data + ' , ');
    })
    $("#test_a").click(function() {
        socket.emit("SEND DATA", "ALOOOOO");
    });
});