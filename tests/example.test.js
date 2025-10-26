// Example test file - using Jest or Mocha
const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
    test('GET /health should return 200', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body.status).toBe('OK');
        expect(response.body.service).toBe('Mwaslatak Website');
    });

    test('GET /api/test should return success message', async () => {
        const response = await request(app)
            .get('/api/test')
            .expect(200);

        expect(response.body.message).toContain('API working successfully');
    });

    test('GET / should serve index.html', async () => {
        const response = await request(app)
            .get('/')
            .expect(200);

        expect(response.text).toContain('<!DOCTYPE html>');
    });
});

// Add more tests as needed
describe('Utility Functions', () => {
    const { isValidEmail, generateSlug } = require('../src/server/utils/helpers');

    test('isValidEmail should validate email correctly', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('invalid-email')).toBe(false);
        expect(isValidEmail('')).toBe(false);
    });

    test('generateSlug should create URL-friendly slugs', () => {
        expect(generateSlug('Hello World!')).toBe('hello-world');
        expect(generateSlug('Test & Example')).toBe('test-example');
        expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
    });
});
