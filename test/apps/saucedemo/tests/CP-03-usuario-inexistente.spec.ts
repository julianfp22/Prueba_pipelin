import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductosPage } from '../pages/ProductosPage';
import { MENSAJE_CREDENCIALES } from '../data/credenciales';

test('CP-03 Mostrar el mismo mensaje de credenciales incorrectas con un usuario que no existe', async ({ page }) => {
  const login = new LoginPage(page);
  const productos = new ProductosPage(page);

  // Paso 1: Abrir en el navegador la dirección https://www.saucedemo.com/
  await login.abrir();

  // Paso 2: En la pantalla de inicio de sesión, escribir en el campo «Username» el valor usuario_inexistente
  await login.escribirUsuario('usuario_inexistente');

  // Paso 3: En la pantalla de inicio de sesión, escribir en el campo «Password» el valor secret_sauce
  await login.escribirContrasena('secret_sauce');

  // Paso 4: En la pantalla de inicio de sesión, pulsar el botón «Login»
  await login.pulsarLogin();

  // Paso 5: En la misma pantalla, leer el mensaje de error
  await expect(login.mensajeError).toBeVisible();

  // Esperado: Se sigue viendo la pantalla de inicio de sesión, con los campos «Username» y «Password» y el botón «Login»
  await expect(login.usuario).toBeVisible();
  await expect(login.contrasena).toBeVisible();
  await expect(login.botonLogin).toBeVisible();

  // Esperado: El mensaje es exactamente «Epic sadface: Username and password do not match any user in this service», el mismo que con contraseña incorrecta
  await expect(login.mensajeError).toHaveText(MENSAJE_CREDENCIALES);

  // Esperado: El mensaje no indica si el usuario o la contraseña es el dato que falló
  await expect(login.mensajeError).not.toHaveText(/usuario_inexistente|Username is required|Password is required/);

  // Esperado: No se abre la página de productos y no se ve el título «Products»
  await expect(page).not.toHaveURL(/inventory\.html/);
  await expect(productos.titulo).toHaveCount(0);
});
