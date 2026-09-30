import React from 'react';

export default function TripleSMotif({ className = '' }) {
  return (
    <div className={`pointer-events-none opacity-[0.03] text-primary select-none ${className}`}>
      <svg viewBox="0 0 400 400" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M200 40C288.366 40 360 111.634 360 200C360 288.366 288.366 360 200 360C111.634 360 40 288.366 40 200C40 111.634 111.634 40 200 40ZM200 120C244.183 120 280 155.817 280 200C280 244.183 244.183 280 200 280C155.817 280 120 244.183 120 200C120 155.817 155.817 120 200 120Z" />
        {/* Placeholder for the exact S Motif. The above is a generic stylized ring. */}
        {/* A true S curve overlapping three times. */}
        <path d="M100 250 Q 150 150 200 250 T 300 250" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
        <path d="M120 280 Q 170 180 220 280 T 320 280" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
        <path d="M140 310 Q 190 210 240 310 T 340 310" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      </svg>
    </div>
  );
}
