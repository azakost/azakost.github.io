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
            // Абсолютная координата, а не "50%": проценты не переживают экспорт в PDF.
            t.setAttribute("x", CARD_W / 2);
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

// Шрифт для PDF. Стандартные шрифты PDF не знают «№» и кириллицу, поэтому
// вшиваем Arimo — он метрически совпадает с Arial, так что текст в PDF встаёт
// ровно так же, как на экране. Регистрируем его под именем "Arial", чтобы
// font-family из карточки нашёл его без изменений.
var PDF_FONTS = [
    { file: 'arimo-regular.ttf', style: 'normal' },
    { file: 'arimo-bold.ttf', style: 'bold' }
];
var pdfFontsPromise = null;

function loadPdfFonts() {
    if (!pdfFontsPromise) {
        pdfFontsPromise = Promise.all(PDF_FONTS.map(function (f) {
            return fetch(f.file).then(function (r) {
                if (!r.ok) throw new Error(f.file + ' — ' + r.status);
                return r.arrayBuffer();
            }).then(function (buf) {
                var bytes = new Uint8Array(buf), bin = '';
                for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
                return { file: f.file, style: f.style, data: btoa(bin) };
            });
        })).catch(function (e) {
            pdfFontsPromise = null;   // дать повторить попытку после сбоя сети
            throw e;
        });
    }
    return pdfFontsPromise;
}

// Экспорт для CorelDRAW: векторный PDF, одна карточка на страницу
// в натуральном размере 378x540 pt (133x190 мм).
// Настоящий .cdr — закрытый бинарный формат Corel, записать его может только
// сам CorelDRAW; PDF он открывает как редактируемые кривые, дальше при
// необходимости «Файл → Сохранить как → CDR».
async function downloadPdf() {
    var cards = document.querySelectorAll('#qr-codes > svg');
    if (!cards.length) {
        alert('Сначала сгенерируйте QR-коды!');
        return;
    }
    var btn = document.getElementById('pdf-btn');
    var label = btn.textContent;
    btn.disabled = true;
    try {
        var fonts = await loadPdfFonts();
        var doc = new window.jspdf.jsPDF({
            unit: 'pt',
            format: [CARD_W, CARD_H],
            orientation: 'portrait',
            compress: true
        });
        fonts.forEach(function (f) {
            doc.addFileToVFS(f.file, f.data);
            doc.addFont(f.file, 'Arial', f.style);
        });
        for (var i = 0; i < cards.length; i++) {
            btn.textContent = 'Готовим ' + (i + 1) + '/' + cards.length + '...';
            if (i) doc.addPage([CARD_W, CARD_H], 'portrait');
            await doc.svg(cards[i], { x: 0, y: 0, width: CARD_W, height: CARD_H });
        }
        doc.save('qr-codes.pdf');
    } catch (e) {
        alert('Не удалось собрать PDF: ' + e.message);
        throw e;
    } finally {
        btn.textContent = label;
        btn.disabled = false;
    }
}




