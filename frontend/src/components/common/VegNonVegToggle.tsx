import React from 'react';

interface VegNonVegToggleProps {
  selected: 'veg' | 'non-veg';
  onChange: (type: 'veg' | 'non-veg') => void;
  vegCount?: number;
  nonVegCount?: number;
}

export const VegNonVegToggle: React.FC<VegNonVegToggleProps> = ({
  selected,
  onChange,
  vegCount = 15,
  nonVegCount = 15,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0 20px 0' }}>
      <div className="dietary-switch-container">
        {/* VEG Button */}
        <button
          type="button"
          onClick={() => onChange('veg')}
          className={`dietary-btn ${selected === 'veg' ? 'active-veg' : ''}`}
          aria-pressed={selected === 'veg'}
        >
          {/* Veg Indian Symbol */}
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              border: '2px solid #2e7d32',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#2e7d32',
              }}
            />
          </span>
          <span>VEG</span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: selected === 'veg' ? '#2e7d32' : 'var(--bg-muted)',
              color: selected === 'veg' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            {vegCount}
          </span>
        </button>

        {/* NON-VEG Button */}
        <button
          type="button"
          onClick={() => onChange('non-veg')}
          className={`dietary-btn ${selected === 'non-veg' ? 'active-nonveg' : ''}`}
          aria-pressed={selected === 'non-veg'}
        >
          {/* Non-Veg Indian Symbol */}
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              border: '2px solid #b71c1c',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
            }}
          >
            <span
              style={{
                width: '0',
                height: '0',
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '9px solid #b71c1c',
              }}
            />
          </span>
          <span>NON-VEG</span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: selected === 'non-veg' ? '#b71c1c' : 'var(--bg-muted)',
              color: selected === 'non-veg' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            {nonVegCount}
          </span>
        </button>
      </div>
    </div>
  );
};
