// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production-must-be-long-enough';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
