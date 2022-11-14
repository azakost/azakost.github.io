const html5QrCode = new Html5Qrcode("qr-reader");

var modal = document.getElementById("modal");
var vendID = document.getElementById("vending_id");
var receipt = document.getElementById("receipt");
var empty = document.getElementById("empty_block");
var link = document.getElementById("link_block");
var loader = document.getElementById("loader");

let config = {
    fps: 10,
    rememberLastUsedCamera: true,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
};


function showModal(decodedText) {
    html5QrCode.stop();
    if (!decodedText.includes('https://kaspi.kz/pay/Smartvend?service_id=4680&7363=')) {
        alert('Неверный QR-код!');
        startScanner();
        return;
    }

    loader.classList.remove("d-none");
    modal.classList.remove("d-none");

    var uuid = decodedText.replaceAll('https://kaspi.kz/pay/Smartvend?service_id=4680&7363=', '');
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://partner.smartvend.kz/api/partner/support/" + uuid + "/");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let data = JSON.parse(xhr.responseText);
            loader.classList.add("d-none");
            console.log(typeof data.receipt_link);
            vendID.innerHTML = data.vending_id;
            if (data.receipt_link === undefined) {
                console.log('ddd');
                empty.classList.add("d-flex");
                link.classList.add("d-none");
            } else {
                empty.classList.add("d-none");
                link.classList.add("d-flex");
                receipt.href = data.receipt_link;
            }
        }
    };
    xhr.onerror = function () {
        alert('Сервис недоступен, попробуйте позже!');
        closeModal();
    }
    xhr.send();
}

function startScanner() {
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => showModal(decodedText),
    );
}

function closeModal() {
    startScanner();
    modal.classList.add("d-none");
}


function onPermissionSuccess(devices) {
    if (devices && devices.length) {
        startScanner();
    }
}

function onPermissionError(error) {
    alert(error);
}

Html5Qrcode.getCameras().then(onPermissionSuccess, onPermissionError);

