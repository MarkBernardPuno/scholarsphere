import { useState } from 'react';

const EyeOpenIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ width: '18px', height: '18px' }}>
    <path
      d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeClosedIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ width: '18px', height: '18px' }}>
    <path
      d="M3.5 4.5 20.5 19.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.75 12s3.75-6.75 7.25-6.75c1.08 0 2.17.27 3.22.77m4.02 2.85C20.09 10.2 20.75 12 20.75 12s-3.75 6.75-8.75 6.75c-1.18 0-2.37-.34-3.52-.94"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.75 9.75a3 3 0 0 1 4.5 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PasswordField({
  value,
  onChange,
  placeholder = 'Password',
  style,
  onKeyDown,
  autoComplete = 'current-password',
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        style={{ ...style, paddingRight: '48px' }}
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        onMouseDown={(event) => event.preventDefault()}
        aria-label={isVisible ? `Hide ${placeholder.toLowerCase()}` : `Show ${placeholder.toLowerCase()}`}
        title={isVisible ? `Hide ${placeholder}` : `Show ${placeholder}`}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          border: 'none',
          background: 'transparent',
          color: '#8a6a12',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          lineHeight: 0,
        }}
      >
        {isVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
}
