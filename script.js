$(document).ready(function () {

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Если это iOS, прерываем инициализацию плагина
    if (isIOS) {
        return;
    }

    // Инициализация плагина для остальных платформ
    $.smartbanner({
        title: 'SmartVend',
        author: 'Ваш личный кабинет',
        daysHidden: 0,
        hideOnInstall: false,
        force: 'android',
        icon: 'app_icon.png',
        button: 'Установить',
        price: 'Скачайте',
        inGooglePlay: 'из Google Play',
    });
});

function generate() {
    var link = $("#link").val();
    let xhr = new XMLHttpRequest();
    xhr.open("GET", link);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let data = JSON.parse(xhr.responseText);
            data.forEach((x) => {
                printSvg(x.ID, x['Internal ID']);
            });
        }
    };
    xhr.onerror = function () {
        alert('Сервис недоступен, попробуйте позже!');
    }
    xhr.send();
}

function printSvg(uuid, id) {
    $.get('template.svg', function (html) {
        var template = $(html.rootElement);
        var qr = QRCode({
            msg: "https://smartvend.kz/pos/" + uuid,
            dim: 512,
            pad: 0,
        });
        qr.setAttribute("viewBox", "-9 -23 100 100");
        qr.setAttribute("width", "730");
        qr.setAttribute("height", "730");
        var sign = $(template[0]).children();
        sign[1].innerHTML = "SmartVend.kz";
        sign[2].innerHTML = "Аппарат №" + id;
        template.children()[0].after(qr);
        $('#qr-codes').append(template);
    });
}




