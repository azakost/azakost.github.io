window.addEventListener('beforeinstallprompt', (event) => {
    // Отменяем стандартное поведение браузера
    event.preventDefault();

    // Сохраняем событие для отображения позже
    const deferredPrompt = event;

    // Отображаем пользователю кнопку или другой элемент, чтобы активировать окно предложения установки
    // Например, показываем кнопку "Установить приложение"
    installButton.addEventListener('click', () => {
        // Вызываем отложенное событие, чтобы показать нативное окно предложения установки
        deferredPrompt.prompt();

        // Ожидаем ответа пользователя
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Пользователь принял предложение установки');
            } else {
                console.log('Пользователь отклонил предложение установки');
            }

            // Очищаем отложенное событие
            deferredPrompt = null;
        });
    });

    // Показываем кнопку или другой элемент для активации окна предложения установки
    installButton.style.display = 'block';
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
            msg: "https://kaspi.kz/pay/Smartvend?service_id=4680&7363=" + uuid,
            dim: 256,
            pad: 0,
        });
        qr.setAttribute("viewBox", "-11 -28 100 100");
        qr.setAttribute("width", "600");
        qr.setAttribute("height", "600");
        var sign = $(template[0]).children();
        sign[1].innerHTML = "SmartVend.kz";
        sign[2].innerHTML = "Аппарат №" + id;
        template.children()[0].after(qr);
        $('#qr-codes').append(template);
    });
}




