import React, { useState } from 'react';

interface FarmerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerOnboardingModal: React.FC<FarmerOnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Rice', 'Vegetables']);
  const [selectedLocation, setSelectedLocation] = useState('Cagayan de Oro, Misamis Oriental');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Sell my crops', 'Check market prices']);

  if (!isOpen) return null;

  const cropOptions = ['Rice', 'Corn', 'Vegetables', 'Fruits', 'Root Crops', 'Livestock', 'Other'];

  const locations = [
    'Cagayan de Oro, Misamis Oriental',
    'Malaybalay, Bukidnon',
    'Valencia, Bukidnon',
    'Gingoog, Misamis Oriental',
    'Oroquieta, Misamis Occidental',
    'Iligan, Lanao del Norte',
  ];

  const goalOptions = [
    'Sell my crops',
    'Buy farm supplies',
    'Check market prices',
    'Track farm finances',
    'Find government programs',
    'Learn from other farmers',
  ];

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                background: s <= step ? '#176B3A' : '#E4E2DC',
                transition: 'background 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🌾</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
              Welcome to AgriConnect!
            </h2>
            <p style={{ fontSize: '18px', color: '#6F716C', marginBottom: '28px', lineHeight: 1.5 }}>
              Let's set up your farm in less than 1 minute so you can start selling crops and seeing today's market prices.
            </p>
            <button
              onClick={() => setStep(2)}
              className="btn btn-primary btn-large btn-full"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: What do you grow? */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
              What do you grow?
            </h2>
            <p style={{ fontSize: '16px', color: '#6F716C', marginBottom: '20px' }}>
              Select all crops or livestock produced on your farm:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '28px' }}>
              {cropOptions.map((crop) => {
                const isSelected = selectedCrops.includes(crop);
                return (
                  <button
                    key={crop}
                    onClick={() => toggleCrop(crop)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? '#176B3A' : '#E4E2DC'}`,
                      background: isSelected ? '#EAF6EE' : '#FFFFFF',
                      color: isSelected ? '#176B3A' : '#222522',
                      fontWeight: 700,
                      fontSize: '17px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{crop}</span>
                    {isSelected && <span style={{ fontSize: '18px' }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                Back
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Where is your farm? */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
              Where is your farm?
            </h2>
            <p style={{ fontSize: '16px', color: '#6F716C', marginBottom: '20px' }}>
              Select your municipality or province in Northern Mindanao:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${selectedLocation === loc ? '#176B3A' : '#E4E2DC'}`,
                    background: selectedLocation === loc ? '#EAF6EE' : '#FFFFFF',
                    color: selectedLocation === loc ? '#176B3A' : '#222522',
                    fontWeight: 700,
                    fontSize: '17px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>📍 {loc}</span>
                  {selectedLocation === loc && <span>✓</span>}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>
                Back
              </button>
              <button onClick={() => setStep(4)} className="btn btn-primary" style={{ flex: 2 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Goals */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
              What would you like to do?
            </h2>
            <p style={{ fontSize: '16px', color: '#6F716C', marginBottom: '20px' }}>
              Choose your main goals on AgriConnect:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {goalOptions.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? '#176B3A' : '#E4E2DC'}`,
                      background: isSelected ? '#EAF6EE' : '#FFFFFF',
                      color: isSelected ? '#176B3A' : '#222522',
                      fontWeight: 700,
                      fontSize: '17px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{goal}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(3)} className="btn btn-secondary" style={{ flex: 1 }}>
                Back
              </button>
              <button onClick={() => setStep(5)} className="btn btn-primary" style={{ flex: 2 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: All set! */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
              You're all set!
            </h2>
            <p style={{ fontSize: '18px', color: '#6F716C', marginBottom: '24px', lineHeight: 1.5 }}>
              Your farm setup is saved. You can now view today's market prices, list your crops for sale, and explore government programs.
            </p>
            <div
              style={{
                padding: '16px',
                background: '#EAF6EE',
                borderRadius: '12px',
                border: '1px solid #176B3A',
                marginBottom: '28px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 800, color: '#176B3A', fontSize: '16px', marginBottom: '4px' }}>
                Summary:
              </div>
              <div style={{ fontSize: '15px', color: '#222522' }}>
                📍 <strong>Location:</strong> {selectedLocation}<br />
                🌽 <strong>Crops:</strong> {selectedCrops.join(', ')}
              </div>
            </div>
            <button onClick={onClose} className="btn btn-primary btn-large btn-full">
              Go to My Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
