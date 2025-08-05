# Module 3: CI/CD Pipeline

## Overview

This module covers setting up a robust Continuous Integration and Continuous Deployment (CI/CD) pipeline for our e-commerce web application.

## Learning Objectives

- Understand CI/CD principles and benefits
- Set up automated testing in CI pipelines
- Configure deployment workflows
- Implement quality gates and monitoring
- Handle environment-specific configurations

## CI/CD Benefits

A well-designed CI/CD pipeline provides:
- **Automated Testing**: Run tests on every code change
- **Consistent Deployments**: Standardized deployment process
- **Fast Feedback**: Quick identification of issues
- **Risk Reduction**: Smaller, more frequent releases
- **Quality Assurance**: Automated quality checks

## GitHub Actions Setup

We'll use GitHub Actions for our CI/CD pipeline due to its excellent integration with GitHub repositories.

### Basic Workflow Structure

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## Multi-Stage Pipeline

### Stage 1: Code Quality and Unit Tests

```yaml
  code-quality:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint code
      run: npm run lint
    
    - name: Type check
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Stage 2: End-to-End Tests

```yaml
  e2e-tests:
    runs-on: ubuntu-latest
    needs: code-quality
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Build application
      run: npm run build
    
    - name: Start application
      run: npm run start &
      
    - name: Wait for application
      run: npx wait-on http://localhost:3000
    
    - name: Run Playwright tests
      run: npm run test:e2e
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

### Stage 3: Security Scanning

```yaml
  security-scan:
    runs-on: ubuntu-latest
    needs: code-quality
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Audit dependencies
      run: npm audit --audit-level=critical
    
    - name: Run CodeQL Analysis
      uses: github/codeql-action/init@v2
      with:
        languages: typescript, javascript
    
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

### Stage 4: Build and Deploy

```yaml
  deploy:
    runs-on: ubuntu-latest
    needs: [code-quality, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for production
      run: npm run build
      env:
        NODE_ENV: production
        VITE_API_URL: ${{ secrets.PROD_API_URL }}
    
    - name: Deploy to staging
      if: github.ref == 'refs/heads/develop'
      run: |
        # Deploy to staging environment
        npm run deploy:staging
      env:
        DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }}
    
    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        # Deploy to production environment
        npm run deploy:production
      env:
        DEPLOY_KEY: ${{ secrets.PROD_DEPLOY_KEY }}
```

## Environment Configuration

### Environment Variables

```yaml
# .github/workflows/deploy.yml
env:
  NODE_ENV: production
  VITE_API_URL: ${{ secrets.API_URL }}
  VITE_STRIPE_PUBLIC_KEY: ${{ secrets.STRIPE_PUBLIC_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Secrets Management

Configure these secrets in your GitHub repository:

- `API_URL` - Backend API URL
- `STRIPE_PUBLIC_KEY` - Stripe payment gateway key
- `DATABASE_URL` - Database connection string
- `DEPLOY_KEY` - Deployment authentication key
- `SONAR_TOKEN` - SonarCloud token for code quality analysis

## Quality Gates

### Coverage Threshold

```yaml
- name: Check coverage threshold
  run: |
    COVERAGE=$(npm run test:coverage -- --silent | grep -o '[0-9]*%' | head -1 | sed 's/%//')
    if [ $COVERAGE -lt 80 ]; then
      echo "Coverage $COVERAGE% is below threshold of 80%"
      exit 1
    fi
```

### Performance Budget

```yaml
- name: Performance audit
  run: |
    npm install -g lighthouse-ci
    lhci autorun
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## Deployment Strategies

### Blue-Green Deployment

```yaml
  blue-green-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to blue environment
      run: |
        # Deploy new version to blue environment
        kubectl apply -f k8s/blue-deployment.yaml
    
    - name: Health check blue environment
      run: |
        # Verify blue environment is healthy
        curl -f http://blue.example.com/health
    
    - name: Switch traffic to blue
      run: |
        # Update load balancer to point to blue
        kubectl patch service app-service -p '{"spec":{"selector":{"version":"blue"}}}'
    
    - name: Cleanup green environment
      run: |
        # Remove old green deployment
        kubectl delete deployment app-green
```

### Canary Deployment

```yaml
  canary-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy canary version
      run: |
        # Deploy to 10% of traffic
        kubectl apply -f k8s/canary-deployment.yaml
    
    - name: Monitor canary metrics
      run: |
        # Monitor error rates and performance
        ./scripts/monitor-canary.sh
    
    - name: Promote or rollback
      run: |
        if [ "$CANARY_SUCCESS" = "true" ]; then
          kubectl apply -f k8s/full-deployment.yaml
        else
          kubectl delete deployment app-canary
        fi
```

## Monitoring and Alerting

### Health Checks

```javascript
// src/health.ts
export const healthCheck = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  services: {
    database: await checkDatabase(),
    cache: await checkCache(),
    paymentGateway: await checkPaymentGateway()
  }
};
```

### Deployment Notifications

```yaml
- name: Notify deployment status
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    text: 'E-commerce app deployed to production'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

1. **Fail Fast**: Identify issues early in the pipeline
2. **Parallel Execution**: Run independent jobs in parallel
3. **Caching**: Cache dependencies and build artifacts
4. **Environment Parity**: Keep environments as similar as possible
5. **Rollback Strategy**: Always have a rollback plan
6. **Monitoring**: Monitor deployments and application health
7. **Security**: Never commit secrets to version control

## Exercise

Implement the CI/CD pipeline by:

1. Creating the GitHub Actions workflow files
2. Configuring environment variables and secrets
3. Setting up quality gates and monitoring
4. Testing the deployment process

## Next Steps

Continue to [04-ADVANCED-TESTING.md](./04-ADVANCED-TESTING.md) to explore advanced testing strategies and techniques.
