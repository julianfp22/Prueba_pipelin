import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductosPage } from '../pages/ProductosPage';
import { MENSAJE_USUARIO_REQUERIDO } from '../data/credenciales';

test('CP-07 Pedir el usuario cuando ambos campos están vacíos', async ({ page }) => {
  const login = new LoginPage(page);
  const productos = new ProductosPage(page);

  // Paso 1: Abrir en el navegador la dirección https://www.saucedemo.com/
  await login.abrir();

  // Paso 2: En la pantalla de inicio de sesión, en el campo «Username» no escribir nada
  await expect(login.usuario).toHaveValue('');

  // Paso 3: En la pantalla de inicio de sesión, en el campo «Password» no escribir nada
  await expect(login.contrasena).toHaveValue('');

  // Paso 4: En la pantalla de inicio de sesión, pulsar el botón «Login»
  await login.pulsarLogin();

  // Paso 5: En la misma pantalla, leer el mensaje de error
  await expect(login.mensajeError).toBeVisible();

  // Esperado: Se sigue viendo la pantalla de inicio de sesión, con los campos «Username» y «Password» y el botón «Login»
  await expect(login.usuario).toBeVisible();
  await expect(login.contrasena).toBeVisible();
  await expect(login.botonLogin).toBeVisible();

  // Esperado: El mensaje es exactamente «Epic sadface: Username is required»
  await expect(login.mensajeError).toHaveText(MENSAJE_USUARIO_REQUERIDO);

  // Esperado: No se ve el mensaje «Epic sadface: Password is required»
  await expect(login.mensajeError).not.toContainText('Password is required');

  // Esperado: No se abre la página de productos y no se ve el título «Products»
  await expect(page).not.toHaveURL(/inventory\.html/);
  await expect(productos.titulo).toHaveCount(0);
});
