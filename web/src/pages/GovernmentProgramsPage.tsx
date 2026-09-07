import React, { useState } from 'react';

const samplePrograms = [
  {
    id: 'prog-1',
    title: 'Rice Farmer Cash Assistance (RFFA)',
    organization: 'Department of Agriculture (DA)',
    description: 'Direct cash subsidy of ₱5,000 for smallholder rice farmers owning 2 hectares or less.',
    deadline: 'October 15, 2026',
    eligible: true,
    category: 'For You',
  },
  {
    id: 'prog-2',
    title: 'Corn Seed & Fertilizer Discount Voucher',
    organization: 'DA Region X - Northern Mindanao',
    description: 'Discount vouchers worth up to ₱3,000 for hybrid yellow corn seeds and inorganic fertilizer.',
    deadline: 'September 30, 2026',
    eligible: true,
    category: 'For You',
  },
  {
    id: 'prog-3',
    title: 'Solar-Powered Irrigation System (SPIS) Grant',
    organization: 'Bukidnon Provincial Agriculture Office',
    description: 'Free community solar irrigation installation for accredited farmer associations in Bukidnon.',
    deadline: 'November 1, 2026',
    eligible: false,
    category: 'Available',
  },
];

export const GovernmentProgramsPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState('All Programs');
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

  const categories = ['All Programs', 'For You', 'Ending Soon', 'Available'];

  const filteredPrograms = samplePrograms.filter((prog) => {
    if (selectedCat === 'All Programs') return true;
    if (selectedCat === 'For You') return prog.eligible;
    return prog.category === selectedCat;
  });

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Back Button & Header ─── */}
      {/* ─── Page Title ─── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27' }}>
          Government Cash Assistance & Grants
        </h1>
        <p style={{ fontSize: '20px', color: '#525450', marginTop: '4px' }}>
          Official government programs offering cash subsidies, fertilizer vouchers, and free equipment for farmers.
        </p>
      </div>

      {/* ─── Category Filter Tabs ─── */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '32px' }}>
        {categories.map((cat) => {
          const isSelected = selectedCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                padding: '12px 24px',
                borderRadius: '30px',
                border: `2.5px solid ${isSelected ? '#176B3A' : '#D8D6CF'}`,
                background: isSelected ? '#176B3A' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#1A1C1A',
                fontWeight: 800,
                fontSize: '18px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ─── Program Cards Feed ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {filteredPrograms.map((prog) => (
          <div
            key={prog.id}
            className="card card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '28px',
              borderTop: prog.eligible ? '6px solid #176B3A' : '2px solid #D8D6CF',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="badge badge-info" style={{ fontSize: '15px' }}>
                  🏛 {prog.organization}
                </span>
                {prog.eligible && (
                  <span className="badge badge-verified" style={{ fontSize: '15px' }}>
                    ✓ You may qualify for this subsidy
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', marginBottom: '10px' }}>
                {prog.title}
              </h2>

              <p style={{ fontSize: '18px', color: '#525450', lineHeight: 1.6, marginBottom: '20px' }}>
                {prog.description}
              </p>

              <div style={{ fontSize: '16px', color: '#BA3C3C', fontWeight: 800, marginBottom: '24px' }}>
                ⏳ Application Deadline: {prog.deadline}
              </div>
            </div>

            <button
              onClick={() => setSelectedProgram(prog)}
              className="btn btn-primary btn-large btn-full"
            >
              View Details & Apply →
            </button>
          </div>
        ))}
      </div>

      {/* ─── Program Details Modal ─── */}
      {selectedProgram && (
        <div className="modal-backdrop" onClick={() => setSelectedProgram(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span className="badge badge-info">🏛 {selectedProgram.organization}</span>
              <button onClick={() => setSelectedProgram(null)} style={{ background: '#F8F7F3', border: 'none', fontSize: '24px', cursor: 'pointer', width: '42px', height: '42px', borderRadius: '50%' }}>✕</button>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', marginBottom: '14px' }}>
              {selectedProgram.title}
            </h2>

            <p style={{ fontSize: '18px', color: '#1A1C1A', lineHeight: 1.6, marginBottom: '24px' }}>
              {selectedProgram.description}
            </p>

            <div style={{ padding: '20px', borderRadius: '16px', background: '#EAF6EE', border: '2px solid #176B3A', marginBottom: '28px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#176B3A', marginBottom: '6px' }}>
                ✓ Eligibility Requirements:
              </div>
              <div style={{ fontSize: '17px', color: '#1A1C1A', lineHeight: 1.6 }}>
                • Must be registered in RSBSA (Registry System for Basic Sectors in Agriculture)<br />
                • Must farm in Northern Mindanao region (CDO, Bukidnon, Misamis Oriental)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button onClick={() => setSelectedProgram(null)} className="btn btn-secondary btn-large" style={{ flex: 1 }}>
                Close
              </button>
              <button
                onClick={() => alert(`Application submitted for ${selectedProgram.title}! LGU officer will call your phone.`)}
                className="btn btn-primary btn-large"
                style={{ flex: 2 }}
              >
                Apply Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
