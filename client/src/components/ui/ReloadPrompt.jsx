import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './button';
import { RefreshCw, X } from 'lucide-react';
import { useEffect } from 'react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Periodically check for updates (every hour)
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // HARD RESET MECHANISM (User Requested)
  // This physically deletes the old PWA caches and unregisters the service worker,
  // guaranteeing that the page will load fresh assets from the network.
  const handleReload = async () => {
    try {
      // 1. Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }

      // 2. Delete all Cache Storage (this holds the old HTML/JS/CSS)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      // 3. Force reload from server
      window.location.reload(true);
    } catch (err) {
      console.error('Hard reset failed:', err);
      // Fallback reload
      window.location.reload(true);
    }
  };

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] animate-fade-up">
      <div className="bg-[#18181B] border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {needRefresh ? 'Update Available' : 'App Ready'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {needRefresh
                ? 'A new version of Safarnama is ready. Reload to apply changes.'
                : 'Safarnama is now cached and ready to work offline.'}
            </p>
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {needRefresh && (
          <Button
            size="sm"
            onClick={handleReload}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload & Update
          </Button>
        )}
      </div>
    </div>
  );
}
