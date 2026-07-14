// Deja el backend listo para empaquetar como extraResource de electron-builder.
//
// Por qué existe este script (no es un simple `cp -r apps/backend`):
//
// 1. apps/backend/node_modules es un node_modules de pnpm: sus entradas de
//    primer nivel son symlinks/junctions hacia node_modules/.pnpm/<paquete>
//    en la RAÍZ del monorepo. Si electron-builder copia esa carpeta tal cual
//    como extraResource, copia los symlinks con su destino tal cual (los
//    recrea con el mismo path absoluto, no los resuelve — confirmado leyendo
//    node_modules/builder-util/out/fs.js: usa readlink() + symlink() con el
//    mismo target). En la PC del usuario ese path absoluto del monorepo no
//    existe, así que el backend empaquetado fallaría con "Cannot find
//    module" al arrancar.
//
// 2. `pnpm deploy` (con `injectWorkspacePackages: true` en pnpm-workspace.yaml,
//    ver ahí el porqué) resuelve esto a medias por default: genera un
//    node_modules "autocontenido", pero sigue usando symlinks hacia un
//    .pnpm local dentro de esa misma carpeta. Antes "arreglábamos" esto acá
//    con un segundo paso `fs.cpSync(..., {dereference:true})` que aplanaba
//    cada symlink a su contenido real — PERO eso rompe la resolución de
//    módulos: pnpm coloca las dependencias privadas de cada paquete como
//    HERMANAS dentro de su propia carpeta .pnpm/<pkg>@ver/node_modules/
//    (ej. tslib vive ahí, hermano de @nestjs/core, no dentro de
//    @nestjs/core). Node resuelve `require('tslib')` desde @nestjs/core
//    siguiendo el symlink a su ubicación REAL dentro de .pnpm/ y desde ahí
//    sube buscando node_modules — encuentra a tslib como hermano. Si en vez
//    de eso aplanamos node_modules/@nestjs/core a una copia física separada
//    (fuera de .pnpm/), esa copia queda desconectada de sus hermanos y
//    `require('tslib')` explota con MODULE_NOT_FOUND en runtime (bug real,
//    encontrado corriendo el .exe empaquetado, no un supuesto).
//
//    Fix: usar `--config.node-linker=hoisted` en el deploy. Este linker de
//    pnpm genera un node_modules 100% plano al estilo npm/yarn clásico —
//    CERO symlinks, cada dependencia transitiva queda hoisteada a nivel
//    superior (confirmado: `node_modules/tslib` termina en el top level,
//    `node_modules/@nestjs/core` es un directorio real, no symlink). Portable
//    tal cual a cualquier PC y sin el problema de hermanos-desconectados.
//
// 3. `pnpm deploy` NO corre `prisma generate` — reinstala @prisma/client
//    desde cero en su propio node_modules, así que el cliente generado
//    (que vive en node_modules/@prisma/client/node_modules/.prisma/client,
//    un side-effect de escritura directa de `prisma generate`, no un
//    paquete versionado del store) queda ausente. Si no lo regeneramos acá,
//    el backend empaquetado arranca pero explota al primer query con
//    "@prisma/client did not initialize yet" o similar.
//
//    Probamos correr `prisma generate --config prisma.config.ts` con cwd en
//    deployDir, pero prisma.config.ts importa `prisma/config`, que a su vez
//    depende de `@prisma/config` — ninguno de los dos está en deployDir
//    porque "prisma" es devDependency (--prod lo excluye), y copiar el
//    paquete "prisma" a mano no alcanza porque sus propias dependencias
//    viven aparte en el store de pnpm. En vez de perseguir esa cadena de
//    dependencias, corremos `prisma generate` en backendSrc (ahí todo
//    resuelve bien, es donde vive normalmente) y después copiamos el
//    resultado generado (la carpeta `.prisma`) al @prisma/client de
//    deployDir — mismo efecto, sin tener que instalar el CLI completo ahí.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const desktopRoot = path.join(__dirname, '..');
const repoRoot = path.join(desktopRoot, '..', '..');
const backendSrc = path.join(repoRoot, 'apps', 'backend');
const buildDir = path.join(desktopRoot, 'build');
const finalDir = path.join(buildDir, 'backend');

function run(cmd, args, cwd, extraEnv, useShell) {
  console.log(`[prepare-backend] $ ${cmd} ${args.join(' ')} (cwd: ${cwd})`);
  execFileSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    // shell:true es necesario para 'pnpm' (en Windows resuelve vía pnpm.CMD
    // en el PATH), pero rompe la invocación directa de process.execPath
    // porque cmd.exe no cita el path del ejecutable si tiene espacios
    // (ej. "C:\Program Files\nodejs\node.exe" se parte en dos tokens).
    shell: !!useShell,
    env: { ...process.env, ...extraEnv },
  });
}

function main() {
  if (!fs.existsSync(path.join(backendSrc, 'dist', 'main.js'))) {
    console.error(
      '[prepare-backend] No existe apps/backend/dist/main.js. ' +
        'Corré "pnpm build:backend" antes de esto.',
    );
    process.exit(1);
  }

  fs.mkdirSync(buildDir, { recursive: true });
  fs.rmSync(finalDir, { recursive: true, force: true });

  // --prod: excluye devDependencies (jest, eslint, ts-node, etc.) del paquete
  // final. El "files" en apps/backend/package.json (dist, prisma,
  // prisma.config.ts) controla qué archivos propios del backend se copian —
  // sin eso, pnpm deploy cae al .gitignore de la RAÍZ del monorepo, que no
  // aplica a subcarpetas sin su propio .gitignore, y terminaría copiando
  // dev.db y storage/ (datos locales del desarrollador) al instalador.
  //
  // --config.node-linker=hoisted: ver comentario arriba (punto 2) — sin
  // esto, pnpm deploy usa symlinks y rompe la resolución de dependencias
  // privadas como tslib. Con hoisted, el resultado es un node_modules plano
  // y ya queda listo para empaquetar directo, sin paso de aplanado aparte.
  run(
    'pnpm',
    ['--config.node-linker=hoisted', '--filter=backend', 'deploy', '--prod', finalDir],
    repoRoot,
    undefined,
    true,
  );

  const prismaCli = path.join(backendSrc, 'node_modules', 'prisma', 'build', 'index.js');
  if (!fs.existsSync(prismaCli)) {
    console.error(
      `[prepare-backend] No encontré el CLI de Prisma en ${prismaCli}. ` +
        'Revisar si cambió la estructura del paquete "prisma" en la ' +
        'versión instalada, o si falta "pnpm install" en la raíz.',
    );
    process.exit(1);
  }
  // prisma generate necesita poder resolver DATABASE_URL en prisma.config.ts
  // (usa env('DATABASE_URL')) aunque "generate" no se conecta a ninguna DB —
  // backendSrc ya tiene un .env real con DATABASE_URL, así que no hace falta
  // un valor dummy acá (a diferencia de si corriéramos esto en deployDir).
  run(process.execPath, [prismaCli, 'generate', '--config', 'prisma.config.ts'], backendSrc);

  // @prisma/client/default.js hace require('.prisma/client/default') — un
  // specifier sin "./" se resuelve como paquete, así que Node lo busca
  // subiendo por node_modules desde @prisma/client. `prisma generate` deja
  // la carpeta ".prisma" como HERMANA de "@prisma" (mismo node_modules que
  // contiene a @prisma/client), no anidada dentro de @prisma/client — hay
  // que copiar esa carpeta ".prisma", no algo dentro de @prisma/client.
  const clientDirSrc = path.dirname(
    require.resolve('@prisma/client/package.json', { paths: [backendSrc] }),
  );
  const clientDirDest = path.dirname(
    require.resolve('@prisma/client/package.json', { paths: [finalDir] }),
  );
  const nodeModulesDirSrc = path.dirname(path.dirname(clientDirSrc)); // .../node_modules/@prisma/client -> .../node_modules
  const nodeModulesDirDest = path.dirname(path.dirname(clientDirDest));
  const generatedSrc = path.join(nodeModulesDirSrc, '.prisma');
  const generatedDest = path.join(nodeModulesDirDest, '.prisma');
  if (!fs.existsSync(generatedSrc)) {
    console.error(
      `[prepare-backend] "prisma generate" no escribió el output esperado en ${generatedSrc}.`,
    );
    process.exit(1);
  }
  fs.cpSync(generatedSrc, generatedDest, { recursive: true, dereference: true });
  console.log(`[prepare-backend] Cliente generado copiado a: ${generatedDest}`);

  console.log(`[prepare-backend] Backend listo para empaquetar en: ${finalDir}`);
}

main();
