import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

config();

console.log('=== ENVIRONMENT VARIABLES TEST ===');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PASSWORD exists:', !!process.env.MYSQL_PASSWORD);
console.log('===================================');