import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductosPage } from '../pages/ProductosPage';

test('CP-01 Entrar a la página de productos con usuario y contraseña válidos', async ({ page }) => {
  const login = new LoginPage(page);
  const productos = new ProductosPage(page);

  // Paso 1: Abrir en el navegador la dirección https://www.saucedemo.com/
  await login.abrir();

  // Paso 2: En la pantalla de inicio de sesión, escribir en el campo «Username» el valor standard_user
  await login.escribirUsuario('standard_user');

  // Paso 3: En la pantalla de inicio de sesión, escribir en el campo «Password» el valor secret_sauce
  await login.escribirContrasena('secret_sauce');

  // Paso 4: En la pantalla de inicio de sesión, pulsar el botón «Login»
  await login.pulsarLogin();

  // Paso 5: En la página que se abre, leer el título y la lista de productos
  await expect(productos.titulo).toBeVisible();

  // Esperado: Se abre la página de productos
  await expect(page).toHaveURL(/inventory\.html/);

  // Esperado: El título de la página es «Products»
  await expect(productos.titulo).toHaveText('Products');

  // Esperado: Se ve la lista de productos
  await expect(productos.productos.first()).toBeVisible();

  // Esperado: Ya no se ve la pantalla de inicio de sesión
  await expect(login.botonLogin).toBeHidden();
});
