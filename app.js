// Referencias a elementos del DOM
const qrTextInput = document.getElementById('qr-text');
const logoUpload = document.getElementById('logo-upload');
const logoSizeInput = document.getElementById('logo-size');
const qrSizeSelect = document.getElementById('qr-size');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const previewSection = document.getElementById('preview-section');
const qrPreview = document.getElementById('qr-preview');
const errorMessage = document.getElementById('error-message');
const sizeValue = document.querySelector('.size-value');
const fileName = document.querySelector('.file-name');

// Variables para almacenar datos
let uploadedLogo = null;
let currentQRCanvas = null;

// Event Listeners
logoUpload.addEventListener('change', handleLogoUpload);
logoSizeInput.addEventListener('input', updateSizeLabel);
generateBtn.addEventListener('click', generateQRCode);
downloadBtn.addEventListener('click', downloadQRCode);

// Maneja la carga del logo
function handleLogoUpload(event) {
    const file = event.target.files[0];

    if (!file) {
        uploadedLogo = null;
        fileName.textContent = 'Ningún archivo seleccionado';
        return;
    }

    // Verifica que sea PNG
    if (file.type !== 'image/png') {
        showError('Por favor, sube un archivo PNG válido.');
        logoUpload.value = '';
        fileName.textContent = 'Ningún archivo seleccionado';
        return;
    }

    fileName.textContent = file.name;

    // Lee el archivo como imagen
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            uploadedLogo = img;
            hideError();
        };
        img.onerror = function() {
            showError('Error al cargar la imagen. Asegúrate de que sea un PNG válido.');
            uploadedLogo = null;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Actualiza la etiqueta del tamaño del logo
function updateSizeLabel() {
    sizeValue.textContent = logoSizeInput.value + '%';
}

// Genera el código QR
function generateQRCode() {
    const text = qrTextInput.value.trim();

    if (!text) {
        showError('Por favor, ingresa un texto o URL para el código QR.');
        return;
    }

    hideError();

    try {
        const qrSize = parseInt(qrSizeSelect.value);
        const cellSize = 4; // Tamaño de cada celda del QR
        const margin = 2; // Margen en celdas

        // Crea el código QR con nivel de corrección alto
        const qr = qrcode(0, 'H'); // 0 = tipo automático, 'H' = alta corrección de errores
        qr.addData(text);
        qr.make();

        // Crea el canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Obtiene el tamaño del QR (número de módulos)
        const moduleCount = qr.getModuleCount();
        const canvasSize = qrSize;
        const actualCellSize = Math.floor(canvasSize / (moduleCount + margin * 2));
        const actualSize = actualCellSize * (moduleCount + margin * 2);

        canvas.width = actualSize;
        canvas.height = actualSize;

        // Fondo blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, actualSize, actualSize);

        // Dibuja el QR
        ctx.fillStyle = '#000000';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(
                        (col + margin) * actualCellSize,
                        (row + margin) * actualCellSize,
                        actualCellSize,
                        actualCellSize
                    );
                }
            }
        }

        // Si hay logo, lo superpone
        if (uploadedLogo) {
            addLogoToQR(canvas, uploadedLogo);
        }

        // Muestra el resultado
        currentQRCanvas = canvas;
        qrPreview.innerHTML = '';
        qrPreview.appendChild(canvas);
        previewSection.classList.remove('hidden');

    } catch (error) {
        showError('Error al generar el código QR: ' + error.message);
        console.error(error);
    }
}

// Agrega el logo al centro del QR
function addLogoToQR(qrCanvas, logoImg) {
    const ctx = qrCanvas.getContext('2d');
    const qrSize = qrCanvas.width;

    // Calcula el tamaño del logo basado en el porcentaje seleccionado
    const logoSizePercent = parseInt(logoSizeInput.value) / 100;
    const logoSize = qrSize * logoSizePercent;

    // Calcula la posición central
    const x = (qrSize - logoSize) / 2;
    const y = (qrSize - logoSize) / 2;

    // Dibuja un fondo blanco detrás del logo para mejor contraste
    const padding = 10;
    ctx.fillStyle = 'white';
    ctx.fillRect(
        x - padding,
        y - padding,
        logoSize + (padding * 2),
        logoSize + (padding * 2)
    );

    // Dibuja el logo
    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
}

// Descarga el código QR generado
function downloadQRCode() {
    if (!currentQRCanvas) {
        showError('Primero debes generar un código QR.');
        return;
    }

    try {
        // Convierte el canvas a blob y lo descarga
        currentQRCanvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'codigo-qr.png';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    } catch (error) {
        showError('Error al descargar el código QR: ' + error.message);
        console.error(error);
    }
}

// Muestra un mensaje de error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');

    // Auto-oculta después de 5 segundos
    setTimeout(hideError, 5000);
}

// Oculta el mensaje de error
function hideError() {
    errorMessage.classList.add('hidden');
}
