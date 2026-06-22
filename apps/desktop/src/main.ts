import { app, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

let backendProcess: ChildProcess;

function startBackend() {
  backendProcess = spawn('node', [
    path.join(__dirname, '../../backend/dist/main.js')
  ]);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900,
    title: 'CODEEX — Gestión de Depósito',
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../../frontend/out/index.html'));
  }
}

app.whenReady().then(() => { startBackend(); createWindow(); });
app.on('window-all-closed', () => { backendProcess?.kill(); app.quit(); });
