import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SplashScreen } from './components/auth/SplashScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { HomeScreen } from './screens/HomeScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { FriendsScreen } from './screens/FriendsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SeasonScreen } from './screens/SeasonScreen';
import { CreateChallengeModal } from './components/challenge/CreateChallengeModal';
import { ChallengeDetailScreen } from './components/challenge/ChallengeDetailScreen';
import { UploadResultScreen } from './components/challenge/UploadResultScreen';

type AppScreen = 'home' | 'leaderboard' | 'friends' | 'notifications' | 'profile';

type ModalState =
  | { type: 'none' }
  | { type: 'create-challenge'; preselectedFriendId?: string }
  | { type: 'challenge-detail'; challengeId: string }
  | { type: 'upload-result'; matchId: string }
  | { type: 'settings' };

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<AppScreen>('home');
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowSplash(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user || !profile) {
    return <AuthScreen />;
  }

  const handleCloseModal = () => {
    setModalState({ type: 'none' });
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div>
            <Header />
            <HomeScreen
              onCreateChallenge={() => setModalState({ type: 'create-challenge' })}
              onViewChallenge={(challengeId) =>
                setModalState({ type: 'challenge-detail', challengeId })
              }
            />
          </div>
        );
      case 'leaderboard':
        return (
          <div>
            <LeaderboardScreen />
          </div>
        );
      case 'friends':
        return (
          <div>
            <FriendsScreen
              onChallenge={(friendId) =>
                setModalState({ type: 'create-challenge', preselectedFriendId: friendId })
              }
            />
          </div>
        );
      case 'notifications':
        return (
          <div>
            <NotificationsScreen />
          </div>
        );
      case 'profile':
        return (
          <div>
            <ProfileScreen
              onSettings={() => setModalState({ type: 'settings' })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <main className="pb-20">
        {renderScreen()}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as AppScreen)}
        notificationCount={notificationCount}
      />

      {modalState.type === 'create-challenge' && (
        <CreateChallengeModal
          onClose={handleCloseModal}
          onComplete={(challengeId) =>
            setModalState({ type: 'challenge-detail', challengeId })
          }
          preselectedFriendId={modalState.preselectedFriendId}
        />
      )}

      {modalState.type === 'challenge-detail' && (
        <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto">
          <ChallengeDetailScreen
            challengeId={modalState.challengeId}
            onBack={handleCloseModal}
            onUploadResult={(matchId) =>
              setModalState({ type: 'upload-result', matchId })
            }
          />
        </div>
      )}

      {modalState.type === 'upload-result' && (
        <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto">
          <UploadResultScreen
            matchId={modalState.matchId}
            onBack={() =>
              setModalState({ type: 'challenge-detail', challengeId: '' })
            }
            onComplete={handleCloseModal}
          />
        </div>
      )}

      {modalState.type === 'settings' && (
        <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto">
          <SettingsScreen onBack={handleCloseModal} />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
