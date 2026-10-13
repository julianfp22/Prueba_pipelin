import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductosPage } from '../pages/ProductosPage';

test('CP-08 Llevar al inicio de sesión al abrir la página de productos sin haber iniciado sesión', async ({ page }) => {
  const login = new LoginPage(page);
  const productos = new ProductosPage(page);

  // Paso 1: Abrir en el navegador la dirección https://www.saucedemo.com/inventory.html
  await login.abrir('/inventory.html');

  // Paso 2: Mirar la pantalla que se muestra
  await expect(login.botonLogin).toBeVisible();

  // Esperado: Se ve la pantalla de inicio de sesión, con los campos «Username» y «Password» y el botón «Login»
  await expect(login.usuario).toBeVisible();
  await expect(login.contrasena).toBeVisible();
  await expect(login.botonLogin).toBeVisible();

  // Esperado: No se ve el título «Products»
  await expect(productos.titulo).toHaveCount(0);

  // Esperado: No se ve la lista de productos
  await expect(productos.productos).toHaveCount(0);
});
