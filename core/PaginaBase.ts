import type { Page } from '@playwright/test';

// Acciones comunes a todo Page Object de cualquier aplicación. Una mejora aquí
// (esperas, manejo de errores) llega a todas las apps sin repetirla.
export abstract class PaginaBase {
  constructor(protected readonly page: Page) {}

  async abrir(ruta = '/') {
    await this.page.goto(ruta);
  }

  async recargar() {
    await this.page.reload();
  }
}
