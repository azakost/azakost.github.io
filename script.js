const html5QrCode = new Html5Qrcode("qr-reader");

var modal = document.getElementById("modal");
var vendID = document.getElementById("vending_id");
var phone = document.getElementById("phone");
var whatsapp = document.getElementById("whatsapp");
var contact = document.getElementById("contacts");
var loader = document.getElementById("loader");

let config = {
    fps: 10,
    rememberLastUsedCamera: true,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
};


function showModal(decodedText) {
    contact.classList.add("d-none");
    loader.classList.remove("d-none");
    modal.classList.remove("d-none");
    var uuid = decodedText.replaceAll('https://kaspi.kz/pay/Smartvend?service_id=4680&7363=', '');
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://partner.smartvend.kz/api/partner/support/" + uuid + "/");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            alert(xhr.responseText);
            let data = JSON.parse(xhr.responseText);

            loader.classList.add("d-none");
            contact.classList.remove("d-none");
            vendID.innerHTML = data.vending_id;
            phone.href = "tel:+" + data.support_phone;
            whatsapp.href = "https://wa.me/" + data.support_phone;
        }
    };


}

function closeModal() {
    modal.classList.add("d-none");
}


function onPermissionSuccess(devices) {
    if (devices && devices.length) {
        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText, decodedResult) => showModal(decodedText),
        );
    }
}

function onPermissionError(error) {

}

Html5Qrcode.getCameras().then(onPermissionSuccess, onPermissionError);

