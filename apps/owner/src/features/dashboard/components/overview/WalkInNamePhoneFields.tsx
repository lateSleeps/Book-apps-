'use client';

import type { WalkInFormData } from '../../types/overview.types';

interface WalkInNamePhoneFieldsProps {
  walkInForm: WalkInFormData;
  setWalkInForm: React.Dispatch<React.SetStateAction<WalkInFormData>>;
}

const inputStyle: React.CSSProperties = {
  height: 40,
  borderRadius: 10,
  border: '1px solid #E5E5EA',
  background: '#F9F9FB',
  padding: '0 14px',
  fontSize: 14,
  color: '#1C1C1E',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#8E8E93',
};

export function WalkInNamePhoneFields({ walkInForm, setWalkInForm }: WalkInNamePhoneFieldsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>
          Nama <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Nama lengkap"
          value={walkInForm.name}
          onChange={(e) => setWalkInForm((f) => ({ ...f, name: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>Nomor HP</label>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="08xxxxxxxxxx"
          value={walkInForm.phone}
          onChange={(e) =>
            setWalkInForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))
          }
          style={inputStyle}
        />
      </div>
    </div>
  );
}
