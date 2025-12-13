import { test, expect } from '@playwright/test';

test('Login básico redireciona para Home', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin@paineltv.com').fill('admin@paineltv.com');
  await page.getByPlaceholder('Digite sua senha').fill('admin123');
  await page.click('button:has-text("Entrar")');
  await expect(page).toHaveURL(/\/$/);
});
