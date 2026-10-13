import { defineConfig } from '@playwright/test';
import { cargarProjects } from './core/aplicaciones';

const CI = !!process.env.CI;

export default defineConfig({
  fullyParallel: true,
  forbidOnly: CI,
  retries: Number(process.env.RETRIES) || (CI ? 1 : 0),
  workers: Number(process.env.WORKERS) || (CI ? 4 : 3),
  timeout: Number(process.env.TIMEOUT) || 30_000,
  // Con shards (BLOB_REPORT=true) cada máquina guarda solo un blob; un job final los une en un único reporte HTML.
  reporter: process.env.BLOB_REPORT
    ? [['list'], ['blob']]
    : [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['./core/reporte-excel.ts', { historia: process.env.HISTORIA || 'entrada', patron: 'Page Object Model' }],
      ],
  use: {
    headless: CI || process.env.HEADLESS === 'true',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: cargarProjects(),
});
