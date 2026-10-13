import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductosPage } from '../pages/ProductosPage';
import { MENSAJE_CREDENCIALES } from '../data/credenciales';

test('CP-02 Rechazar el acceso con usuario registrado y contraseña incorrecta', async ({ page }) => {
  const login = new LoginPage(page);
  const productos = new ProductosPage(page);

  // Paso 1: Abrir en el navegador la dirección https://www.saucedemo.com/
  await login.abrir();

  // Paso 2: En la pantalla de inicio de sesión, escribir en el campo «Username» el valor standard_user
  await login.escribirUsuario('standard_user');

  // Paso 3: En la pantalla de inicio de sesión, escribir en el campo «Password» el valor clave_erronea
  await login.escribirContrasena('clave_erronea');

  // Paso 4: En la pantalla de inicio de sesión, pulsar el botón «Login»
  await login.pulsarLogin();

  // Paso 5: En la misma pantalla, leer el mensaje de error
  await expect(login.mensajeError).toBeVisible();

  // Esperado: Se sigue viendo la pantalla de inicio de sesión, con los campos «Username» y «Password» y el botón «Login»
  await expect(login.usuario).toBeVisible();
  await expect(login.contrasena).toBeVisible();
  await expect(login.botonLogin).toBeVisible();

  // Esperado: El mensaje es exactamente «Epic sadface: Username and password do not match any user in this service»
  await expect(login.mensajeError).toHaveText(MENSAJE_CREDENCIALES);

  // Esperado: No se abre la página de productos y no se ve el título «Products»
  await expect(page).not.toHaveURL(/inventory\.html/);
  await expect(productos.titulo).toHaveCount(0);
});
