# Testing Guide for Petflix

## Overview

This guide covers running and writing tests for the Petflix application.

## Backend Testing

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- youtube.test.ts

# Run in watch mode
npm test -- --watch

# Run with verbose output
npm test -- --verbose
```

### Test Structure

```
backend/src/
├── services/
│   ├── __tests__/
│   │   ├── logger.test.ts
│   │   └── youtube.test.ts
├── middleware/
│   ├── __tests__/
│   │   ├── auth.test.ts
│   │   └── errorHandler.test.ts
```

### Writing Tests

**Example Service Test:**
```typescript
import { myService } from '../myService';

describe('MyService', () => {
  it('should do something', () => {
    const result = myService.doSomething();
    expect(result).toBe('expected value');
  });

  it('should handle errors', async () => {
    await expect(myService.failingMethod()).rejects.toThrow();
  });
});
```

**Mocking Supabase:**
```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}));
```

## Frontend Testing

### Running Tests

```bash
cd frontend

# Run all tests (when configured)
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Test Structure

```
frontend/src/
├── services/
│   ├── __tests__/
│   │   ├── cast.test.ts
│   │   └── video.test.ts
├── components/
│   ├── __tests__/
│   │   └── (component tests)
```

### Writing Tests

**Example Service Test:**
```typescript
import { myService } from '../myService';

// Mock fetch
global.fetch = jest.fn();

describe('MyService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should call API', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    const result = await myService.getData();
    expect(fetch).toHaveBeenCalled();
    expect(result).toEqual({ data: 'test' });
  });
});
```

**Mocking Browser APIs:**
```typescript
beforeEach(() => {
  (global as any).window = {
    chrome: {
      cast: mockCastAPI,
    },
  };
});
```

## Test Coverage

### Current Coverage

**Backend:**
- ✅ Logger service
- ✅ YouTube service
- ✅ Error handler middleware
- ✅ Auth middleware
- ⏳ Route handlers (to be added)
- ⏳ Database operations (to be added)

**Frontend:**
- ✅ Cast service
- ✅ Video service
- ⏳ Auth service (to be added)
- ⏳ Comment service (to be added)
- ⏳ Component tests (to be added)

### Coverage Goals

- **Target**: 80% overall coverage
- **Critical paths**: 90%+ coverage
- **Services**: 85%+ coverage
- **Components**: 70%+ coverage

## Best Practices

### 1. Test Naming

```typescript
// Good
it('should return user data when authenticated')
it('should throw error when token is invalid')

// Bad
it('works')
it('test user')
```

### 2. Test Organization

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle success case', () => {});
    it('should handle error case', () => {});
    it('should validate input', () => {});
  });
});
```

### 3. Setup and Teardown

```typescript
describe('MyTest', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  beforeAll(() => {
    // Setup once before all tests
  });

  afterAll(() => {
    // Cleanup once after all tests
  });
});
```

### 4. Mocking

```typescript
// Mock entire module
jest.mock('../myModule');

// Mock specific function
const mockFn = jest.fn().mockResolvedValue('result');

// Mock implementation
jest.spyOn(object, 'method').mockImplementation(() => 'mocked');

// Restore mocks
jest.restoreAllMocks();
```

### 5. Async Testing

```typescript
// Using async/await
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('value');
});

// Testing rejections
it('should throw error', async () => {
  await expect(failingFunction()).rejects.toThrow('Error message');
});

// Testing promises
it('should resolve', () => {
  return promiseFunction().then(result => {
    expect(result).toBe('value');
  });
});
```

## CI/CD Integration

### GitHub Actions (Future)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

## Debugging Tests

### Jest Debug Mode

```bash
# Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# VSCode debugging
# Add to launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Common Issues

**Issue: Module not found**
```typescript
// Solution: Use correct module paths
import { func } from '../relative/path';
```

**Issue: Async timeout**
```typescript
// Solution: Increase timeout
jest.setTimeout(10000);
```

**Issue: Mocks not working**
```typescript
// Solution: Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Test-Driven Development (TDD)

### TDD Workflow

1. **Write failing test**
   ```typescript
   it('should add two numbers', () => {
     expect(add(2, 3)).toBe(5);
   });
   ```

2. **Write minimal code to pass**
   ```typescript
   function add(a: number, b: number) {
     return a + b;
   }
   ```

3. **Refactor**
   ```typescript
   // Improve code quality while keeping tests green
   ```

4. **Repeat**

### Benefits

- Better code design
- Higher confidence
- Living documentation
- Easier refactoring
- Fewer bugs

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Test Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Unit Testing Best Practices](https://www.typescriptlang.org/docs/handbook/testing.html)

## Next Steps

1. Add more backend route tests
2. Implement frontend component tests
3. Add E2E tests with Playwright
4. Set up CI/CD pipeline
5. Achieve 80% code coverage
6. Add integration tests
7. Performance testing

