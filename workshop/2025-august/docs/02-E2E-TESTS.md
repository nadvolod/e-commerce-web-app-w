# Module 2: End-to-End Testing

## Overview

This module covers comprehensive end-to-end (E2E) testing strategies for our e-commerce web application using modern testing frameworks.

## Learning Objectives

- Implement comprehensive E2E testing strategies
- Set up Playwright for browser automation
- Create realistic user journey tests
- Handle complex e-commerce scenarios

## Why E2E Testing Matters

E2E testing ensures your entire application works together:
- Validates complete user workflows
- Catches integration issues
- Tests real browser behavior
- Provides confidence in releases

## Testing Framework: Playwright

We'll use Playwright for its excellent features:
- Cross-browser testing (Chrome, Firefox, Safari)
- Fast and reliable execution
- Built-in waiting strategies
- Rich debugging tools

### Installation

```bash
npm install @playwright/test
npx playwright install
```

### Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

## E-Commerce Test Scenarios

### 1. User Registration and Login

```typescript
test('user can register and login', async ({ page }) => {
  // Navigate to registration
  await page.goto('/register');
  
  // Fill registration form
  await page.fill('[data-testid=email]', 'user@example.com');
  await page.fill('[data-testid=password]', 'SecurePass123');
  await page.click('[data-testid=register-button]');
  
  // Verify successful registration
  await expect(page).toHaveURL('/dashboard');
});
```

### 2. Product Search and Filtering

```typescript
test('user can search and filter products', async ({ page }) => {
  await page.goto('/products');
  
  // Search for products
  await page.fill('[data-testid=search-input]', 'laptop');
  await page.press('[data-testid=search-input]', 'Enter');
  
  // Apply filters
  await page.check('[data-testid=filter-brand-apple]');
  await page.selectOption('[data-testid=price-range]', '$1000-2000');
  
  // Verify filtered results
  await expect(page.locator('[data-testid=product-card]')).toHaveCount(5);
});
```

### 3. Shopping Cart Workflow

```typescript
test('complete shopping cart workflow', async ({ page }) => {
  // Add items to cart
  await page.goto('/products/laptop-123');
  await page.click('[data-testid=add-to-cart]');
  
  // Verify cart badge updates
  await expect(page.locator('[data-testid=cart-badge]')).toHaveText('1');
  
  // Go to cart
  await page.click('[data-testid=cart-link]');
  
  // Update quantity
  await page.fill('[data-testid=quantity-input]', '2');
  
  // Proceed to checkout
  await page.click('[data-testid=checkout-button]');
  
  // Verify checkout page
  await expect(page).toHaveURL('/checkout');
});
```

### 4. Payment Processing

```typescript
test('user can complete payment', async ({ page }) => {
  // Setup: Add item to cart and go to checkout
  await page.goto('/checkout');
  
  // Fill shipping information
  await page.fill('[data-testid=shipping-name]', 'John Doe');
  await page.fill('[data-testid=shipping-address]', '123 Main St');
  
  // Fill payment information (using test data)
  await page.fill('[data-testid=card-number]', '4111111111111111');
  await page.fill('[data-testid=card-expiry]', '12/25');
  await page.fill('[data-testid=card-cvc]', '123');
  
  // Submit order
  await page.click('[data-testid=place-order]');
  
  // Verify success page
  await expect(page.locator('[data-testid=order-confirmation]')).toBeVisible();
});
```

## Advanced Testing Techniques

### Page Object Model

```typescript
class ProductPage {
  constructor(private page: Page) {}
  
  async addToCart() {
    await this.page.click('[data-testid=add-to-cart]');
  }
  
  async selectSize(size: string) {
    await this.page.selectOption('[data-testid=size-select]', size);
  }
}
```

### Test Data Management

```typescript
// fixtures/test-data.ts
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'SecurePass123'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPass456'
  }
};
```

### API Testing Integration

```typescript
test('verify order in backend', async ({ request }) => {
  const response = await request.get('/api/orders/latest');
  expect(response.status()).toBe(200);
  
  const order = await response.json();
  expect(order.status).toBe('confirmed');
});
```

## Best Practices

1. **Use Data Test IDs**: Always use `data-testid` for reliable element selection
2. **Wait Strategies**: Use Playwright's built-in waiting mechanisms
3. **Test Isolation**: Each test should be independent
4. **Realistic Data**: Use realistic test data and scenarios
5. **Environment Management**: Separate test environments from production

## Exercise

Navigate to `../exercises/exercise-2/` to implement E2E tests for your e-commerce application.

## Next Steps

Continue to [03-CI-CD-PIPELINE.md](./03-CI-CD-PIPELINE.md) to learn about setting up continuous integration and deployment.
