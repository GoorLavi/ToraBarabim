import { Navigate, Outlet } from 'react-router-dom';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { useAdminSession } from '~/AdminPanel/useAdminSession';

// Nested inside `RequireAdminSession`, which has already resolved the
// session by the time this guard mounts, so there is no separate loading
// state here. A non-super admin has no business seeing that the admins
// section exists, so a redirect rather than an access-denied message
// (client/CLAUDE.md: this is UX, the server is the real boundary, same as
// `RequireAdminSession`'s own comment says).
export const RequireSuperAdmin = () => {
  const session = useAdminSession();
  return session.data?.isSuper ? <Outlet /> : <Navigate to={ADMIN_ROUTES.lessons} replace />;
};
