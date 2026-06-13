'use client';

import { Warning } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

interface PreviewFrameProps {
  slug: string | null;
  refreshKey: number;
  onRefresh: () => void;
}

const CUSTOMER_ORIGIN = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL ?? '';

function EmptyState({ onReload }: { onReload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-s16 py-s48 text-center">
      <Warning size={32} weight="duotone" className="text-tx-muted" />
      <div>
        <p className="text-ts-sub font-semibold text-tx-primary">Pratinjau tidak tersedia</p>
        <p className="mt-s4 text-ts-fn text-tx-muted">Periksa customer app atau konfigurasi URL.</p>
      </div>
      <button
        onClick={onReload}
        className="rounded-r10 border border-bd-card bg-bg-card px-s12 py-s8 text-ts-fn font-medium text-tx-primary shadow-card transition-colors hover:bg-bg-hover"
      >
        Muat ulang
      </button>
    </div>
  );
}

export function PreviewFrame({ slug, refreshKey, onRefresh }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [checking, setChecking] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const previewUrl = slug ? `${CUSTOMER_ORIGIN}/book/${slug}?preview=true` : null;

  useEffect(() => {
    if (!previewUrl) {
      setIframeReady(false);
      setFailed(false);
      return;
    }

    setChecking(true);
    setIframeReady(false);
    setLoaded(false);
    setFailed(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(previewUrl, { mode: 'no-cors', signal: controller.signal })
      .then(() => setIframeReady(true))
      .catch(() => setFailed(true))
      .finally(() => {
        setChecking(false);
        clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [previewUrl, refreshKey]);

  return (
    <div className="bg-bg-subtle relative flex min-h-[calc(100vh-160px)] items-center justify-center overflow-hidden rounded-r16 border border-bd-card shadow-card">
      {!previewUrl || failed ? (
        <EmptyState onReload={onRefresh} />
      ) : checking || !iframeReady ? (
        <div className="flex h-[667px] w-[375px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-bd-card border-t-tx-muted" />
        </div>
      ) : (
        <div className="relative h-[667px] w-[375px]">
          {!loaded && (
            <div className="bg-bg-subtle absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-bd-card border-t-tx-muted" />
            </div>
          )}
          <iframe
            key={refreshKey}
            ref={iframeRef}
            src={previewUrl}
            width="375"
            height="667"
            className={cn(
              'block h-full w-full transition-opacity duration-200',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
            title="Pratinjau Booking App"
            sandbox="allow-scripts allow-same-origin allow-forms"
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}
    </div>
  );
}
