import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminFormPage } from './AdminFormPage/AdminFormPage';
import { AdminsListPage } from './AdminsListPage/AdminsListPage';
import { AdminShell } from './components/AdminShell/AdminShell';
import { RequireAdminSession } from './components/RequireAdminSession/RequireAdminSession';
import { RequireSuperAdmin } from './components/RequireSuperAdmin/RequireSuperAdmin';
import { LessonFormPage } from './LessonFormPage/LessonFormPage';
import { LessonsListPage } from './LessonsListPage/LessonsListPage';
import { LessonViewPage } from '~/AdminPanel/LessonViewPage/LessonViewPage';
import { LoginPage } from './LoginPage/LoginPage';
import { PlaceFormPage } from './PlaceFormPage/PlaceFormPage';
import { PlacesListPage } from './PlacesListPage/PlacesListPage';
import { PlaceViewPage } from './PlaceViewPage/PlaceViewPage';
import { RabbiFormPage } from './RabbiFormPage/RabbiFormPage';
import { RabbisListPage } from './RabbisListPage/RabbisListPage';
import { RabbiViewPage } from '~/AdminPanel/RabbiViewPage/RabbiViewPage';

// Mounted at `/admin/*` by App.tsx. `login` is the one route outside the
// guard and the shell; everything else requires a session and renders
// inside the shared header/tabs shell.
export const AdminPanel = () => (
  <Routes>
    <Route path="login" element={<LoginPage />} />

    <Route element={<RequireAdminSession />}>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="lessons" replace />} />
        <Route path="lessons" element={<LessonsListPage />} />
        <Route path="lessons/new" element={<LessonFormPage />} />
        <Route path="lessons/:id" element={<LessonViewPage />} />
        <Route path="lessons/:id/edit" element={<LessonFormPage />} />
        <Route path="rabbis" element={<RabbisListPage />} />
        <Route path="rabbis/new" element={<RabbiFormPage />} />
        <Route path="rabbis/:id" element={<RabbiViewPage />} />
        <Route path="rabbis/:id/edit" element={<RabbiFormPage />} />
        <Route path="places" element={<PlacesListPage />} />
        <Route path="places/new" element={<PlaceFormPage />} />
        <Route path="places/:id" element={<PlaceViewPage />} />
        <Route path="places/:id/edit" element={<PlaceFormPage />} />
        <Route element={<RequireSuperAdmin />}>
          <Route path="admins" element={<AdminsListPage />} />
          <Route path="admins/new" element={<AdminFormPage />} />
        </Route>
      </Route>
    </Route>
  </Routes>
);
