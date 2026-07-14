# CODEEX Depósito — Detalles del sistema para despliegue

Sistema interno de gestión de depósito para CODEEX Construcciones: procesa pedidos de obra (PDF/imagen → remito Excel), gestiona stock por obra/proveedor y registra faltantes. Monorepo con pnpm workspaces.

## Stack

| Componente | Detalle |
|---|---|
| Backend | NestJS 11 — `apps/backend/` |
| Frontend | Next.js 16 (App Router, Turbopack) — `apps/frontend/` |
| Base de datos | SQLite, vía Prisma 7 + `@prisma/adapter-libsql` |
| Package manager | pnpm workspaces (`pnpm-workspace.yaml`: `apps/*`, `packages/*`) |
| Paquete compartido | `packages/shared` (`@codeex/shared`) |
| Node | v22.17.1 (ver `.nvmrc`) |
| pnpm | 11.8.0 |

Módulo `apps/desktop` (Electron): empaqueta todo en un `.exe` para Windows, sin necesidad de hosting. Ver sección "Despliegue como app de escritorio" más abajo.

## Estructura del monorepo

```
codeex-deposito/
├── apps/
│   ├── backend/      # NestJS API — puerto 3001
│   ├── frontend/     # Next.js — puerto 3000
│   └── desktop/      # Electron — instalador .exe para Windows, verificado end-to-end
├── packages/
│   └── shared/       # tipos/utilidades compartidas
```

## Variables de entorno

### `apps/backend/.env` (NO versionado — está en `.gitignore`)

| Variable | Uso | Notas |
|---|---|---|
| `DATABASE_URL` | Conexión SQLite | `file:./dev.db` en dev. En prod usar ruta absoluta a un disco persistente. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Auth Google Sheets (`GoogleSheetsAuthService`) | Email de la service account |
| `GOOGLE_PRIVATE_KEY` | Auth Google Sheets | **Secreto real** — no imprimir/loguear. Cargar como secret en el hosting, no como archivo commiteado. |
| `GOOGLE_PROJECT_ID` | Auth Google Sheets | |
| `PORT` | Puerto del backend | Default `3001` si no se define |
| `NODE_ENV` | Entorno | `development` / `production` |
| `FRONTEND_URL` | Origen permitido en CORS (`main.ts`) | Default `http://localhost:3000` si no se define — **en prod hay que setearlo al dominio real del frontend**, sino CORS bloquea todo |
| `STORAGE_PATH` | Directorio base para resolver rutas de storage (remitos Excel). Si no está definida, usa `process.cwd()` (comportamiento histórico). La app de escritorio la setea a una carpeta persistente en `userData`. | — |

### `apps/frontend/.env.local` (NO versionado)

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend consumida por el cliente (`http://localhost:3001` en dev) |

> Los valores reales de estas variables están en las copias locales de `.env`/`.env.local`, nunca en git. Para desplegar, configurarlas como secrets/env vars en la plataforma de hosting.

## Instalación y build

```bash
# Desde la raíz del monorepo
pnpm install

# Generar cliente Prisma (requerido antes del primer build)
pnpm --filter backend exec prisma generate --config prisma.config.ts

# Aplicar migraciones
pnpm db:migrate            # dev (prisma migrate dev)
# en prod: pnpm --filter backend exec prisma migrate deploy --config prisma.config.ts

# Build
pnpm build:backend          # nest build → apps/backend/dist
pnpm build:frontend         # next build → apps/frontend/.next
```

### ⚠️ Gotcha de pnpm: scripts de build bloqueados

`pnpm-workspace.yaml` tiene `allowBuilds: false` para `@prisma/engines`, `better-sqlite3`, `sharp`, `tesseract.js`, `unrs-resolver`, `electron-winstaller`, `prisma`. Esto bloquea sus postinstall/build scripts por defecto (feature de seguridad de pnpm). Si el deploy falla por binarios nativos faltantes (ej. engine de Prisma, wasm de tesseract.js), correr:

```bash
pnpm approve-builds
```

o habilitar explícitamente esos paquetes en `onlyBuiltDependencies` según corresponda al entorno de destino.

## Arranque

| Modo | Backend | Frontend |
|---|---|---|
| Dev | `pnpm dev:backend` (`nest start --watch`) | `pnpm dev:frontend` (`next dev`) |
| Dev (ambos) | `pnpm dev` (concurrently) | |
| Prod | `pnpm --filter backend start:prod` (`node dist/main`) | `pnpm --filter frontend start` (`next start`) |

Puertos por defecto: **backend `:3001`**, **frontend `:3000`**.

## Persistencia a preservar entre despliegues

- **Base de datos SQLite**: el archivo apuntado por `DATABASE_URL` (`apps/backend/dev.db` en dev). Debe vivir en un volumen persistente, no en el filesystem efímero del contenedor/build.
- **`apps/backend/storage/`**: acá se guardan los Excel de remitos generados (`storage/remitos/<año>/<mes>/`). También necesita volumen persistente si se quiere conservar histórico de remitos entre deploys.

## Gotcha conocido: build de TypeScript vacío

`apps/backend/tsconfig.json` tenía `"incremental": true` combinado con `deleteOutDir: true` en `nest-cli.json`. Esa combinación es inconsistente: TypeScript no verifica si los archivos emitidos siguen existiendo, solo compara firmas de código fuente — si `dist/` se borra pero el código no cambió, tsc no vuelve a emitir nada y `dist/main.js` desaparece silenciosamente (build "exitoso" sin errores, pero sin `main.js`). Ya se quitó `incremental` del `tsconfig.json` para evitar que esto vuelva a pasar. Si alguna vez reaparece "Cannot find module '.../dist/main'" con build en verde, borrar `apps/backend/tsconfig.build.tsbuildinfo` (ya está en `.gitignore`) y volver a buildear.

## Despliegue como app de escritorio (Windows, un solo PC)

`apps/desktop` empaqueta backend + frontend + SQLite + storage en un único
instalador `.exe`, sin necesidad de hosting. Pensado para un solo usuario /
una sola PC (no sincroniza datos entre varias instalaciones — si se necesita
eso, el stock se sincroniza igual vía Google Sheets como hasta ahora).

**Verificado de punta a punta el 2026-07-13**, instalando el `.exe` real en
una PC Windows y probando el flujo completo (crear obra, crear pedido,
generar remito directo, descargar el Excel, cerrar la app y reabrirla): los
datos persisten correctamente entre reinicios.

Cómo funciona:

- El backend corre como proceso hijo (`node dist/main.js`) y el frontend
  corre `next start` (CLI real de Next, no el output `standalone`), ambos
  usando el propio binario de Electron como runtime vía
  `ELECTRON_RUN_AS_NODE`, así el usuario no necesita tener Node.js instalado
  por separado.
- `DATABASE_URL` y `STORAGE_PATH` apuntan a `app.getPath('userData')`
  (`%APPDATA%\CODEEX Deposito\` — **sin acento**, ver más abajo), NO al
  directorio de instalación (que no es escribible sin admin).
- `GOOGLE_PRIVATE_KEY` y demás secrets **no se empaquetan** en el instalador.
  Después de instalar, hay que crear a mano
  `%APPDATA%\CODEEX Deposito\.env` con esas variables.
- Al arrancar, corre `prisma migrate deploy` contra la DB del usuario antes
  de levantar el backend (para que una instalación nueva tenga el schema).
- Todo el output de backend/frontend/migraciones/proceso principal se loguea
  a archivos en `%APPDATA%\CODEEX Deposito\logs\` (`main.log`, `backend.log`,
  `frontend.log`, `migrate.log`) — la app empaquetada no tiene consola, así
  que estos logs son la única forma de diagnosticar un fallo en la PC de un
  usuario real.

### ⚠️ El path de `%APPDATA%` NO lleva el acento de "Depósito"

`app.setName('CODEEX Deposito')` (sin acento) se fija a mano en `main.ts`
porque Electron/electron-builder caían silenciosamente al `"name"` de
`package.json` (`"desktop"`) en vez de `productName` con el nombre real —
sospecha: el acento en `productName` rompía el fallback ASCII. La carpeta de
datos real del usuario es **`%APPDATA%\CODEEX Deposito\`** (sin acento). El
directorio de instalación bajo `%LOCALAPPDATA%\Programs\` sigue siendo
`desktop` (cosmético, no afecta funcionalidad).

### ⚠️ Gotcha real: symlinks de pnpm rompen `require()` de dependencias privadas

`apps/desktop/scripts/prepare-backend.js` y `prepare-frontend.js` empaquetan
cada paquete con `pnpm deploy --config.node-linker=hoisted` (node_modules
100% plano, sin symlinks). **No cambiar esto por un `fs.cpSync` con
`dereference:true` a mano** — ya se probó y rompe la resolución de módulos:
pnpm coloca las dependencias privadas de cada paquete (ej. `tslib` para
`@nestjs/core`, `@swc/helpers` para `next`) como symlinks *hermanos* dentro
de `.pnpm/<paquete>@version/node_modules/`, y aplanar cada symlink de forma
independiente desconecta cada paquete de sus hermanos — el build queda en
verde pero el `.exe` instalado explota en runtime con
`Cannot find module 'tslib'` (o similar). Ver comentarios largos en
`prepare-backend.js` y `[[desktop-packaging-electron]]` en memoria si esto
reaparece en otro paquete.

Para generar el instalador:

```bash
pnpm package:desktop
```

Esto corre: `prisma generate` → build de backend → build de frontend →
`electron-builder`. El build completo (incluye compresión NSIS al máximo de
un instalador de ~650-700MB) tarda **10-20+ minutos** — no es que se cuelgue,
es lento en serio (chequear si hay un proceso `7za.exe` activo antes de
asumir que algo se trabó). La instalación silenciosa (`/S`) y el primer
arranque post-instalación también son lentos por el escaneo en tiempo real
del antivirus sobre miles de archivos nuevos — un reinicio limpio posterior
es mucho más rápido.

### Puntos ya verificados (2026-07-13)

- `node_modules` de pnpm se empaqueta correctamente como `extraResource`
  (ver gotcha de symlinks arriba) — confirmado corriendo el `.exe` instalado,
  no solo con build en verde.
- La ruta al CLI de Prisma (`node_modules/prisma/build/index.js`) es
  correcta en Prisma 7, pero `prisma` tiene que estar en `dependencies` (no
  `devDependencies`) de `apps/backend/package.json`, porque
  `pnpm deploy --prod` excluye devDependencies y las migraciones lo
  necesitan en runtime.
- No hace falta `asarUnpack` para nada: Prisma 7 +
  `@prisma/adapter-libsql` no usa ningún engine nativo (100% WASM); el único
  binario nativo real es `@libsql/win32-x64-msvc`, y backend/frontend nunca
  entran al asar (van como `extraResources`).
- Firma de código: el instalador se firma con `signtool.exe` en el build
  (ver logs de `electron-builder`), pero no se verificó si es una firma
  válida reconocida por Windows o autofirmada — SmartScreen puede advertir
  al usuario igual si no es de una CA reconocida.

### Puntos sin verificar todavía

- Comportamiento con `tesseract.js` real (OCR): al momento de este test,
  `OcrService` está deshabilitado y devuelve items mock
  (`OCR_PENDIENTE_CALIBRACION`) — no se probó el flujo con OCR real activado
  dentro del `.exe` empaquetado.
- Instalación en una PC Windows distinta a la de desarrollo (todo lo
  verificado hasta ahora fue en la misma máquina donde se buildea).

## Checklist antes de desplegar

- [ ] `DATABASE_URL` apunta a un path persistente (no efímero)
- [ ] `FRONTEND_URL` seteado al dominio real del frontend (si no, CORS rompe todo)
- [ ] `NEXT_PUBLIC_API_URL` seteado al dominio real del backend
- [ ] Secrets de Google (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_PROJECT_ID`) cargados como secrets, no commiteados
- [ ] `prisma generate` + `prisma migrate deploy` corridos contra la DB de destino
- [ ] Volumen persistente montado para `apps/backend/storage/`
- [ ] `pnpm approve-builds` corrido si el entorno de build bloquea binarios nativos
