import React, { useState, useRef, useEffect } from 'react';

const COLORS = {
  bg: '#1a1a1a',
  bgDeep: '#0a0a0a',
  bgHighlight: '#2a2a2a',
  inactive: '#333',
  textMuted: '#888',
  textDim: '#555',
  coral: '#ff6b6b',
  orange: '#ff9f43',
  yellow: '#feca57',
  cyan: '#48dbfb',
  green: '#1dd1a1',
  purple: '#5f27cd',
  pink: '#ee5a9b',
  teal: '#00d2d3',
  white: '#ffffff',
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEYS = [1, 3, 6, 8, 10];

const STEP_TYPES = { NOTE: 'note', REST: 'rest', TIE: 'tie', FLAM: 'flam' };

const getNoteColor = (note) => {
  if (note === null) return COLORS.inactive;
  const colors = [
    COLORS.coral, COLORS.coral,
    COLORS.orange, COLORS.orange,
    COLORS.yellow,
    COLORS.green, COLORS.green,
    COLORS.cyan, COLORS.cyan,
    COLORS.teal, COLORS.teal,
    COLORS.purple,
  ];
  return colors[note % 12];
};

const getNoteName = (note) => {
  if (note === null) return '';
  const octave = Math.floor(note / 12);
  return NOTE_NAMES[note % 12] + octave;
};

const getStepDisplay = (step) => {
  if (step.type === STEP_TYPES.REST) return '·';
  if (step.type === STEP_TYPES.TIE) return '—';
  if (step.type === STEP_TYPES.FLAM) return getNoteName(step.note) || '♦';
  return getNoteName(step.note) || '·';
};

const getStepColor = (step) => {
  if (step.type === STEP_TYPES.REST) return COLORS.inactive;
  if (step.type === STEP_TYPES.TIE) return COLORS.textDim;
  return getNoteColor(step.note);
};

// Note popup with keyboard and type selector - takes up 80% of viewport
const NotePopup = ({ step, onUpdate, onClose }) => {
  const initialType = step.type === STEP_TYPES.REST ? STEP_TYPES.NOTE : step.type;
  const [localStep, setLocalStep] = useState({ ...step, type: initialType });
  const [octave, setOctave] = useState(step.note !== null ? Math.floor(step.note / 12) : 3);
  const [showSub, setShowSub] = useState(false);

  const updateAndSync = (updates) => {
    const newStep = { ...localStep, ...updates };
    setLocalStep(newStep);
    onUpdate(newStep);
  };

  const handleKeyClick = (noteInOctave) => {
    const newNote = octave * 12 + noteInOctave;
    updateAndSync({ note: newNote, type: localStep.type === STEP_TYPES.REST ? STEP_TYPES.NOTE : localStep.type });
  };

  const handleOctaveChange = (newOctave) => {
    setOctave(newOctave);
    if (localStep.note !== null) {
      const noteInOctave = localStep.note % 12;
      const newNote = newOctave * 12 + noteInOctave;
      updateAndSync({ note: newNote });
    }
  };

  const handleTypeChange = (type) => {
    if (type === STEP_TYPES.REST) {
      updateAndSync({ type, note: null });
    } else {
      updateAndSync({ type });
    }
  };

  const updateSubStep = (index, subStep) => {
    const subs = localStep.subSteps || Array(8).fill(null).map(() => ({ type: STEP_TYPES.REST, note: null, velocity: 0.8 }));
    const updated = [...subs];
    updated[index] = subStep;
    updateAndSync({ subSteps: updated });
  };

  const showKeyboard = localStep.type === STEP_TYPES.NOTE || localStep.type === STEP_TYPES.FLAM;
  const hasSubSequence = localStep.subSteps?.some(s => s.type !== STEP_TYPES.REST);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '85%',
          maxWidth: 420,
          backgroundColor: COLORS.bg,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Type selector */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
        }}>
          {Object.entries(STEP_TYPES).map(([key, type]) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              style={{
                flex: 1,
                padding: '12px 8px',
                backgroundColor: localStep.type === type ? COLORS.cyan : COLORS.bgHighlight,
                color: localStep.type === type ? COLORS.bgDeep : COLORS.textMuted,
                border: 'none',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: localStep.type === type ? 'bold' : 'normal',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {showKeyboard && (
          <>
            {/* Octave selector - 7 octaves */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 16,
            }}>
              {[0, 1, 2, 3, 4, 5, 6].map(oct => (
                <button
                  key={oct}
                  onClick={() => handleOctaveChange(oct)}
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: octave === oct ? COLORS.cyan : COLORS.bgHighlight,
                    color: octave === oct ? COLORS.bgDeep : COLORS.textMuted,
                    border: 'none',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: octave === oct ? 'bold' : 'normal',
                    cursor: 'pointer',
                  }}
                >
                  {oct}
                </button>
              ))}
            </div>

            {/* Piano keys */}
            <div style={{
              position: 'relative',
              height: 120,
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                {WHITE_KEYS.map((noteNum) => {
                  const isSelected = localStep.note !== null && localStep.note % 12 === noteNum;
                  return (
                    <button
                      key={noteNum}
                      onClick={() => handleKeyClick(noteNum)}
                      style={{
                        width: 40,
                        height: 110,
                        backgroundColor: isSelected ? getNoteColor(noteNum) : COLORS.white,
                        border: 'none',
                        borderRadius: '0 0 6px 6px',
                        cursor: 'pointer',
                        opacity: isSelected ? 1 : 0.9,
                      }}
                    />
                  );
                })}
              </div>
              
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 308,
                display: 'flex',
                pointerEvents: 'none',
              }}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                  const hasBlack = [0, 1, 3, 4, 5].includes(i);
                  if (!hasBlack) return <div key={i} style={{ width: 44 }} />;
                  const blackKeyIndex = i < 2 ? i : i - 1;
                  const noteNum = BLACK_KEYS[blackKeyIndex];
                  const isSelected = localStep.note !== null && localStep.note % 12 === noteNum;
                  return (
                    <button
                      key={i}
                      onClick={() => handleKeyClick(noteNum)}
                      style={{
                        width: 28,
                        height: 70,
                        backgroundColor: isSelected ? getNoteColor(noteNum) : COLORS.bgDeep,
                        border: 'none',
                        borderRadius: '0 0 4px 4px',
                        cursor: 'pointer',
                        marginLeft: i === 0 ? 26 : 16,
                        pointerEvents: 'auto',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Velocity slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.textDim }}>VELOCITY</span>
                <span style={{ fontFamily: 'system-ui', fontSize: 14, color: COLORS.textMuted }}>
                  {Math.round(localStep.velocity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={localStep.velocity}
                onChange={(e) => updateAndSync({ velocity: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  height: 8,
                  appearance: 'none',
                  backgroundColor: COLORS.bgHighlight,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Sub-sequence toggle */}
            <button
              onClick={() => setShowSub(!showSub)}
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: hasSubSequence ? COLORS.cyan : COLORS.bgHighlight,
                color: hasSubSequence ? COLORS.bgDeep : COLORS.textMuted,
                border: 'none',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: hasSubSequence ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>{showSub ? '▼' : '▶'}</span>
              <span>SUB-SEQUENCE {hasSubSequence ? '(ACTIVE)' : ''}</span>
            </button>

            {/* Sub-sequence grid */}
            {showSub && (
              <div style={{
                marginTop: 16,
                padding: 16,
                backgroundColor: COLORS.bgDeep,
                borderRadius: 8,
              }}>
                <div style={{
                  display: 'flex',
                  gap: 4,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}>
                  {(localStep.subSteps || Array(8).fill(null).map(() => ({ type: STEP_TYPES.REST, note: null, velocity: 0.8 }))).map((sub, i) => (
                    <SubStep
                      key={i}
                      step={sub}
                      index={i}
                      size={40}
                      onUpdate={(s) => updateSubStep(i, s)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Step cell
const Step = ({ step, index, isPlaying, onTap, size }) => {
  const color = getStepColor(step);
  const isActive = step.type !== STEP_TYPES.REST;
  const hasSubSequence = step.subSteps?.some(s => s.type !== STEP_TYPES.REST);

  return (
    <div
      onClick={onTap}
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS.bgHighlight,
        borderRadius: size * 0.08,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        outline: isPlaying ? `2px solid ${color}` : 'none',
        outlineOffset: -1,
      }}
    >
      {isActive && step.type !== STEP_TYPES.TIE && (
        <div
          style={{
            position: 'absolute',
            inset: size * 0.1,
            borderRadius: step.type === STEP_TYPES.FLAM ? size * 0.05 : size * 0.06,
            backgroundColor: color,
            opacity: 0.2 + step.velocity * 0.5,
          }}
        />
      )}
      
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
          fontSize: size * 0.24,
          fontWeight: 500,
          color: isActive ? COLORS.white : COLORS.textDim,
          opacity: isActive ? 1 : 0.4,
          textShadow: isActive ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {getStepDisplay(step)}
      </div>

      <div
        style={{
          position: 'absolute',
          top: size * 0.04,
          right: size * 0.08,
          fontFamily: 'monospace',
          fontSize: size * 0.14,
          color: COLORS.textDim,
          opacity: 0.5,
        }}
      >
        {index + 1}
      </div>

      {/* Sub-sequence indicator */}
      {hasSubSequence && (
        <div
          style={{
            position: 'absolute',
            bottom: size * 0.08,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.15,
            height: size * 0.06,
            backgroundColor: COLORS.cyan,
            borderRadius: size * 0.03,
            opacity: 0.8,
          }}
        />
      )}
    </div>
  );
};

// Sub-step - simpler, inline in the popup
const SubStep = ({ step, index, onUpdate, size }) => {
  const color = getStepColor(step);
  const isActive = step.type !== STEP_TYPES.REST;

  // Click cycles through: REST -> NOTE (with default pitch) -> REST
  const handleClick = () => {
    if (step.type === STEP_TYPES.REST) {
      onUpdate({ ...step, type: STEP_TYPES.NOTE, note: 36, velocity: 0.8 }); // C3 default
    } else {
      onUpdate({ ...step, type: STEP_TYPES.REST, note: null });
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS.bgHighlight,
        borderRadius: 4,
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {isActive && step.type !== STEP_TYPES.TIE && (
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: 3,
            backgroundColor: color,
            opacity: 0.2 + step.velocity * 0.5,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
          fontSize: size * 0.28,
          fontWeight: 500,
          color: isActive ? COLORS.white : COLORS.textDim,
          opacity: isActive ? 1 : 0.4,
          textShadow: isActive ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {isActive ? '●' : '·'}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 3,
          fontFamily: 'monospace',
          fontSize: 6,
          color: COLORS.textDim,
          opacity: 0.5,
        }}
      >
        {index + 1}
      </div>
    </div>
  );
};

const NestedSequencer = () => {
  const containerRef = useRef(null);
  const [steps, setSteps] = useState(
    Array(16).fill(null).map(() => ({ type: STEP_TYPES.REST, note: null, velocity: 0.8, subSteps: null }))
  );
  const [playingStep, setPlayingStep] = useState(null);
  const [openPopup, setOpenPopup] = useState(null);
  const [gridSize, setGridSize] = useState(80);

  // Responsive sizing - more generous
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        const availableW = w - 32;
        const availableH = h - 32;
        const maxByWidth = Math.floor((availableW - 18) / 4);
        const maxByHeight = Math.floor((availableH - 18) / 4);
        setGridSize(Math.min(maxByWidth, maxByHeight, 160));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const updateStep = (i, newStep) => {
    const updated = [...steps];
    updated[i] = newStep;
    setSteps(updated);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenPopup(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: COLORS.bgDeep,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      {/* 4x4 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 6,
      }}>
        {steps.map((step, i) => (
          <Step
            key={i}
            step={step}
            index={i}
            isPlaying={Math.floor(playingStep) === i}
            onTap={() => setOpenPopup(i)}
            size={gridSize}
          />
        ))}
      </div>

      {/* Note popup */}
      {openPopup !== null && (
        <NotePopup
          step={steps[openPopup]}
          onUpdate={(s) => updateStep(openPopup, s)}
          onClose={() => setOpenPopup(null)}
        />
      )}
    </div>
  );
};

export default NestedSequencer;
