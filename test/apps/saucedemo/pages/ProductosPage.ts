import type { Page, Locator } from '@playwright/test';
import { PaginaBase } from '../../../../core/PaginaBase';

export class ProductosPage extends PaginaBase {
  readonly titulo: Locator;
  readonly productos: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.locator('[data-test="title"]');
    this.productos = page.locator('[data-test="inventory-item"]');
  }
}
