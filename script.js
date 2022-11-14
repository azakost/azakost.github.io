const html5QrCode = new Html5Qrcode("qr-reader");

let config = {
    fps: 10,
    rememberLastUsedCamera: true,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
};

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code matched = ${decodedText}`, decodedResult);
}

function onPermissionSuccess(devices) {
    if (devices && devices.length) {
        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess);
    }
}

function onPermissionError(error) {

}

Html5Qrcode.getCameras().then(onPermissionSuccess, onPermissionError);