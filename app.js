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
let currentQRData = null;

// Variables para el redimensionamiento con arrastre
let isDragging = false;
let startY = 0;
let startSize = 20;

// Event Listeners
logoUpload.addEventListener('change', handleLogoUpload);
logoSizeInput.addEventListener('input', function() {
    updateSizeLabel();
    if (currentQRCanvas && uploadedLogo) {
        redrawQRWithLogo();
    }
});
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

// Calcula las dimensiones y posición del logo
function getLogoDimensions(canvasSize) {
    if (!uploadedLogo) return null;

    const logoSizePercent = parseInt(logoSizeInput.value) / 100;
    const maxLogoSize = canvasSize * logoSizePercent;
    const aspectRatio = uploadedLogo.width / uploadedLogo.height;

    let logoWidth, logoHeight;
    if (aspectRatio > 1) {
        logoWidth = maxLogoSize;
        logoHeight = maxLogoSize / aspectRatio;
    } else {
        logoHeight = maxLogoSize;
        logoWidth = maxLogoSize * aspectRatio;
    }

    const padding = 10;
    const x = (canvasSize - logoWidth) / 2;
    const y = (canvasSize - logoHeight) / 2;

    return {
        x: x - padding,
        y: y - padding,
        width: logoWidth + padding * 2,
        height: logoHeight + padding * 2,
        logoX: x,
        logoY: y,
        logoWidth: logoWidth,
        logoHeight: logoHeight
    };
}

// Verifica si un módulo del QR está dentro del área del logo
function isModuleInLogoArea(moduleX, moduleY, moduleSize, logoDims) {
    if (!logoDims) return false;

    const moduleRight = moduleX + moduleSize;
    const moduleBottom = moduleY + moduleSize;
    const logoRight = logoDims.x + logoDims.width;
    const logoBottom = logoDims.y + logoDims.height;

    return !(moduleRight <= logoDims.x ||
             moduleX >= logoRight ||
             moduleBottom <= logoDims.y ||
             moduleY >= logoBottom);
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

        // Calcula dimensiones del logo si existe
        const logoDims = uploadedLogo ? getLogoDimensions(actualSize) : null;

        // Dibuja el QR, omitiendo módulos en el área del logo
        ctx.fillStyle = '#000000';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    const moduleX = (col + margin) * actualCellSize;
                    const moduleY = (row + margin) * actualCellSize;

                    // Solo dibuja el módulo si NO está en el área del logo
                    if (!isModuleInLogoArea(moduleX, moduleY, actualCellSize, logoDims)) {
                        ctx.fillRect(moduleX, moduleY, actualCellSize, actualCellSize);
                    }
                }
            }
        }

        // Si hay logo, lo superpone
        if (uploadedLogo) {
            addLogoToQR(canvas, uploadedLogo);
        }

        // Muestra el resultado
        currentQRCanvas = canvas;
        currentQRData = { qr, qrSize, actualSize, moduleCount, actualCellSize, margin };
        qrPreview.innerHTML = '';
        qrPreview.appendChild(canvas);
        previewSection.classList.remove('hidden');

        // Muestra/oculta el texto de ayuda según haya logo
        const helpText = document.querySelector('.help-text');
        if (uploadedLogo) {
            helpText.style.display = 'block';
            setupDragToResize(canvas);
        } else {
            helpText.style.display = 'none';
        }

    } catch (error) {
        showError('Error al generar el código QR: ' + error.message);
        console.error(error);
    }
}

// Función auxiliar para dibujar un rectángulo con esquinas redondeadas
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Agrega el logo al centro del QR
function addLogoToQR(qrCanvas, logoImg, showBorder = true) {
    const ctx = qrCanvas.getContext('2d');
    const qrSize = qrCanvas.width;

    // Calcula el tamaño máximo del logo basado en el porcentaje seleccionado
    const logoSizePercent = parseInt(logoSizeInput.value) / 100;
    const maxLogoSize = qrSize * logoSizePercent;

    // Calcula la relación de aspecto de la imagen original
    const aspectRatio = logoImg.width / logoImg.height;

    // Calcula las dimensiones del logo manteniendo la relación de aspecto
    let logoWidth, logoHeight;

    if (aspectRatio > 1) {
        // La imagen es más ancha que alta
        logoWidth = maxLogoSize;
        logoHeight = maxLogoSize / aspectRatio;
    } else {
        // La imagen es más alta que ancha (o cuadrada)
        logoHeight = maxLogoSize;
        logoWidth = maxLogoSize * aspectRatio;
    }

    // Calcula la posición central
    const x = (qrSize - logoWidth) / 2;
    const y = (qrSize - logoHeight) / 2;

    const padding = 10;
    const borderRadius = 8;

    // Dibuja el fondo blanco con esquinas redondeadas
    ctx.fillStyle = 'white';
    roundRect(ctx, x - padding, y - padding, logoWidth + padding * 2, logoHeight + padding * 2, borderRadius);
    ctx.fill();

    // Dibuja el logo con esquinas redondeadas usando clipping
    ctx.save();
    const logoRadius = 6;
    roundRect(ctx, x, y, logoWidth, logoHeight, logoRadius);
    ctx.clip();
    ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
    ctx.restore();

    // Dibuja borde interactivo solo para la vista previa
    if (logoImg && showBorder) {
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        roundRect(ctx, x - padding, y - padding, logoWidth + padding * 2, logoHeight + padding * 2, borderRadius);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// Configura el redimensionamiento con arrastre del mouse
function setupDragToResize(canvas) {
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
}

function getCanvasCoordinates(e) {
    const rect = currentQRCanvas.getBoundingClientRect();
    const scaleX = currentQRCanvas.width / rect.width;
    const scaleY = currentQRCanvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function isMouseOverLogo(x, y) {
    if (!uploadedLogo || !currentQRCanvas) return false;

    const logoSizePercent = parseInt(logoSizeInput.value) / 100;
    const maxLogoSize = currentQRCanvas.width * logoSizePercent;
    const aspectRatio = uploadedLogo.width / uploadedLogo.height;

    let logoWidth, logoHeight;
    if (aspectRatio > 1) {
        logoWidth = maxLogoSize;
        logoHeight = maxLogoSize / aspectRatio;
    } else {
        logoHeight = maxLogoSize;
        logoWidth = maxLogoSize * aspectRatio;
    }

    const padding = 10;
    const centerX = currentQRCanvas.width / 2;
    const centerY = currentQRCanvas.height / 2;
    const logoX = centerX - logoWidth / 2;
    const logoY = centerY - logoHeight / 2;

    return x >= logoX - padding && x <= logoX + logoWidth + padding &&
           y >= logoY - padding && y <= logoY + logoHeight + padding;
}

function onCanvasMouseMove(e) {
    if (!uploadedLogo || !currentQRCanvas) return;

    const coords = getCanvasCoordinates(e);

    if (isDragging) {
        const deltaY = startY - e.clientY;
        const sensitivity = 0.2;
        let newSize = startSize + (deltaY * sensitivity);

        // Limita el tamaño entre 10 y 30
        newSize = Math.max(10, Math.min(30, newSize));

        // Actualiza el slider y redibuja
        logoSizeInput.value = Math.round(newSize);
        updateSizeLabel();
        redrawQRWithLogo();
    } else {
        // Cambia el cursor cuando está sobre el logo
        if (isMouseOverLogo(coords.x, coords.y)) {
            currentQRCanvas.style.cursor = 'grab';
        } else {
            currentQRCanvas.style.cursor = 'default';
        }
    }
}

function onMouseDown(e) {
    if (!uploadedLogo || !currentQRData) return;

    const coords = getCanvasCoordinates(e);

    // Verifica si el clic está sobre el logo
    if (isMouseOverLogo(coords.x, coords.y)) {
        isDragging = true;
        startY = e.clientY;
        startSize = parseInt(logoSizeInput.value);
        currentQRCanvas.style.cursor = 'grabbing';
        e.preventDefault();
    }
}

function onMouseUp() {
    if (isDragging) {
        isDragging = false;
        currentQRCanvas.style.cursor = 'grab';
    }
}

// Redibuja el QR con el logo en el nuevo tamaño
function redrawQRWithLogo() {
    if (!currentQRData || !currentQRCanvas) return;

    const { qr, actualSize, moduleCount, actualCellSize, margin } = currentQRData;
    const ctx = currentQRCanvas.getContext('2d');

    // Limpia el canvas
    ctx.clearRect(0, 0, actualSize, actualSize);

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, actualSize, actualSize);

    // Calcula dimensiones del logo si existe
    const logoDims = uploadedLogo ? getLogoDimensions(actualSize) : null;

    // Dibuja el QR, omitiendo módulos en el área del logo
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
                const moduleX = (col + margin) * actualCellSize;
                const moduleY = (row + margin) * actualCellSize;

                // Solo dibuja el módulo si NO está en el área del logo
                if (!isModuleInLogoArea(moduleX, moduleY, actualCellSize, logoDims)) {
                    ctx.fillRect(moduleX, moduleY, actualCellSize, actualCellSize);
                }
            }
        }
    }

    // Dibuja el logo
    if (uploadedLogo) {
        addLogoToQR(currentQRCanvas, uploadedLogo);
    }
}

// Descarga el código QR generado
function downloadQRCode() {
    if (!currentQRCanvas) {
        showError('Primero debes generar un código QR.');
        return;
    }

    try {
        // Redibuja el QR sin el borde antes de descargar
        if (uploadedLogo && currentQRData) {
            const { qr, actualSize, moduleCount, actualCellSize, margin } = currentQRData;
            const ctx = currentQRCanvas.getContext('2d');

            // Limpia el canvas
            ctx.clearRect(0, 0, actualSize, actualSize);

            // Fondo blanco
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, actualSize, actualSize);

            // Calcula dimensiones del logo si existe
            const logoDims = uploadedLogo ? getLogoDimensions(actualSize) : null;

            // Dibuja el QR, omitiendo módulos en el área del logo
            ctx.fillStyle = '#000000';
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (qr.isDark(row, col)) {
                        const moduleX = (col + margin) * actualCellSize;
                        const moduleY = (row + margin) * actualCellSize;

                        // Solo dibuja el módulo si NO está en el área del logo
                        if (!isModuleInLogoArea(moduleX, moduleY, actualCellSize, logoDims)) {
                            ctx.fillRect(moduleX, moduleY, actualCellSize, actualCellSize);
                        }
                    }
                }
            }

            // Dibuja el logo SIN borde
            addLogoToQR(currentQRCanvas, uploadedLogo, false);
        }

        // Convierte el canvas a blob y lo descarga
        currentQRCanvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'codigo-qr.png';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            // Redibuja con el borde para la vista previa
            if (uploadedLogo) {
                redrawQRWithLogo();
            }
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
