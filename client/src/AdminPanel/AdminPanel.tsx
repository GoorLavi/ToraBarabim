import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminShell } from './components/AdminShell/AdminShell';
import { RequireAdminSession } from './components/RequireAdminSession/RequireAdminSession';
import { LessonFormPage } from './LessonFormPage/LessonFormPage';
import { LessonsListPage } from './LessonsListPage/LessonsListPage';
import { LoginPage } from './LoginPage/LoginPage';
import { RabbiFormPage } from './RabbiFormPage/RabbiFormPage';
import { RabbisListPage } from './RabbisListPage/RabbisListPage';

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
        <Route path="lessons/:id" element={<LessonFormPage />} />
        <Route path="rabbis" element={<RabbisListPage />} />
        <Route path="rabbis/new" element={<RabbiFormPage />} />
        <Route path="rabbis/:id" element={<RabbiFormPage />} />
      </Route>
    </Route>
  </Routes>
);
