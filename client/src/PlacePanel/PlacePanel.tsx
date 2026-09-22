import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { PlaceShell } from './components/PlaceShell/PlaceShell';
import { RequirePlaceSession } from './components/RequirePlaceSession/RequirePlaceSession';
import { LessonFormPage } from './LessonFormPage/LessonFormPage';
import { LessonsListPage } from './LessonsListPage/LessonsListPage';
import { ProfilePage } from './ProfilePage/ProfilePage';

// `/place/login` is not a real page: login is the shared `/login`
// (`PanelLogin`), which also serves a rabbi account, mirroring
// `RabbiPanel.tsx`'s own `RedirectToSharedLogin`.
const RedirectToSharedLogin = () => {
  const location = useLocation();
  return <Navigate to={`/login${location.search}`} replace />;
};

// Mounted at `/place/*` by App.tsx. `login` is the one route outside the
// guard and the shell; everything else requires a session and renders
// inside the shared header/tabs shell. The default landing tab is the
// lesson list, not an "upcoming" tab: a place has no exception surface for
// a daily "tonight is cancelled" reality the way a rabbi does (build brief).
export const PlacePanel = () => (
  <Routes>
    <Route path="login" element={<RedirectToSharedLogin />} />

    <Route element={<RequirePlaceSession />}>
      <Route element={<PlaceShell />}>
        <Route index element={<Navigate to="lessons" replace />} />
        <Route path="lessons" element={<LessonsListPage />} />
        <Route path="lessons/new" element={<LessonFormPage />} />
        <Route path="lessons/:id" element={<LessonFormPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>
  </Routes>
);
