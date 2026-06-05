'use client';

import type { ReactNode } from 'react';

interface DialogHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose?: () => void;
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Tutup"
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: 'none',
        background: '#F2F2F7',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginLeft: 12,
      }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        stroke="#8E8E93"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
      </svg>
    </button>
  );
}

export function DialogHeader({ eyebrow, title, description, icon, onClose }: DialogHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '20px 24px 16px',
        borderBottom: '1px solid #F2F2F7',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {icon && <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>}
        <div>
          {eyebrow && (
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#8E8E93',
                margin: '0 0 2px 0',
              }}
            >
              {eyebrow}
            </p>
          )}
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1E', margin: 0 }}>{title}</h3>
          {description && (
            <p style={{ fontSize: 13, color: '#8E8E93', margin: '4px 0 0 0' }}>{description}</p>
          )}
        </div>
      </div>
      {onClose && <CloseButton onClick={onClose} />}
    </div>
  );
}
