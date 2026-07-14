import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Necesario en un monorepo pnpm: sin esto, el tracing de archivos de Next
  // (usado para las funciones server/API incluso sin output:'standalone')
  // puede no encontrar correctamente las dependencias de los workspaces
  // (@codeex/shared, etc.) y tira un warning de "workspace root inferido".
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
