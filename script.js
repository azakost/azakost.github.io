
function generate() {
    var link = $("#link").val();
    let xhr = new XMLHttpRequest();
    xhr.open("GET", link);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let data = JSON.parse(xhr.responseText);
            data.forEach((x) => {
                printSvg(x.ID, x.Description);
            });

        }
    };
    xhr.onerror = function () {
        alert('Сервис недоступен, попробуйте позже!');
        closeModal();
    }
    xhr.send();


}



function printSvg(uuid, id) {
    $.get('template.svg', function (html) {
        var template = $(html.rootElement);
        var svg = new QRCode({
            content: "https://kaspi.kz/pay/Smartvend?service_id=4680&7363=" + uuid,
            width: 205,
            height: 205,
            padding: 0,
        }).svg();
        var qr = $(svg)[2];
        qr.setAttribute("viewBox", "-67 -160 340 485");
        qr.setAttribute("width", "340");
        qr.setAttribute("height", "485");
        var sign = $(template[0]).children();
        sign[0].innerHTML = "SmartVend.kz";
        sign[1].innerHTML = "Аппарат №" + id;
        $('#qr-codes').append(template.prepend(qr));
    });
}




