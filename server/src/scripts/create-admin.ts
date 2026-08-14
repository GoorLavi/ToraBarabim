import { createInterface } from 'node:readline';

import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../db/client';
import { adminUsers } from '../db/schema';
import { hashPassword } from '../service/admin-auth/password';

const MIN_PASSWORD_LENGTH = 12;
const WEAK_PASSWORD_FLOOR = 6;

// Password is never a CLI argument: an argument would be written to the
// shell's history file in plain text.
//
// Reads only the FIRST line of stdin and stops there. Consuming the whole
// stream would fold a second piped line (and the newline between them)
// into the password itself, silently creating an account nobody could
// ever log into.
const readPasswordFromStdin = async (): Promise<string> => {
  const rl = createInterface({ input: process.stdin, terminal: false });
  try {
    const firstLine = await new Promise<string | undefined>((resolve) => {
      rl.once('line', (line) => resolve(line));
      rl.once('close', () => resolve(undefined));
    });
    if (firstLine === undefined) return '';
    // Defensive: readline already splits on the line terminator, but a
    // stray \r survives when the stream is CRLF without a following \n.
    return firstLine.replace(/\r$/, '');
  } finally {
    rl.close();
  }
};

const ENTER_CHARS = new Set(['\n', '\r']);
const CTRL_C_CHAR = '\x03';
const BACKSPACE_CHARS = new Set(['\x7f', '\b']);

// Interactive prompt with the terminal's own echo disabled, so the
// password never appears on screen or in the terminal's scrollback.
// Built on `process.stdin` raw mode only, no dependency.
const promptHiddenLine = (promptText: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    stdout.write(promptText);

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let input = '';

    const cleanup = (): void => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onData);
    };

    // A typed keystroke and a pasted string both arrive through this same
    // event, and a paste delivers every character of the password (often
    // with a trailing enter) in a single chunk. Each character is walked
    // in order rather than treating the whole chunk as one keystroke, or a
    // pasted password would never trigger the enter check and the prompt
    // would hang forever.
    const onData = (chunk: string): void => {
      for (const char of chunk) {
        if (ENTER_CHARS.has(char)) {
          // Stop at the first line terminator and drop whatever follows in
          // this same chunk (a pasted CRLF, or anything after it): it
          // belongs to nothing this prompt asked for, and passing it on
          // would either corrupt this password or feed stray input to the
          // next prompt.
          cleanup();
          stdout.write('\n');
          resolve(input);
          return;
        }
        if (char === CTRL_C_CHAR) {
          cleanup();
          stdout.write('\n');
          reject(new Error('Aborted'));
          return;
        }
        if (BACKSPACE_CHARS.has(char)) {
          input = input.slice(0, -1);
          continue;
        }
        input += char;
      }
    };

    stdin.on('data', onData);
  });

const readPasswordInteractively = async (): Promise<string> => {
  const password = await promptHiddenLine('Password: ');
  const confirmation = await promptHiddenLine('Confirm password: ');

  if (password !== confirmation) {
    throw new Error('Passwords did not match.');
  }

  return password;
};

// Piped input (a deployment or CI setting) has no TTY to prompt on, so it
// keeps reading the password from stdin directly instead.
const readPassword = (): Promise<string> =>
  process.stdin.isTTY ? readPasswordInteractively() : readPasswordFromStdin();

const run = async (): Promise<void> => {
  const [, , email, name] = process.argv;

  if (!email || !name) {
    console.error('Usage: npm run admin:create -w server -- <email> <name>');
    process.exit(1);
  }

  const password = await readPassword();
  if (!password) {
    console.error('No password received.');
    process.exit(1);
  }
  // Fail-closed on purpose: the strong minimum applies unless someone
  // explicitly opts out with the exact string 'true', rather than
  // defaulting to the weak floor and needing a flag to tighten it. An
  // unset or misspelled variable must never silently weaken this.
  const allowWeakPassword = process.env.ALLOW_WEAK_ADMIN_PASSWORD === 'true';
  const minimumLength = allowWeakPassword ? WEAK_PASSWORD_FLOOR : MIN_PASSWORD_LENGTH;

  if (password.length < minimumLength) {
    console.error(`Password must be at least ${minimumLength} characters long.`);
    process.exit(1);
  }
  if (allowWeakPassword && password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `Warning: this account uses a password below the safe minimum of ${MIN_PASSWORD_LENGTH} characters and must not be used in production.`,
    );
  }

  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing.length > 0) {
    console.error(`An admin user with email ${email} already exists.`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(adminUsers)
    .values({ id: nanoid(), email, name, passwordHash, isActive: true })
    .returning({ id: adminUsers.id, email: adminUsers.email });

  if (!created) {
    console.error('Failed to create admin user.');
    process.exit(1);
  }

  console.log(`Created admin user: id=${created.id} email=${created.email}`);
  process.exit(0);
};

run().catch((error: unknown) => {
  console.error('create-admin failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
