import type { Page, Locator } from '@playwright/test';
import { PaginaBase } from '../../../../core/PaginaBase';

export class LoginPage extends PaginaBase {
  readonly usuario: Locator;
  readonly contrasena: Locator;
  readonly botonLogin: Locator;
  readonly mensajeError: Locator;

  constructor(page: Page) {
    super(page);
    this.usuario = page.getByRole('textbox', { name: 'Username' });
    this.contrasena = page.getByRole('textbox', { name: 'Password' });
    this.botonLogin = page.getByRole('button', { name: 'Login' });
    this.mensajeError = page.locator('[data-test="error"]');
  }

  async escribirUsuario(valor: string) {
    await this.usuario.fill(valor);
  }

  async escribirContrasena(valor: string) {
    await this.contrasena.fill(valor);
  }

  async pulsarLogin() {
    await this.botonLogin.click();
  }
}
