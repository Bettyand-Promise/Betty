/**
 * Generates a bcrypt hash for the admin password, to paste into
 * ADMIN_PASSWORD_HASH in backend/.env.
 *
 *   npm run db:hash -- "your-password"
 *   npm run db:hash              (prompts on stdin)
 */
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline';

async function getPassword(): Promise<string> {
  const arg = process.argv[2];
  if (arg) return arg;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question('Admin password: ', (a) => (rl.close(), resolve(a))));
}

async function main() {
  const password = (await getPassword()).trim();
  if (!password) throw new Error('empty password');
  const hash = await bcrypt.hash(password, 12);
  console.log('\nADMIN_PASSWORD_HASH=' + hash + '\n');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
