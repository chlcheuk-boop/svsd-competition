import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { useStore } from './store/store';
import { AvatarButton, ToastHost, TopNav } from './components/ui/Frame';
import { InkFilters } from './components/ui/InkFilters';
import BoardPage from './pages/BoardPage';
import MatchesPage from './pages/MatchesPage';
import MatchBoardPage from './pages/MatchBoardPage';
import PassportPage from './pages/PassportPage';
import ThreadPage from './pages/ThreadPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import Onboarding from './pages/Onboarding';

export default function App() {
  const { state } = useStore();
  const loc = useLocation();
  const reduce = state.settings.reduceMotion;

  if (!state.onboarded && loc.pathname !== '/welcome') return <Navigate to="/welcome" replace />;

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <ToastHost>
        <div className={reduce ? 'reduce-motion' : undefined} style={{ height: '100%' }}>
          <InkFilters />
          <Routes>
            <Route path="/welcome" element={<Onboarding />} />
            <Route path="/" element={<BoardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/match/:id" element={<MatchBoardPage />} />
            <Route path="/passport" element={<PassportPage />} />
            <Route path="/thread/:id" element={<ThreadPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {loc.pathname !== '/welcome' && (
            <>
              <TopNav />
              <AvatarButton />
            </>
          )}
        </div>
      </ToastHost>
    </MotionConfig>
  );
}
