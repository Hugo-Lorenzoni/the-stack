// Set required env vars before any module imports trigger EnvSchema.parse(process.env)
process.env.MYSQL_ROOT_PASSWORD = process.env.MYSQL_ROOT_PASSWORD ?? 'test-root-password';
process.env.MYSQL_DATABASE = process.env.MYSQL_DATABASE ?? 'testdb';
process.env.MYSQL_USER = process.env.MYSQL_USER ?? 'testuser';
process.env.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD ?? 'testpass';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'mysql://testuser:testpass@localhost:3306/testdb';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? 'test-nextauth-secret';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
process.env.EMAIL = process.env.EMAIL ?? 'test@example.com';
