import { defineConfig } from '@playwright/test';
import { cargarProjects } from './core/aplicaciones';

const CI = !!process.env.CI;

export default defineConfig({
  fullyParallel: true,
  forbidOnly: CI,
  retries: Number(process.env.RETRIES) || (CI ? 1 : 0),
  workers: Number(process.env.WORKERS) || (CI ? 4 : 3),
  timeout: Number(process.env.TIMEOUT) || 30_000,
  reporter: [
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
