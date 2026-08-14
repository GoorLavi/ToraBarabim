import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

interface ScryptOptions {
  N: number;
  r: number;
  p: number;
}

// `util.promisify` only resolves to the overload of `scrypt` without
// options, so the cost-parameter overload is wrapped by hand instead.
const deriveKey = (password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });

const ALGORITHM = 'scrypt';
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
// scrypt cost parameters. Encoded into every hash so they can be raised
// later without invalidating rows hashed under the previous parameters.
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

// Self-describing so a future change to the cost parameters cannot break
// verification of rows hashed under the old ones: algorithm:N:r:p:salt:hash
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await deriveKey(password, salt, KEY_LENGTH, { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION });

  return [ALGORITHM, COST, BLOCK_SIZE, PARALLELIZATION, salt.toString('hex'), derivedKey.toString('hex')].join(
    ':',
  );
};

// A dummy hash to verify against when the user does not exist, so the
// response time for "unknown email" matches "wrong password" and the
// endpoint never reveals which emails are registered. Computed lazily and
// cached: CommonJS output cannot use top-level await.
let dummyPasswordHash: Promise<string> | undefined;
export const getDummyPasswordHash = (): Promise<string> => {
  dummyPasswordHash ??= hashPassword(randomBytes(32).toString('hex'));
  return dummyPasswordHash;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const parts = storedHash.split(':');
  if (parts.length !== 6) return false;

  const [algorithm, costRaw, blockSizeRaw, parallelizationRaw, saltHex, hashHex] = parts;
  if (algorithm !== ALGORITHM || !costRaw || !blockSizeRaw || !parallelizationRaw || !saltHex || !hashHex) {
    return false;
  }

  const cost = Number(costRaw);
  const blockSize = Number(blockSizeRaw);
  const parallelization = Number(parallelizationRaw);
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');

  const derivedKey = await deriveKey(password, salt, expected.length, { N: cost, r: blockSize, p: parallelization });

  if (derivedKey.length !== expected.length) return false;
  return timingSafeEqual(derivedKey, expected);
};
