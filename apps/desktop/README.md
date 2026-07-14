# CODEEX Depósito — App de escritorio

Empaqueta el backend (NestJS), el frontend (Next.js) y la base de datos
(SQLite) en un único instalador `.exe` para Windows. Corre entero en una PC,
sin necesidad de servidor ni conexión a internet (salvo para sincronizar
stock con Google Sheets, que es opcional).

---

## Para usuarios

### Requisitos

- Windows 10 o 11, 64 bits.
- ~700MB libres de disco.
- No hace falta instalar Node.js, ni nada más: el instalador trae todo lo
  necesario.

### Instalación

1. Descargá `CODEEX Depósito Setup 1.0.0.exe` (te lo va a pasar quien te dio
   este link, no hay descarga pública).
2. Ejecutalo. El instalador te deja elegir la carpeta de instalación y crea
   accesos directos en el Menú Inicio y el Escritorio.
3. **La primera vez que abrís la app puede tardar un poco más de lo normal**
   (hasta 1-2 minutos): el antivirus de Windows escanea en tiempo real los
   miles de archivos recién instalados. No es que esté colgada — esperá.
   Los siguientes inicios van a ser mucho más rápidos.
4. Cuando termina de cargar, se abre la ventana de la app directamente.

### Primer uso

Antes de poder cargar un pedido, tiene que existir al menos una **obra**:

1. Andá a la pestaña **Maestros → Obras → Nueva obra**, cargá el nombre.
2. Después, en **Pedidos**, subí el PDF/imagen del pedido, elegí la obra, y
   generá el remito.

### Configurar Google Sheets (opcional)

Si tu instalación necesita sincronizar stock con Google Sheets, hay que
cargar las credenciales a mano después de instalar (nunca vienen dentro del
instalador, por seguridad):

1. Cerrá la app si está abierta.
2. Abrí el Explorador de Windows y escribí en la barra de direcciones:
   `%APPDATA%\CODEEX Deposito` (**sin acento** en "Deposito").
3. Creá ahí un archivo de texto llamado `.env` (sin nombre antes del punto)
   con este contenido:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_PROJECT_ID=tu-proyecto-id
   ```
4. Volvé a abrir la app.

### Dónde viven tus datos

Todo lo que cargás queda en tu PC, en:

```
%APPDATA%\CODEEX Deposito\
├── data\deposito.db     ← la base de datos (pedidos, obras, stock, etc.)
├── storage\remitos\     ← los Excel de remitos generados
├── logs\                ← registros de la app, útiles si algo falla
└── .env                 ← credenciales de Google Sheets (si las cargaste)
```

**Para hacer un backup**, alcanza con copiar la carpeta `%APPDATA%\CODEEX
Deposito\` entera a otro lugar (pendrive, disco externo, etc.).

### Desinstalar

Desde Windows: Configuración → Aplicaciones → buscar "CODEEX Depósito" →
Desinstalar. Esto **no borra** tus datos (`%APPDATA%\CODEEX Deposito\`) — si
querés borrarlos también, hacelo a mano después de desinstalar.

### Problemas comunes

- **La app no abre / se queda en blanco**: revisá los archivos en
  `%APPDATA%\CODEEX Deposito\logs\` (`backend.log`, `frontend.log`,
  `main.log`) — ahí queda registrado cualquier error.
- **El antivirus marca el instalador como sospechoso**: el instalador no
  está firmado por una autoridad de certificación reconocida todavía, así
  que Windows SmartScreen puede advertir. Es un falso positivo conocido, no
  un virus — hacé click en "Más información" → "Ejecutar de todas formas".
- **Windows dice que el puerto 3000 o 3001 ya está en uso**: cerrá cualquier
  otro programa que use esos puertos (por ejemplo, otro servidor de
  desarrollo corriendo en la misma PC) y volvé a abrir la app.

---

## Para desarrolladores

### Requisitos

- Windows (el build genera un instalador NSIS y compila módulos nativos
  para Windows — no se puede generar el `.exe` desde Linux/Mac).
- Node y pnpm en las versiones del repo raíz (ver `DEPLOYMENT.md`).

### Generar el instalador

Desde la raíz del monorepo:

```bash
pnpm package:desktop
```

Esto corre, en orden: `prisma generate` → build de backend → build de
frontend → `apps/desktop/scripts/prepare-backend.js` →
`apps/desktop/scripts/prepare-frontend.js` → `electron-builder --win`.

El instalador queda en `apps/desktop/release/CODEEX Depósito Setup 1.0.0.exe`.

**Tarda 10-20+ minutos**, la mayor parte compresión NSIS (`7za.exe -mx=9`,
máxima compresión) de un payload de ~650-700MB. No es que se cuelgue — si
querés confirmar que sigue viva, chequeá que haya un proceso `7za.exe`
corriendo.

### ⚠️ Antes de tocar `prepare-backend.js` o `prepare-frontend.js`

Ambos scripts usan `pnpm deploy --config.node-linker=hoisted` para generar
un `node_modules` plano y portable. **No reemplazar esto por un
`fs.cpSync(..., {dereference:true})` a mano** — ya se probó y rompe la
resolución de módulos de Node: pnpm coloca las dependencias privadas de cada
paquete (ej. `tslib` para `@nestjs/core`, `@swc/helpers` para `next`) como
symlinks *hermanos* dentro de `.pnpm/<paquete>@version/node_modules/`, y
aplanar cada symlink de forma independiente desconecta cada paquete de sus
hermanos. El build queda en verde pero el `.exe` instalado explota en
runtime con `Cannot find module 'tslib'` (o el equivalente para cualquier
otro paquete con dependencias privadas no hoisteadas). Ver los comentarios
largos dentro de `prepare-backend.js` para el detalle completo.

### Verificar que el `.exe` realmente funciona (no solo que el build da verde)

Un build en verde no garantiza que el instalador funcione — varios bugs
reales de este pipeline solo aparecían corriendo la app instalada de
verdad. Antes de dar por buena una versión:

1. Desinstalá cualquier versión previa (`Uninstall CODEEX Depósito.exe` en
   la carpeta de instalación, con `/S` para modo silencioso).
2. Instalá la nueva (`CODEEX Depósito Setup 1.0.0.exe /S`).
3. Abrila y revisá `%APPDATA%\CODEEX Deposito\logs\` — confirmá que
   `backend.log` llega a `Nest application successfully started` y que
   `frontend.log` dice `Ready in ...s`.
4. Probá el flujo real (crear obra → pedido → remito → cerrar y reabrir la
   app → confirmar que los datos siguen ahí).

Para automatizar el paso 4 sin herramientas de captura visual: relanzar el
`.exe` instalado con `--remote-debugging-port=9222` (Electron respeta ese
flag aunque esté empaquetado) y conectar con `playwright-core`
(`chromium.connectOverCDP('http://localhost:9222')`) desde un script
descartable — no hace falta el paquete `playwright` completo ni descargar
browsers, porque te conectás a un Chromium que ya está corriendo.

### Más detalle

- `DEPLOYMENT.md` (raíz del repo) tiene la arquitectura completa y todos los
  gotchas de packaging encontrados hasta ahora, con más contexto que este
  README.
- Los comentarios dentro de `prepare-backend.js`, `prepare-frontend.js` y
  `electron-builder.yml` explican el *por qué* de cada decisión no obvia —
  léelos antes de "simplificar" algo ahí, probablemente ya se probó la
  versión simple y falló.
