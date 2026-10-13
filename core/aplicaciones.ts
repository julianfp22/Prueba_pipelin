import { devices, type PlaywrightTestProject } from '@playwright/test';
import { existsSync, readdirSync } from 'fs';
import path from 'path';

// Cada aplicación declara sus URLs en test/apps/<app>/app.ts. Aquí se descubren solas,
// así que agregar una aplicación no obliga a editar playwright.config.ts.
export type DefinicionApp = { urls: Record<string, string> };

const AMBIENTE = (process.env.AMBIENTE || 'qa').toLowerCase();
const RAIZ_APPS = path.resolve(__dirname, '..', 'test', 'apps');

// URL_<APP> (ej. URL_SAUCEDEMO) reemplaza la del archivo, útil para ambientes efímeros o URLs privadas.
function resolverUrl(app: string, definicion: DefinicionApp): string | undefined {
  return process.env[`URL_${app.toUpperCase().replace(/\W/g, '_')}`] ?? definicion.urls[AMBIENTE];
}

export function cargarProjects(): PlaywrightTestProject[] {
  const lista = process.env.APPS?.split(',').map((a) => a.trim()).filter(Boolean);
  const solicitadas = lista?.length ? lista : undefined; // APPS vacío = todas las aplicaciones
  return readdirSync(RAIZ_APPS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(RAIZ_APPS, d.name, 'app.ts')))
    .filter((d) => !solicitadas || solicitadas.includes(d.name))
    .flatMap((d) => {
      const definicion: DefinicionApp = require(path.join(RAIZ_APPS, d.name, 'app.ts')).default;
      const url = resolverUrl(d.name, definicion);
      if (!url) {
        // Pedida explícitamente: error. En una corrida general se omite para no frenar a las demás.
        if (solicitadas) throw new Error(`"${d.name}" no tiene URL para el ambiente "${AMBIENTE}" (test/apps/${d.name}/app.ts o URL_${d.name.toUpperCase()}).`);
        console.warn(`[aplicaciones] "${d.name}" omitida: sin URL para el ambiente "${AMBIENTE}".`);
        return [];
      }
      return [{
        name: d.name,
        testDir: path.join(RAIZ_APPS, d.name, 'tests'),
        use: {
          ...devices['Desktop Chrome'],
          viewport: null,
          deviceScaleFactor: undefined,
          launchOptions: { args: ['--start-maximized'] },
          baseURL: url,
        },
      }];
    });
}
