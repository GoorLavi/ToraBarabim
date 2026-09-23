import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { RabbiShell } from './components/RabbiShell/RabbiShell';
import { RequireRabbiSession } from './components/RequireRabbiSession/RequireRabbiSession';
import { LessonFormPage } from './LessonFormPage/LessonFormPage';
import { LessonsListPage } from './LessonsListPage/LessonsListPage';
import { ProfilePage } from './ProfilePage/ProfilePage';
import { UpcomingPage } from './UpcomingPage/UpcomingPage';

// `/rabbi/login` is no longer a real page: login moved to the shared
// `/login` (`PanelLogin`), which also serves a place account. This route
// stays only for a bookmark or a shared link that predates the move, and it
// forwards the query string unchanged so a `from` on it still reaches
// `/login`.
const RedirectToSharedLogin = () => {
  const location = useLocation();
  return <Navigate to={`/login${location.search}`} replace />;
};

// Mounted at `/rabbi/*` by App.tsx. `login` is the one route outside the
// guard and the shell; everything else requires a session and renders
// inside the shared header/tabs shell. Unlike the admin panel, the
// default landing tab is "upcoming", not the lesson list (design doc,
// section 1: the rabbi's daily reality is "tonight is cancelled").
export const RabbiPanel = () => (
  <Routes>
    <Route path="login" element={<RedirectToSharedLogin />} />

    <Route element={<RequireRabbiSession />}>
      <Route element={<RabbiShell />}>
        <Route index element={<Navigate to="upcoming" replace />} />
        <Route path="upcoming" element={<UpcomingPage />} />
        <Route path="lessons" element={<LessonsListPage />} />
        <Route path="lessons/new" element={<LessonFormPage />} />
        <Route path="lessons/:id" element={<LessonFormPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>
  </Routes>
);
