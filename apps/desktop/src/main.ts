import { app, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3000;

// Sin esto, Electron usa el "name" de package.json ("desktop") para
// app.getPath('userData') en vez de productName ("CODEEX Depósito") —
// electron-builder también cae a "desktop" para el directorio de instalación
// por default, aparentemente por el acento en "Depósito". Fijamos el nombre
// acá a mano (ASCII, para evitar sorpresas de encoding en rutas de Windows)
// así %APPDATA%/<esto>/ es predecible y no depende de ese fallback.
app.setName('CODEEX Deposito');

let backendProcess: ChildProcess | undefined;
let frontendProcess: ChildProcess | undefined;
let mainWindow: BrowserWindow | undefined;

/**
 * En dev, backend/frontend viven como carpetas hermanas dentro del monorepo.
 * En prod (empaquetado), electron-builder los copia bajo resources/ vía
 * "extraResources" (ver electron-builder.yml) porque el asar no sirve para
 * correr procesos de Node con sus propios node_modules.
 */
const resourcesDir = isDev
  ? path.join(__dirname, '..', '..')
  : process.resourcesPath;

const backendDir = path.join(resourcesDir, 'backend');
const frontendDir = path.join(resourcesDir, 'frontend');

/**
 * Rutas persistentes fuera del directorio de instalación (Program Files no es
 * escribible sin admin). userData en Windows suele ser
 * %APPDATA%/CODEEX Depósito.
 */
function getUserDataPaths() {
  const userData = app.getPath('userData');
  return {
    userData,
    dbPath: path.join(userData, 'data', 'deposito.db'),
    storagePath: path.join(userData, 'storage'),
    envPath: path.join(userData, '.env'),
  };
}

/**
 * Secrets (Google service account, etc.) NUNCA se empaquetan dentro del
 * instalador. Se leen de un .env externo que el usuario coloca a mano una
 * sola vez en la carpeta de datos de la app, después de instalar.
 */
function loadExternalEnv(envPath: string): NodeJS.ProcessEnv {
  if (!fs.existsSync(envPath)) {
    console.warn(
      `[desktop] No se encontró ${envPath}. Las funciones que dependen de ` +
        `Google Sheets no van a andar hasta que se cree ese archivo.`,
    );
    return {};
  }
  return dotenv.parse(fs.readFileSync(envPath));
}

/**
 * App empaquetada sin consola: `stdio: 'inherit'` no va a ningún lado y
 * cualquier crash de un proceso hijo (o del main process) queda invisible
 * para siempre. Todo lo relevante se escribe también a un archivo bajo
 * userData/logs — es lo primero a revisar si algo falla en la PC de un
 * usuario real, sin depender de reproducir el problema a mano.
 */
function getLogPath(name: string): string {
  const logsDir = path.join(app.getPath('userData'), 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  return path.join(logsDir, `${name}.log`);
}

function logToFile(name: string, message: string): void {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  try {
    fs.appendFileSync(getLogPath(name), line);
  } catch {
    // Si ni siquiera se puede escribir el log, no hay mucho más para hacer.
  }
}

/**
 * Corre un script de Node usando el propio binario de Electron como runtime
 * (ELECTRON_RUN_AS_NODE=1), para no depender de que el usuario tenga Node.js
 * instalado por separado en su PC.
 */
function spawnNodeScript(
  scriptPath: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  logName: string,
): ChildProcess {
  const logStream = fs.createWriteStream(getLogPath(logName), { flags: 'a' });
  const child = spawn(process.execPath, [scriptPath, ...args], {
    cwd,
    env: { ...env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  child.stdout?.pipe(logStream);
  child.stderr?.pipe(logStream);
  return child;
}

/**
 * Corre las migraciones de Prisma contra la DB del usuario antes de levantar
 * el backend. Necesario porque en una instalación nueva la DB no existe todavía.
 *
 * OJO: no tengo 100% de certeza de que esta ruta al CLI de Prisma
 * (node_modules/prisma/build/index.js) sea estable en Prisma 7 — conviene
 * verificarlo corriendo esto en la práctica y ajustar si hace falta.
 */
function runMigrations(env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const prismaCli = path.join(backendDir, 'node_modules', 'prisma', 'build', 'index.js');
    if (!fs.existsSync(prismaCli)) {
      reject(
        new Error(
          `No encontré el CLI de Prisma en ${prismaCli}. Puede que la ruta ` +
            `haya cambiado de versión — revisar node_modules/prisma manualmente.`,
        ),
      );
      return;
    }
    const logStream = fs.createWriteStream(getLogPath('migrate'), { flags: 'a' });
    const child = spawn(
      process.execPath,
      [prismaCli, 'migrate', 'deploy', '--config', 'prisma.config.ts'],
      {
        cwd: backendDir,
        env: { ...env, ELECTRON_RUN_AS_NODE: '1' },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      },
    );
    child.stdout?.pipe(logStream);
    child.stderr?.pipe(logStream);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`prisma migrate deploy salió con código ${code}`));
    });
    child.on('error', reject);
  });
}

async function startBackend() {
  const { dbPath, storagePath, envPath } = getUserDataPaths();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.mkdirSync(storagePath, { recursive: true });

  const externalEnv = loadExternalEnv(envPath);

  // libsql espera una URL file: con barras /, incluso en Windows.
  const dbUrl = `file:${dbPath.split(path.sep).join('/')}`;

  const backendEnv: NodeJS.ProcessEnv = {
    ...process.env,
    ...externalEnv,
    NODE_ENV: 'production',
    PORT: String(BACKEND_PORT),
    FRONTEND_URL: `http://localhost:${FRONTEND_PORT}`,
    DATABASE_URL: dbUrl,
    STORAGE_PATH: storagePath,
  };

  try {
    await runMigrations(backendEnv);
  } catch (err) {
    logToFile('main', `Falló "prisma migrate deploy": ${err}`);
    // Seguimos igual: si la DB ya existe y está al día, esto puede no ser fatal,
    // pero en una instalación nueva sin DB, el backend va a fallar después.
  }

  const mainJs = path.join(backendDir, 'dist', 'main.js');
  backendProcess = spawnNodeScript(mainJs, [], backendDir, backendEnv, 'backend');
  backendProcess.on('exit', (code) => {
    logToFile('main', `[backend] proceso terminado con código ${code}`);
  });
}

function startFrontend() {
  // frontendDir viene de "pnpm deploy --config.node-linker=hoisted" (ver
  // scripts/prepare-frontend.js) — un node_modules real y completo, no el
  // subconjunto por tracing de output:'standalone'. Con eso ya está el CLI
  // real de Next disponible, así que arrancamos `next start` directo en vez
  // de depender de un server.js standalone.
  const nextCli = path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  const frontendEnv: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
  };
  frontendProcess = spawnNodeScript(
    nextCli,
    ['start', '-p', String(FRONTEND_PORT), '-H', 'localhost'],
    frontendDir,
    frontendEnv,
    'frontend',
  );
  frontendProcess.on('exit', (code) => {
    logToFile('main', `[frontend] proceso terminado con código ${code}`);
  });
}

function waitForServer(url: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Timeout esperando ${url}`));
          } else {
            setTimeout(attempt, 400);
          }
        });
    };
    attempt();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'CODEEX — Gestión de Depósito',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const frontendUrl = `http://localhost:${FRONTEND_PORT}`;

  if (!isDev) {
    try {
      await waitForServer(`http://localhost:${BACKEND_PORT}`);
      await waitForServer(frontendUrl);
    } catch (err) {
      logToFile('main', `backend/frontend no respondieron a tiempo: ${err}`);
    }
  }

  mainWindow.loadURL(frontendUrl);
}

process.on('uncaughtException', (err) => {
  logToFile('main', `uncaughtException: ${err.stack ?? err}`);
});
process.on('unhandledRejection', (err) => {
  logToFile('main', `unhandledRejection: ${err}`);
});

app.whenReady().then(async () => {
  logToFile('main', 'app.whenReady');
  if (!isDev) {
    await startBackend();
    startFrontend();
  }
  await createWindow();
  logToFile('main', 'createWindow terminado');
});

app.on('window-all-closed', () => {
  logToFile('main', 'window-all-closed');
  backendProcess?.kill();
  frontendProcess?.kill();
  app.quit();
});

app.on('before-quit', () => {
  backendProcess?.kill();
  frontendProcess?.kill();
});
