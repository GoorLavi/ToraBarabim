import { eq } from 'drizzle-orm';

import { db } from '../db/client';
import { adminUsers } from '../db/schema';

// One-time bootstrap: promotes an existing admin to the single super admin.
// Never touches passwords, never reassigns an existing super admin: once
// one exists, this script refuses to run at all.
const run = async (): Promise<void> => {
  const [, , email] = process.argv;

  if (!email) {
    console.error('Usage: npm run admin:promote-super -w server -- <email>');
    process.exit(1);
  }

  const existingSuper = await db.select({ id: adminUsers.id, email: adminUsers.email }).from(adminUsers).where(eq(adminUsers.isSuper, true)).limit(1);
  if (existingSuper[0]) {
    console.error(
      `A super admin already exists (id=${existingSuper[0].id} email=${existingSuper[0].email}). There must stay exactly one super admin, ever; this script never reassigns it.`,
    );
    process.exit(1);
  }

  const rows = await db.select({ id: adminUsers.id, email: adminUsers.email, role: adminUsers.role }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const target = rows[0];
  if (!target || target.role !== 'admin') {
    console.error(`No existing admin user found with email ${email}.`);
    process.exit(1);
  }

  const [promoted] = await db
    .update(adminUsers)
    .set({ isSuper: true, updatedAt: new Date() })
    .where(eq(adminUsers.id, target.id))
    .returning({ id: adminUsers.id, email: adminUsers.email });

  if (!promoted) {
    console.error('Failed to promote admin user.');
    process.exit(1);
  }

  console.log(`Promoted to super admin: id=${promoted.id} email=${promoted.email}`);
  process.exit(0);
};

run().catch((error: unknown) => {
  console.error('promote-super-admin failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
