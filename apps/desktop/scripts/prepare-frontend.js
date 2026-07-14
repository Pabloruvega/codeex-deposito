// Deja el frontend listo para empaquetar como extraResource de electron-builder.
//
// Antes este script usaba el "standalone output" de Next (output:'standalone')
// más una copia con `fs.cpSync(..., {dereference:true})` para aplanar los
// symlinks de pnpm que Next deja en su tracing. Se cambió a `pnpm deploy`
// con `--config.node-linker=hoisted` — mismo fix que se aplicó en
// prepare-backend.js, y por la MISMA razón real (ver el comentario largo ahí):
// Next coloca `@swc/helpers` como symlink hermano de `next` dentro de
// `.pnpm/next@.../node_modules/`, y aplanar cada symlink de forma
// independiente desconecta a `next` de ese hermano — el frontend empaquetado
// arrancaba y explotaba con "Cannot find module '@swc/helpers/...'" (bug
// real, encontrado corriendo el .exe). `pnpm deploy --config.node-linker=hoisted`
// genera un node_modules 100% plano (sin symlinks) con todo correctamente
// hoisteado, igual que para el backend.
//
// Con node_modules completo y real (no el subconjunto tracing de Next), ya
// no hace falta el server.js standalone: `main.ts` arranca directo el CLI
// real de Next (`next start`), disponible en este node_modules.
//
// "files" en apps/frontend/package.json (next.config.ts, .next, public)
// controla qué se copia además de node_modules — sin eso, pnpm deploy cae
// al .gitignore de la RAÍZ del monorepo (que no aplica a subcarpetas sin su
// propio .gitignore) y copiaba .env.local, src/ y otros archivos de
// desarrollo sueltos al instalador (confirmado: .env.local terminaba en el
// deploy).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const desktopRoot = path.join(__dirname, '..');
const repoRoot = path.join(desktopRoot, '..', '..');
const frontendSrc = path.join(repoRoot, 'apps', 'frontend');
const buildDir = path.join(desktopRoot, 'build');
const finalDir = path.join(buildDir, 'frontend');

function run(cmd, args, cwd, useShell) {
  console.log(`[prepare-frontend] $ ${cmd} ${args.join(' ')} (cwd: ${cwd})`);
  execFileSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: !!useShell,
  });
}

function main() {
  if (!fs.existsSync(path.join(frontendSrc, '.next', 'BUILD_ID'))) {
    console.error(
      '[prepare-frontend] No existe apps/frontend/.next/BUILD_ID. ' +
        'Corré "pnpm build:frontend" antes de esto.',
    );
    process.exit(1);
  }

  fs.mkdirSync(buildDir, { recursive: true });
  fs.rmSync(finalDir, { recursive: true, force: true });

  run(
    'pnpm',
    ['--config.node-linker=hoisted', '--filter=frontend', 'deploy', '--prod', finalDir],
    repoRoot,
    true,
  );

  if (!fs.existsSync(path.join(finalDir, '.next', 'BUILD_ID'))) {
    console.error(
      `[prepare-frontend] El deploy no incluyó .next — revisar el campo ` +
        `"files" en apps/frontend/package.json.`,
    );
    process.exit(1);
  }

  console.log(`[prepare-frontend] Frontend listo para empaquetar en: ${finalDir}`);
}

main();
