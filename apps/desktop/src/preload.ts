import { contextBridge } from 'electron';

// De momento no exponemos ninguna API privilegiada al frontend: la ventana
// solo carga la SPA de Next.js igual que un navegador normal contra
// localhost. Este preload queda como punto de extensión si en el futuro se
// necesita algo nativo (diálogos de archivo, notificaciones del SO, etc.).
contextBridge.exposeInMainWorld('codeexDesktop', {
  isDesktop: true,
});
