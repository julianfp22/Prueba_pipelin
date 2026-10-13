import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductosPage } from '../pages/ProductosPage';
import { MENSAJE_CREDENCIALES } from '../data/credenciales';

test('CP-04 Rechazar usuario o contraseña escritos con mayúsculas distintas a las registradas', async ({ page }) => {
  const login = new LoginPage(page);
  const productos = new ProductosPage(page);

  // Paso 1: Abrir en el navegador la dirección https://www.saucedemo.com/
  await login.abrir();

  // Paso 2: En la pantalla de inicio de sesión, escribir en el campo «Username» el valor STANDARD_USER
  await login.escribirUsuario('STANDARD_USER');

  // Paso 3: En la pantalla de inicio de sesión, escribir en el campo «Password» el valor secret_sauce
  await login.escribirContrasena('secret_sauce');

  // Paso 4: En la pantalla de inicio de sesión, pulsar el botón «Login»
  await login.pulsarLogin();

  // Paso 5: En la misma pantalla, leer el mensaje de error
  await expect(login.mensajeError).toBeVisible();

  // Esperado: Con el usuario STANDARD_USER y la contraseña secret_sauce: se sigue viendo la pantalla de inicio de sesión y el mensaje es exactamente «Epic sadface: Username and password do not match any user in this service»
  await expect(login.botonLogin).toBeVisible();
  await expect(login.mensajeError).toHaveText(MENSAJE_CREDENCIALES);

  // Esperado: Con el usuario STANDARD_USER y la contraseña secret_sauce: no se abre la página de productos y no se ve el título «Products»
  await expect(page).not.toHaveURL(/inventory\.html/);
  await expect(productos.titulo).toHaveCount(0);

  // Paso 6: Recargar la página con la tecla F5
  await login.recargar();

  // Paso 7: En la pantalla de inicio de sesión, escribir en el campo «Username» el valor standard_user
  await login.escribirUsuario('standard_user');

  // Paso 8: En la pantalla de inicio de sesión, escribir en el campo «Password» el valor SECRET_SAUCE
  await login.escribirContrasena('SECRET_SAUCE');

  // Paso 9: En la pantalla de inicio de sesión, pulsar el botón «Login»
  await login.pulsarLogin();

  // Paso 10: En la misma pantalla, leer el mensaje de error
  await expect(login.mensajeError).toBeVisible();

  // Esperado: Con el usuario standard_user y la contraseña SECRET_SAUCE: se sigue viendo la pantalla de inicio de sesión y el mensaje es exactamente «Epic sadface: Username and password do not match any user in this service»
  await expect(login.botonLogin).toBeVisible();
  await expect(login.mensajeError).toHaveText(MENSAJE_CREDENCIALES);

  // Esperado: Con el usuario standard_user y la contraseña SECRET_SAUCE: no se abre la página de productos y no se ve el título «Products»
  await expect(page).not.toHaveURL(/inventory\.html/);
  await expect(productos.titulo).toHaveCount(0);
});
