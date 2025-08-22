
import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from './components/Clock';
import { useCurrentTime } from './hooks/useCurrentTime';

// Type definitions for the Window Management API, which might not be in default TS libs.
interface ScreenDetailed extends Screen {
  isPrimary: boolean;
  left: number;
  top: number;
  // Other properties like availLeft, availTop, etc., exist but are not used here.
}

interface ScreenDetails {
  screens: readonly ScreenDetailed[];
  currentScreen: ScreenDetailed;
}

declare global {
  interface Window {
    getScreenDetails?(): Promise<ScreenDetails>;
  }
}

function App(): React.ReactNode {
  const currentTime = useCurrentTime();
  const [projectorWindow, setProjectorWindow] = useState<Window | null>(null);

  // Check if the current view should be the projector-only mode.
  const urlParams = new URLSearchParams(window.location.search);
  const isProjectorView = urlParams.get('mode') === 'projector';

  const openProjector = useCallback(async () => {
    if (projectorWindow && !projectorWindow.closed) {
      projectorWindow.focus();
      return;
    }

    if (!window.getScreenDetails) {
      alert('Ваш браузер не підтримує Window Management API, який необхідний для проектування на другий екран.');
      return;
    }

    try {
      // This will prompt the user for permission if not already granted.
      const details: ScreenDetails = await window.getScreenDetails();
      
      const secondaryScreen = details.screens.find(s => !s.isPrimary);

      if (!secondaryScreen) {
        alert('Другий екран не виявлено. Підключіть інший дисплей і спробуйте ще раз.');
        return;
      }

      const { left, top, width, height } = secondaryScreen;
      const features = `left=${left},top=${top},width=${width},height=${height},popup=yes,noopener,noreferrer`;
      
      const newWindow = window.open('/?mode=projector', 'projector-clock', features);
      setProjectorWindow(newWindow);
    } catch (err) {
      // Handle permission denial gracefully.
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        alert('Дозвіл на керування вікнами було відхилено. Будь ласка, надайте цей дозвіл у налаштуваннях вашого браузера, щоб використовувати функцію проектора.');
      } else {
        console.error("Помилка відкриття вікна проектора:", err);
        alert('Сталася неочікувана помилка під час спроби відкрити вікно проектора.');
      }
    }
  }, [projectorWindow]);

  const closeProjector = useCallback(() => {
    if (projectorWindow) {
      projectorWindow.close();
      setProjectorWindow(null);
    }
  }, [projectorWindow]);

  // Effect to sync state if the projector window is closed manually by the user.
  useEffect(() => {
    const timer = setInterval(() => {
      if (projectorWindow && projectorWindow.closed) {
        setProjectorWindow(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [projectorWindow]);

  if (isProjectorView) {
    // This is the view for the secondary (projector) screen.
    // It's clean, without any controls, and the cursor is hidden.
    return (
      <main className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center font-sans antialiased cursor-none">
        <Clock time={currentTime} />
      </main>
    );
  }

  // This is the main view with controls.
  const isProjectorOpen = projectorWindow && !projectorWindow.closed;

  return (
    <main className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center font-sans antialiased">
      <div className="absolute top-5 right-5 z-10">
        {!isProjectorOpen ? (
          <button
            onClick={openProjector}
            className="px-4 py-2 bg-black text-gray-300 font-semibold rounded-lg border border-gray-700 hover:bg-gray-900 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition-colors"
            title="Відкрити годинник на другому дисплеї"
          >
            Проектувати
          </button>
        ) : (
          <button
            onClick={closeProjector}
            className="px-4 py-2 bg-black text-gray-300 font-semibold rounded-lg border border-gray-700 hover:bg-gray-900 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition-colors"
            title="Закрити вікно проектора"
          >
            Зупинити
          </button>
        )}
      </div>

      <Clock time={currentTime} />
      <footer className="absolute bottom-4 text-xs text-gray-700">
        Натисніть F11 для повноекранного режиму
      </footer>
    </main>
  );
}

export default App;