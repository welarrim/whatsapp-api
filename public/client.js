document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const qrcode = new QRCode(document.getElementById("qrCode"));

    socket.on('qr', function(qr) {
        qrcode.clear()
        qrcode.makeCode(qr)
        document.getElementById("login").style.display = 'block'
        document.getElementById("app").style.display = 'none'
    });

    socket.on('connected', function(qr) {
        
        document.getElementById("login").style.display = 'none'
        document.getElementById("app").style.display = 'block'
    });
});