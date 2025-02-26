document.addEventListener('DOMContentLoaded', function () {
    const qrgbForm = document.getElementById('qrgb-form');
    const decodeForm = document.getElementById('decode-form');
    const resultDiv = document.getElementById('result');

    // Generar QRGB
    qrgbForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const redData = document.getElementById('red_data').value;
        const greenData = document.getElementById('green_data').value;
        const blueData = document.getElementById('blue_data').value;
        const logoFile = document.getElementById('logo').files[0];

        if (!logoFile) {
            alert("Por favor, selecciona un logo.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const logoUrl = e.target.result;

            // Generar códigos QR
            const redQR = generateQRCode(redData, 'red', logoUrl);
            const greenQR = generateQRCode(greenData, 'green', logoUrl);
            const blueQR = generateQRCode(blueData, 'blue', logoUrl);

            // Combinar códigos QR
            const combinedQR = combineQRCodes(redQR, greenQR, blueQR, logoUrl);

            // Mostrar el resultado
            resultDiv.innerHTML = `<h3>QRGB Generado:</h3><img src="${combinedQR}" alt="QRGB" style="max-width: 100%;">`;
        };
        reader.readAsDataURL(logoFile);
    });

    // Decodificar QRGB
    decodeForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const qrFile = document.getElementById('qr_file').files[0];
        if (!qrFile) {
            alert("Por favor, selecciona un archivo QR.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const qrUrl = e.target.result;

            // Decodificar el QR
            decodeQRCode(qrUrl, function (data) {
                resultDiv.innerHTML = `<h3>Resultados de Decodificación:</h3><p>${data}</p>`;
            });
        };
        reader.readAsDataURL(qrFile);
    });

    // Función para generar un código QR con un logo
    function generateQRCode(data, color, logoUrl) {
        const qrCode = new QRCode(document.createElement('div'), {
            text: data,
            width: 256,
            height: 256,
            colorDark: color,
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        const canvas = qrCode._el.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        // Añadir el logo al QR
        const logo = new Image();
        logo.src = logoUrl;
        logo.onload = function () {
            const logoSize = canvas.width / 4;
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;
            ctx.drawImage(logo, x, y, logoSize, logoSize);
        };

        return canvas.toDataURL();
    }

    // Función para combinar códigos QR
    function combineQRCodes(redQR, greenQR, blueQR, logoUrl) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;

        const redImg = new Image();
        redImg.src = redQR;
        const greenImg = new Image();
        greenImg.src = greenQR;
        const blueImg = new Image();
        blueImg.src = blueQR;

        Promise.all([redImg, greenImg, blueImg].map(img => new Promise(resolve => img.onload = resolve))).then(() => {
            ctx.drawImage(redImg, 0, 0);
            ctx.drawImage(greenImg, 0, 0);
            ctx.drawImage(blueImg, 0, 0);

            // Añadir el logo
            const logo = new Image();
            logo.src = logoUrl;
            logo.onload = function () {
                const logoSize = canvas.width / 4;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                ctx.drawImage(logo, x, y, logoSize, logoSize);

                // Mostrar el resultado
                resultDiv.innerHTML = `<h3>QRGB Generado:</h3><img src="${canvas.toDataURL()}" alt="QRGB" style="max-width: 100%;">`;
            };
        });

        return canvas.toDataURL();
    }

    // Función para decodificar un código QR
    function decodeQRCode(imageUrl, callback) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                callback(code.data);
            } else {
                callback("No se pudo decodificar el código QR.");
            }
        };
    }
});