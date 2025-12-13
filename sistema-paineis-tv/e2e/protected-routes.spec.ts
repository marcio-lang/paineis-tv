import { test, expect } from '@playwright/test';

const routes = ['/paineis', '/acoes', '/usuarios', '/departamentos', '/profile', '/settings'];

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin@paineltv.com').fill('admin@paineltv.com');
  await page.getByPlaceholder('Digite sua senha').fill('admin123');
  await page.click('button:has-text("Entrar")');
  await expect(page).toHaveURL(/\/$/);
});

for (const path of routes) {
  test(`Acessa ${path} após login`, async ({ page }) => {
    await page.goto(path);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/')));
  });
}
