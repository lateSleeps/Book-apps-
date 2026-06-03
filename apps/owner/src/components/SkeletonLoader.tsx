'use client';

import React from 'react';

// Keyframes live in globals.css (.skeleton-shimmer, .skeleton-fade-in)

export function SkeletonText({
  width = '100%',
  height = 16,
}: {
  width?: string | number;
  height?: number;
}) {
  return <div className="skeleton-shimmer" style={{ width, height, borderRadius: 8 }} />;
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
    />
  );
}

export function SkeletonCard({ height = 80 }: { height?: number }) {
  return <div className="skeleton-shimmer" style={{ height, borderRadius: 14, width: '100%' }} />;
}

export function SkeletonRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton-shimmer" style={{ height: 14, borderRadius: 6, width: '45%' }} />
        <div className="skeleton-shimmer" style={{ height: 12, borderRadius: 6, width: '30%' }} />
      </div>
      <div className="skeleton-shimmer" style={{ height: 24, borderRadius: 12, width: 70 }} />
      <div className="skeleton-shimmer" style={{ height: 24, borderRadius: 12, width: 55 }} />
      <div className="skeleton-shimmer" style={{ height: 14, borderRadius: 6, width: 50 }} />
      <div className="skeleton-shimmer" style={{ height: 24, borderRadius: 12, width: 60 }} />
    </div>
  );
}

export function SkeletonBookingList({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
