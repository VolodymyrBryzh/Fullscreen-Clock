
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
      alert('Your browser does not support the Window Management API, which is required to project to a second screen.');
      return;
    }

    try {
      // This will prompt the user for permission if not already granted.
      const details: ScreenDetails = await window.getScreenDetails();
      
      const secondaryScreen = details.screens.find(s => !s.isPrimary);

      if (!secondaryScreen) {
        alert('No secondary screen detected. Connect another display and try again.');
        return;
      }

      const { left, top, width, height } = secondaryScreen;
      const features = `left=${left},top=${top},width=${width},height=${height},popup=yes,noopener,noreferrer`;
      
      const newWindow = window.open('/?mode=projector', 'projector-clock', features);
      setProjectorWindow(newWindow);
    } catch (err) {
      // Handle permission denial gracefully.
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        alert('Permission to manage windows was denied. Please allow this permission in your browser settings to use the projector feature.');
      } else {
        console.error("Error opening projector window:", err);
        alert('An unexpected error occurred while trying to open the projector window.');
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
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors"
            title="Open the clock on a second display"
          >
            Project Clock
          </button>
        ) : (
          <button
            onClick={closeProjector}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
            title="Close the projector window"
          >
            Stop Projecting
          </button>
        )}
      </div>

      <Clock time={currentTime} />
      <footer className="absolute bottom-4 text-xs text-gray-700">
        Press F11 for Full Screen Mode
      </footer>
    </main>
  );
}

export default App;
