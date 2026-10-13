import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

// Al terminar cada ejecución regenera salida/<historia>/<historia>_Automatizacion.xlsx (uno por historia)
// con los resultados reales (llama a herramientas/excel_resultado.py).
type Opciones = { historia: string; patron: string };
type Fila = { id: string; archivo: string; estado: string; clasificacion: string; detalle: string; evidencia: string };

const PESO: Record<string, number> = { Pasa: 0, Bloqueado: 1, Falla: 2 };

type Grupo = { filas: Map<string, Fila>; apps: Set<string> };

// La historia de un caso es la subcarpeta de tests/ donde está (tests/<historia>/CP-01.spec.ts).
// Los casos que están directo en tests/ usan la historia de las opciones.
function historiaDe(test: TestCase, porDefecto: string): string {
  const testDir = test.parent.project()?.testDir;
  if (!testDir) return porDefecto;
  const [primero, ...resto] = path.relative(testDir, test.location.file).split(path.sep);
  return resto.length ? primero : porDefecto;
}

export default class ReporteExcel implements Reporter {
  private grupos = new Map<string, Grupo>();

  constructor(private opciones: Opciones) {}

  onTestEnd(test: TestCase, result: TestResult) {
    const id = test.title.match(/^(CP-\d+)/)?.[1];
    if (!id) return;
    const app = test.parent.project()?.name ?? '';
    const historia = historiaDe(test, this.opciones.historia);
    const grupo = this.grupos.get(historia) ?? { filas: new Map(), apps: new Set() };
    this.grupos.set(historia, grupo);
    grupo.apps.add(app);
    const estado = result.status === 'passed' ? 'Pasa' : result.status === 'skipped' ? 'Bloqueado' : 'Falla';
    // Un fallo ya analizado se documenta en el propio test: test(titulo, { annotation: [{ type: 'clasificacion', ... }, { type: 'detalle', ... }] }, ...)
    const nota = (tipo: string) => (estado === 'Falla' ? test.annotations.find((a) => a.type === tipo)?.description : undefined);
    const fila: Fila = {
      id,
      archivo: path.basename(test.location.file),
      estado,
      clasificacion: nota('clasificacion') || '-',
      detalle: estado === 'Pasa' ? 'Todos los pasos y resultados esperados se cumplieron' : nota('detalle') || (result.error?.message ?? 'Sin ejecutar').replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0],
      evidencia: result.attachments.map((a) => a.path).filter(Boolean).join('\n'),
    };
    const clave = `${app}::${id}`; // el mismo CP-01 en dos aplicaciones no se pisa
    const previa = grupo.filas.get(clave);
    if (!previa || PESO[estado] >= PESO[previa.estado]) grupo.filas.set(clave, fila);
  }

  onEnd(_: FullResult) {
    // --list o corrida sin casos CP-: no hay grupos y no se pisa ningún Excel existente.
    for (const [historia, grupo] of this.grupos) this.escribir(historia, grupo);
  }

  private escribir(historia: string, { filas, apps }: Grupo) {
    const raiz = path.resolve(__dirname, '..', '..');
    const aplicacion = [...apps][0] ?? '';
    const comando = `npx playwright test --project=${aplicacion}`;
    // Con una sola aplicación el ID queda igual; con varias se antepone la app para distinguirlos.
    const varias = apps.size > 1;
    const resultados = [...filas.entries()]
      .map(([clave, f]) => (varias ? { ...f, id: `${clave.split('::')[0]}/${f.id}` } : f))
      .sort((a, b) => a.id.localeCompare(b.id));
    const carpeta = path.join(tmpdir(), 'agente-automatizador', historia);
    mkdirSync(carpeta, { recursive: true });
    writeFileSync(
      path.join(carpeta, 'automatizacion.json'),
      JSON.stringify({ historia: { id: historia, titulo: '' }, aplicacion, patron: this.opciones.patron, framework: `framework/test/apps/${aplicacion}`, comando, resultados }),
      'utf-8',
    );
    try {
      execFileSync('python', [path.join(raiz, 'herramientas', 'excel_resultado.py'), historia], { cwd: raiz, stdio: 'inherit' });
    } catch (e) {
      console.error(`No se pudo regenerar el Excel de ${historia}:`, (e as Error).message);
    }
  }
}
