const html5QrCode = new Html5Qrcode("qr-reader");

var modal = document.getElementById("modal");
var vendID = document.getElementById("vending_id");
var phone = document.getElementById("phone");
var whatsapp = document.getElementById("whatsapp");

let config = {
    fps: 10,
    rememberLastUsedCamera: true,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
};


function showModal() {
    vendID.innerHTML = "dsdsd";
    phone.href = "tel:+77776420344";
    whatsapp.href = "https://wa.me/77776420344";
    modal.classList.add("show");
}

function closeModal() {
    modal.classList.remove("show");
}

function onScanSuccess(decodedText, decodedResult) {
    showModal();
}

function onPermissionSuccess(devices) {
    if (devices && devices.length) {
        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess);
    }
}

function onPermissionError(error) {

}

Html5Qrcode.getCameras().then(onPermissionSuccess, onPermissionError);

