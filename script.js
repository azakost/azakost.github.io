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
            ecl: "H"
        });
        // Фиксированный центрированный блок: QR масштабируется в него
        // независимо от числа модулей (длины ссылки)
        qr.setAttribute("x", "69");
        qr.setAttribute("y", "155");
        qr.setAttribute("width", "240");
        qr.setAttribute("height", "240");
        template.children()[0].after(qr);

        function addText(y, size, weight, color, text) {
            var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
            t.setAttribute("x", "50%");
            t.setAttribute("y", y);
            t.setAttribute("text-anchor", "middle");
            t.setAttribute("fill", color);
            t.setAttribute("style", "font-size: " + size + "px; font-family: Arial, sans-serif; font-weight: " + weight + ";");
            t.textContent = text;
            template[0].appendChild(t);
        }
        addText("430", 26, 700, "black", "№" + id);
        addText("466", 18, 400, "#777777", "SmartVend.kz");

        $('#qr-codes').append(template);
    });
}

// Размеры карточки в единицах viewBox (совпадают с template.svg)
var CARD_W = 378, CARD_H = 540;

// Собирает все карточки в один общий SVG-файл (столбцом) и скачивает его
function downloadSvg() {
    var cards = document.querySelectorAll('#qr-codes > svg');
    if (!cards.length) {
        alert('Сначала сгенерируйте QR-коды!');
        return;
    }
    var svgNS = "http://www.w3.org/2000/svg";
    var COLS = 50;                 // столбцов в сетке
    var GAP = 16;                  // зазор между карточками (виден серый фон)
    var cols = Math.min(cards.length, COLS);
    var rows = Math.ceil(cards.length / COLS);
    var totalW = GAP + cols * (CARD_W + GAP);
    var totalH = GAP + rows * (CARD_H + GAP);

    var root = document.createElementNS(svgNS, "svg");
    root.setAttribute("xmlns", svgNS);
    root.setAttribute("width", totalW);
    root.setAttribute("height", totalH);
    root.setAttribute("viewBox", "0 0 " + totalW + " " + totalH);

    // Серый фон, на котором видны границы каждой карточки
    var bg = document.createElementNS(svgNS, "rect");
    bg.setAttribute("x", "0");
    bg.setAttribute("y", "0");
    bg.setAttribute("width", totalW);
    bg.setAttribute("height", totalH);
    bg.setAttribute("fill", "#cccccc");
    root.appendChild(bg);

    for (var i = 0; i < cards.length; i++) {
        var clone = cards[i].cloneNode(true);
        // Уникализируем id (clipPath и др.), чтобы не было коллизий в общем файле
        clone.querySelectorAll('[id]').forEach(function (el) {
            var oldId = el.getAttribute('id');
            var newId = oldId + '_' + i;
            el.setAttribute('id', newId);
            clone.querySelectorAll('*').forEach(function (ref) {
                for (var a = 0; a < ref.attributes.length; a++) {
                    var attr = ref.attributes[a];
                    if (attr.value.indexOf('url(#' + oldId + ')') !== -1) {
                        attr.value = attr.value.replace('url(#' + oldId + ')', 'url(#' + newId + ')');
                    }
                }
            });
        });
        // Размещаем карточку в ячейке сетки
        var col = i % COLS;
        var row = Math.floor(i / COLS);
        clone.setAttribute("x", GAP + col * (CARD_W + GAP));
        clone.setAttribute("y", GAP + row * (CARD_H + GAP));
        clone.setAttribute("width", CARD_W);
        clone.setAttribute("height", CARD_H);
        clone.setAttribute("viewBox", "0 0 " + CARD_W + " " + CARD_H);
        root.appendChild(clone);
    }

    var xml = new XMLSerializer().serializeToString(root);
    var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + xml], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'qr-codes.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}




