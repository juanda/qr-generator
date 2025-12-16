# Generador de Código QR con Logo

Aplicación web para generar códigos QR personalizados con logos integrados. Diseñada para crear códigos QR profesionales con imágenes de marca perfectamente integradas.

## Características

- ✨ **Generación de códigos QR** con texto o URLs
- 🖼️ **Logos personalizados** - Sube imágenes PNG y colócalas en el centro del QR
- 🎯 **Relación de aspecto preservada** - Los logos mantienen sus proporciones originales
- 🎨 **Integración perfecta** - Los módulos del QR no se superponen al logo
- 🔄 **Redimensionamiento interactivo** - Ajusta el tamaño del logo arrastrándolo con el mouse
- 📐 **Esquinas redondeadas** - Diseño moderno y profesional
- 💾 **Descarga en PNG** - Exporta tu código QR en alta calidad
- 🎚️ **Control de tamaño** - Ajusta tanto el tamaño del QR como del logo
- 📱 **Responsive** - Funciona en dispositivos móviles y desktop

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere instalación de dependencias
- No requiere servidor web (funciona directamente desde archivos locales)

## Instalación

1. Clona o descarga este repositorio:
```bash
git clone <url-del-repositorio>
cd qr-generator
```

2. O simplemente descarga todos los archivos del proyecto en una carpeta.

## Uso

### Opción 1: Abrir directamente en el navegador

Simplemente abre el archivo `index.html` en tu navegador web:

```bash
# En Linux/Mac
open index.html

# En Windows
start index.html

# O arrastra el archivo index.html a tu navegador
```

### Opción 2: Usar un servidor web local

Si prefieres usar un servidor web local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx http-server)
npx http-server

# Luego abre http://localhost:8000 en tu navegador
```

## Cómo usar la aplicación

### 1. Generar un código QR básico

1. Ingresa el texto o URL que deseas codificar en el campo "Texto o URL para el código QR"
2. Selecciona el tamaño deseado del código QR (200x200 a 500x500 pixels)
3. Haz clic en "Generar Código QR"

### 2. Agregar un logo

1. Haz clic en "Subir logo (PNG)" y selecciona tu imagen PNG
2. Usa el slider "Tamaño del logo (%)" para ajustar el tamaño inicial
3. Haz clic en "Generar Código QR"

### 3. Ajustar el tamaño del logo interactivamente

Una vez generado el código QR con logo:

1. Coloca el cursor sobre el logo (verás un borde punteado azul)
2. Haz clic y arrastra hacia arriba para agrandar o hacia abajo para reducir
3. El tamaño se ajusta en tiempo real

Alternativamente, puedes usar el slider para ajustar el tamaño.

### 4. Descargar el código QR

Haz clic en el botón "Descargar QR" para guardar tu código QR como imagen PNG.

**Nota:** La imagen descargada NO incluirá el borde punteado de edición, solo el código QR limpio con el logo integrado.

## Estructura de archivos

```
qr-generator/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Workflow de GitHub Actions
├── .gitignore              # Archivos ignorados por Git
├── index.html              # Interfaz de usuario
├── style.css               # Estilos de la aplicación
├── app.js                  # Lógica principal
├── qrcode-generator.min.js # Librería para generar códigos QR
└── README.md               # Este archivo
```

## Tecnologías utilizadas

- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos y diseño responsive
- **JavaScript (ES6+)** - Lógica de la aplicación
- **Canvas API** - Renderizado de códigos QR y logos
- **qrcode-generator** - Librería para generación de códigos QR (v1.4.4)

## Características técnicas

### Nivel de corrección de errores

La aplicación utiliza el nivel **H (High)** de corrección de errores Reed-Solomon, que permite:
- Hasta 30% del código QR puede estar dañado u oculto
- Ideal para códigos QR con logos en el centro
- Garantiza la legibilidad incluso con logos grandes

### Integración del logo

El logo se integra de forma inteligente:
1. Los módulos negros del QR no se dibujan en el área del logo
2. Se crea un área con fondo blanco y esquinas redondeadas
3. El logo se dibuja con clipping para esquinas redondeadas
4. Resultado: integración perfecta sin superposiciones

### Dimensiones y proporciones

- El logo mantiene su relación de aspecto original
- Tamaño ajustable del 10% al 30% del tamaño total del QR
- Padding de 10 pixels alrededor del logo
- Radio de borde: 8px (fondo), 6px (logo)

## Limitaciones

- Solo acepta imágenes en formato PNG para el logo
- El tamaño del logo está limitado al 10-30% del tamaño total del QR
- La aplicación funciona completamente en el cliente (no hay backend)

## Compatibilidad de navegadores

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## Solución de problemas

### El código QR no se escanea correctamente

- Reduce el tamaño del logo (debe ser menor al 30%)
- Asegúrate de que el logo no sea muy oscuro o complejo
- Aumenta el tamaño del código QR

### El logo se ve distorsionado

- Verifica que el archivo sea un PNG válido
- La aplicación mantiene la relación de aspecto, no debería distorsionarse

### La aplicación no funciona

- Verifica que todos los archivos estén en la misma carpeta
- Abre la consola del navegador (F12) para ver posibles errores
- Asegúrate de estar usando un navegador moderno

## Publicar en GitHub Pages

Esta aplicación está lista para ser publicada en GitHub Pages de forma automática.

### Pasos para publicar:

1. **Crea un repositorio en GitHub:**
   - Ve a GitHub.com e inicia sesión
   - Crea un nuevo repositorio (público)
   - Dale un nombre, por ejemplo: `qr-generator`
   - **NO inicialices** con README, .gitignore ni licencia

2. **Sube tu código al repositorio:**

```bash
# Inicializa el repositorio Git (si aún no lo has hecho)
git init

# Agrega todos los archivos
git add .

# Crea el primer commit
git commit -m "Initial commit: QR Generator con logo"

# Agrega el remote de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/qr-generator.git

# Sube el código a la rama principal
git push -u origin main
```

**Nota:** Si tu rama principal se llama `master` en lugar de `main`, usa:
```bash
git push -u origin master
```

3. **Activa GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Haz clic en **Settings** (Configuración)
   - En el menú lateral, haz clic en **Pages**
   - En **Source**, selecciona **GitHub Actions**
   - El workflow ya está configurado y se ejecutará automáticamente

4. **Accede a tu sitio:**

Tu aplicación estará disponible en:
```
https://tu-usuario.github.io/qr-generator/
```

### Verificar el despliegue:

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **Actions**
3. Verás el workflow "Deploy to GitHub Pages" ejecutándose o completado
4. Una vez completado con éxito (check verde ✓), tu sitio estará disponible
5. Puedes ver la URL en **Settings > Pages**

### Actualizar el sitio:

Cada vez que hagas un commit a la rama `main` o `master`, GitHub Pages se actualizará automáticamente:

```bash
# Realiza cambios en tu código
git add .
git commit -m "Descripción de los cambios"
git push
```

El workflow se ejecutará automáticamente y tu sitio se actualizará en 1-2 minutos.

### Solución de problemas:

**El workflow falla:**
- Ve a **Actions** y revisa los logs del workflow fallido
- Verifica que el archivo `.github/workflows/deploy.yml` esté presente
- Asegúrate de haber activado GitHub Pages desde **Settings > Pages**

**La página muestra 404:**
- Espera 2-5 minutos después del primer despliegue
- Verifica que el repositorio sea público
- Comprueba que GitHub Pages esté activado en **Settings > Pages > Source: GitHub Actions**

**Cambios no se reflejan:**
- Verifica que el workflow se haya ejecutado correctamente en **Actions**
- Limpia la caché del navegador (Ctrl+F5 o Cmd+Shift+R)
- Los despliegues pueden tardar 1-2 minutos en propagarse

**Error de permisos:**
- Ve a **Settings > Actions > General**
- En "Workflow permissions", selecciona **Read and write permissions**
- Marca la casilla "Allow GitHub Actions to create and approve pull requests"

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz un fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Autor

Desarrollado para crear códigos QR profesionales con branding personalizado.

## Agradecimientos

- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) - Librería para generación de códigos QR
- Canvas API - Por permitir manipulación de imágenes en el navegador
