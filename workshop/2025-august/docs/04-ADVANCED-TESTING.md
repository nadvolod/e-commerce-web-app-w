# Module 4: Advanced Testing Strategies

## Overview

This module explores advanced testing techniques and strategies to ensure robust, maintainable, and comprehensive test coverage for our e-commerce web application.

## Learning Objectives

- Implement advanced testing patterns and techniques
- Use property-based testing for edge case discovery
- Set up visual regression testing
- Implement performance testing strategies
- Create comprehensive test data management
- Understand testing in production

## Advanced Testing Patterns

### 1. Property-Based Testing

Property-based testing generates random test inputs to discover edge cases:

```typescript
import { fc } from 'fast-check';

// Test that cart total calculation is always correct
describe('Cart calculations', () => {
  test('total price should equal sum of item prices', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        price: fc.float({ min: 0.01, max: 1000 }),
        quantity: fc.integer({ min: 1, max: 10 })
      })),
      (items) => {
        const cart = new ShoppingCart(items);
        const expectedTotal = items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );
        expect(cart.getTotal()).toBeCloseTo(expectedTotal, 2);
      }
    ));
  });
});
```

### 2. Contract Testing

Ensure API compatibility between frontend and backend:

```typescript
// Using Pact for contract testing
import { Pact } from '@pact-foundation/pact';

const provider = new Pact({
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2,
  consumer: 'e-commerce-frontend',
  provider: 'e-commerce-api'
});

describe('Product API Contract', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  test('should get product details', async () => {
    await provider.addInteraction({
      state: 'product exists',
      uponReceiving: 'a request for product details',
      withRequest: {
        method: 'GET',
        path: '/api/products/123',
        headers: {
          'Accept': 'application/json'
        }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          id: '123',
          name: 'Test Product',
          price: 29.99
        }
      }
    });

    const product = await productApi.getProduct('123');
    expect(product.name).toBe('Test Product');
  });
});
```

### 3. Mutation Testing

Test the quality of your tests by introducing mutations:

```typescript
// Using Stryker for mutation testing
module.exports = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js'
  },
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  }
};
```

## Visual Regression Testing

### Using Playwright for Visual Testing

```typescript
// tests/visual/product-page.spec.ts
import { test, expect } from '@playwright/test';

test('product page visual regression', async ({ page }) => {
  await page.goto('/products/laptop-123');
  
  // Wait for images to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot and compare
  await expect(page).toHaveScreenshot('product-page.png');
});

test('responsive design across devices', async ({ page }) => {
  const viewports = [
    { width: 1920, height: 1080 },  // Desktop
    { width: 768, height: 1024 },   // Tablet
    { width: 375, height: 667 }     // Mobile
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/products');
    await expect(page).toHaveScreenshot(`products-${viewport.width}x${viewport.height}.png`);
  }
});
```

### Configuring Visual Testing

```typescript
// playwright.config.ts
export default defineConfig({
  expect: {
    // Threshold for pixel differences
    threshold: 0.2,
    // Threshold for the number of pixels that can differ
    toHaveScreenshot: { threshold: 0.2 }
  },
  projects: [
    {
      name: 'visual-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Disable animations for consistent screenshots
        reducedMotion: 'reduce'
      }
    }
  ]
});
```

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"

scenarios:
  - name: "Browse products"
    weight: 60
    flow:
      - get:
          url: "/products"
      - think: 2
      - get:
          url: "/products/{{ $randomInt(1, 100) }}"
      - think: 3

  - name: "Shopping workflow"
    weight: 40
    flow:
      - post:
          url: "/api/cart/add"
          json:
            productId: "{{ $randomInt(1, 100) }}"
            quantity: "{{ $randomInt(1, 5) }}"
      - get:
          url: "/cart"
      - post:
          url: "/api/checkout"
          json:
            paymentMethod: "test"
```

### Performance Monitoring in Tests

```typescript
// tests/performance/metrics.spec.ts
import { test, expect } from '@playwright/test';

test('page load performance', async ({ page }) => {
  // Start performance timing
  const startTime = Date.now();
  
  await page.goto('/products');
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  
  // Assert page loads within acceptable time
  expect(loadTime).toBeLessThan(3000);
  
  // Check Core Web Vitals
  const vitals = await page.evaluate(() => ({
    LCP: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
    FID: performance.getEntriesByType('first-input')[0]?.processingStart,
    CLS: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0)
  }));
  
  expect(vitals.LCP).toBeLessThan(2500);
  expect(vitals.CLS).toBeLessThan(0.1);
});
```

## Test Data Management

### Test Data Builder Pattern

```typescript
// utils/test-builders.ts
class ProductBuilder {
  private product: Partial<Product> = {};

  withId(id: string): ProductBuilder {
    this.product.id = id;
    return this;
  }

  withName(name: string): ProductBuilder {
    this.product.name = name;
    return this;
  }

  withPrice(price: number): ProductBuilder {
    this.product.price = price;
    return this;
  }

  inStock(quantity: number = 10): ProductBuilder {
    this.product.stock = quantity;
    this.product.available = true;
    return this;
  }

  outOfStock(): ProductBuilder {
    this.product.stock = 0;
    this.product.available = false;
    return this;
  }

  build(): Product {
    return {
      id: this.product.id || generateId(),
      name: this.product.name || 'Test Product',
      price: this.product.price || 29.99,
      stock: this.product.stock || 10,
      available: this.product.available !== undefined ? this.product.available : true,
      ...this.product
    };
  }
}

// Usage in tests
const expensiveProduct = new ProductBuilder()
  .withName('Premium Laptop')
  .withPrice(1999.99)
  .inStock(5)
  .build();
```

### Database Seeding and Cleanup

```typescript
// utils/test-database.ts
export class TestDatabase {
  async seed(): Promise<void> {
    // Clear existing data
    await this.cleanup();
    
    // Seed with test data
    const products = [
      new ProductBuilder().withName('Laptop').withPrice(999).build(),
      new ProductBuilder().withName('Mouse').withPrice(29.99).build(),
      new ProductBuilder().withName('Keyboard').withPrice(79.99).build()
    ];
    
    await Product.insertMany(products);
    
    // Create test users
    const users = [
      { email: 'test@example.com', password: 'hashedpassword' },
      { email: 'admin@example.com', password: 'hashedpassword', role: 'admin' }
    ];
    
    await User.insertMany(users);
  }

  async cleanup(): Promise<void> {
    await Promise.all([
      Product.deleteMany({}),
      User.deleteMany({}),
      Order.deleteMany({})
    ]);
  }
}

// Setup and teardown
beforeEach(async () => {
  await testDb.seed();
});

afterEach(async () => {
  await testDb.cleanup();
});
```

## Testing in Production

### Feature Flags for Testing

```typescript
// utils/feature-flags.ts
export class FeatureFlags {
  static isEnabled(flag: string, userId?: string): boolean {
    // In test environment, control via environment variables
    if (process.env.NODE_ENV === 'test') {
      return process.env[`FEATURE_${flag.toUpperCase()}`] === 'true';
    }
    
    // In production, use sophisticated feature flag service
    return this.checkRemoteFlag(flag, userId);
  }
}

// Component with feature flag
const CheckoutPage = () => {
  const showNewPaymentFlow = FeatureFlags.isEnabled('NEW_PAYMENT_FLOW', user.id);
  
  return (
    <div>
      {showNewPaymentFlow ? <NewPaymentForm /> : <LegacyPaymentForm />}
    </div>
  );
};

// Test both variations
test('checkout with legacy payment flow', async ({ page }) => {
  await page.addInitScript(() => {
    window.ENV = { FEATURE_NEW_PAYMENT_FLOW: 'false' };
  });
  
  await page.goto('/checkout');
  await expect(page.locator('[data-testid=legacy-payment]')).toBeVisible();
});

test('checkout with new payment flow', async ({ page }) => {
  await page.addInitScript(() => {
    window.ENV = { FEATURE_NEW_PAYMENT_FLOW: 'true' };
  });
  
  await page.goto('/checkout');
  await expect(page.locator('[data-testid=new-payment]')).toBeVisible();
});
```

### Canary Testing

```typescript
// tests/canary/smoke-tests.spec.ts
test('production smoke tests', async ({ page }) => {
  // Test critical user journeys in production
  const tests = [
    { name: 'homepage loads', url: '/', selector: '[data-testid=hero]' },
    { name: 'products page loads', url: '/products', selector: '[data-testid=product-grid]' },
    { name: 'search works', url: '/search?q=laptop', selector: '[data-testid=search-results]' }
  ];

  for (const { name, url, selector } of tests) {
    await test.step(name, async () => {
      await page.goto(url);
      await expect(page.locator(selector)).toBeVisible({ timeout: 10000 });
    });
  }
});
```

### Real User Monitoring (RUM)

```typescript
// utils/rum-testing.ts
export class RUMCollector {
  static collectMetrics(): void {
    // Collect real user metrics
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.sendMetric('page_load_time', entry.loadEventEnd - entry.loadEventStart);
        }
        if (entry.entryType === 'largest-contentful-paint') {
          this.sendMetric('lcp', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });
  }

  private static sendMetric(name: string, value: number): void {
    // Send to analytics service
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify({ name, value, timestamp: Date.now() })
    });
  }
}
```

## Test Reporting and Analytics

### Custom Test Reporter

```typescript
// utils/custom-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class CustomReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    const metrics = {
      testName: test.title,
      duration: result.duration,
      status: result.status,
      errors: result.errors,
      attachments: result.attachments.map(a => a.name)
    };

    // Send to analytics dashboard
    this.sendToAnalytics(metrics);
  }

  private sendToAnalytics(metrics: any): void {
    // Implementation to send metrics to your analytics service
    console.log('Test metrics:', JSON.stringify(metrics, null, 2));
  }
}

export default CustomReporter;
```

## Best Practices

1. **Test Pyramid**: Maintain appropriate balance of unit, integration, and E2E tests
2. **Fast Feedback**: Prioritize fast-running tests for quick feedback
3. **Test Independence**: Each test should be able to run independently
4. **Data Isolation**: Use separate test data to avoid test interference
5. **Meaningful Assertions**: Write clear, specific assertions
6. **Test Maintenance**: Regularly review and update tests
7. **Production Testing**: Implement safe testing strategies in production

## Exercise

Implement advanced testing strategies by:

1. Adding property-based tests for critical functions
2. Setting up visual regression testing
3. Creating performance benchmarks
4. Implementing test data builders
5. Adding monitoring and reporting

## Next Steps

Continue to [05-CONCLUSIONS.md](./05-CONCLUSIONS.md) for workshop conclusions and next steps.
