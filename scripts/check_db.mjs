import * as clientModule from '../packages/db/dist/client.js';
const db = clientModule.db || clientModule.default;
console.log('process.env.DATABASE_URL=', process.env.DATABASE_URL);
console.log('db export present=', !!db);
if (!db) process.exit(2);

try {
  const cnt = await db.user.count();
  console.log('user.count=', cnt);
  process.exit(0);
} catch (err) {
  console.error('query error:');
  console.error(err);
  process.exit(3);
}
