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

  // ROBUST RELOAD MECHANISM
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    }
  }, []);

  const handleReload = () => {
    // Try to use the plugin's built-in skip waiting
    try {
      updateServiceWorker(false);
    } catch (e) {
      console.error(e);
    }

    // Explicitly send SKIP_WAITING to the waiting service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }

    // Ultimate fallback: just reload after 1 second
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
