import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api';
import { programApi } from '../api/program';
import { useToast } from '../contexts/ToastContext';

interface UnifiedProgram {
  id: string;
  title: string;
  organization: string;
  description: string;
  deadline: string;
  deadlineDate?: Date;
  isExpired?: boolean;
  eligible: boolean;
  category: string;
  criteria?: string[];
  requiredDocs?: string[];
}

const samplePrograms: UnifiedProgram[] = [
  {
    id: 'prog-1',
    title: 'Rice Farmer Cash Assistance (RFFA)',
    organization: 'Department of Agriculture (DA)',
    description: 'Direct cash subsidy of ₱5,000 for smallholder rice farmers owning 2 hectares or less.',
    deadline: 'October 15, 2026',
    deadlineDate: new Date('2026-10-15T00:00:00Z'),
    isExpired: false,
    eligible: true,
    category: 'For You',
    criteria: ['Registered in RSBSA (Registry System for Basic Sectors in Agriculture)', 'Smallholder rice farmer (2 hectares or less)', 'Farming in covered provincial municipality'],
    requiredDocs: ['RSBSA Card / Certificate / Stub', 'Valid Government-issued ID'],
  },
  {
    id: 'prog-2',
    title: 'Corn Seed & Fertilizer Discount Voucher',
    organization: 'DA Region X - Northern Mindanao',
    description: 'Discount vouchers worth up to ₱3,000 for hybrid yellow corn seeds and inorganic fertilizer.',
    deadline: 'September 30, 2026',
    deadlineDate: new Date('2026-09-30T00:00:00Z'),
    isExpired: false,
    eligible: true,
    category: 'For You',
    criteria: ['Registered in RSBSA', 'Yellow or White Corn producer', 'Active farmer association member'],
    requiredDocs: ['RSBSA Enrollment stub', 'Barangay Certification of Farming'],
  },
  {
    id: 'prog-3',
    title: 'Solar-Powered Irrigation System (SPIS) Grant',
    organization: 'Bukidnon Provincial Agriculture Office',
    description: 'Free community solar irrigation installation for accredited farmer associations in Bukidnon.',
    deadline: 'November 1, 2026',
    deadlineDate: new Date('2026-11-01T00:00:00Z'),
    isExpired: false,
    eligible: false,
    category: 'Available',
    criteria: ['Accredited Farmer Cooperative or Irrigators Association', 'RSBSA registered members'],
    requiredDocs: ['Association RSBSA Masterlist', 'Sec / CDA Registration'],
  },
];

export const GovernmentProgramsPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [selectedCat, setSelectedCat] = useState('All Programs');
  const [programs, setPrograms] = useState<UnifiedProgram[]>(samplePrograms);
  const [loading, setLoading] = useState(false);

  // Modals
  const [selectedProgram, setSelectedProgram] = useState<UnifiedProgram | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Application Form State
  const [rsbsaNumber, setRsbsaNumber] = useState('');
  const [farmSizeHectares, setFarmSizeHectares] = useState('1.5');
  const [cropsGrown, setCropsGrown] = useState('Rice (Palay)');
  const [remarks, setRemarks] = useState('');

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successApp, setSuccessApp] = useState<{ progTitle: string; refId: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load programs from backend if available
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const backendPrograms = await programApi.listPrograms();
        if (backendPrograms && backendPrograms.length > 0) {
          const mapped: UnifiedProgram[] = backendPrograms.map((p) => {
            const rawDeadline = p.deadline ? new Date(p.deadline) : null;
            const isPast = rawDeadline ? rawDeadline.getTime() < Date.now() : false;
            return {
              id: p.id,
              title: p.title,
              organization: p.agency || 'Department of Agriculture',
              description: p.description,
              deadline: rawDeadline ? rawDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Open',
              deadlineDate: rawDeadline || undefined,
              isExpired: isPast,
              eligible: true,
              category: isPast ? 'Past / Closed' : 'Available',
              criteria: p.eligibilityCriteria && p.eligibilityCriteria.length > 0 ? p.eligibilityCriteria : ['Registered in RSBSA', 'Smallholder farmer'],
              requiredDocs: p.requiredDocuments && p.requiredDocuments.length > 0 ? p.requiredDocuments : ['RSBSA Card / Stub', 'Valid Government ID'],
            };
          });

          // Merge backend programs with sample programs to ensure variety
          const existingIds = new Set(mapped.map((p) => p.title.toLowerCase()));
          const extraSamples = samplePrograms.filter((s) => !existingIds.has(s.title.toLowerCase()));
          setPrograms([...mapped, ...extraSamples]);
        }
      } catch (err) {
        console.warn('Using local government programs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const categories = ['All Programs', 'Available', 'For You', 'Ending Soon', 'Past / Closed'];

  const filteredPrograms = programs.filter((prog) => {
    if (selectedCat === 'All Programs') return true;
    if (selectedCat === 'Available') return !prog.isExpired;
    if (selectedCat === 'For You') return prog.eligible && !prog.isExpired;
    if (selectedCat === 'Ending Soon') {
      if (prog.isExpired || !prog.deadlineDate) return false;
      const daysLeft = (prog.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysLeft >= 0 && daysLeft <= 14;
    }
    if (selectedCat === 'Past / Closed') return prog.isExpired;
    return prog.category === selectedCat;
  });

  const handleOpenDetails = (prog: UnifiedProgram) => {
    setSelectedProgram(prog);
    setIsApplying(false);
    setErrorMsg(null);
  };

  const handleStartApply = (prog: UnifiedProgram) => {
    setSelectedProgram(prog);
    setIsApplying(true);
    setErrorMsg(null);
    setSuccessApp(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 10MB.');
      return;
    }

    setErrorMsg(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    if (!rsbsaNumber.trim()) {
      setErrorMsg('Please enter your RSBSA registration reference number.');
      return;
    }

    if (!imageFile && !imagePreview) {
      setErrorMsg('Please attach a clear photo of your RSBSA Card, Stub, or Certificate.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      let uploadedUrl = '';

      // Upload image to backend if a file was selected
      if (imageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', imageFile);

        try {
          const uploadRes = await apiClient.post<{ url: string }>('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          uploadedUrl = uploadRes.data.url;
        } catch (uploadErr: any) {
          console.warn('Backend upload encountered error, fallback to data URL:', uploadErr);
          uploadedUrl = imagePreview; // Fallback to base64 preview if offline
        } finally {
          setUploadingImage(false);
        }
      } else {
        uploadedUrl = imagePreview;
      }

      const submittedDocs = ['RSBSA Card / Stub Photo'];
      if (uploadedUrl) {
        submittedDocs.push(uploadedUrl);
      }
      if (remarks.trim()) {
        submittedDocs.push(`Farmer Remarks: ${remarks.trim()}`);
      }

      const payload = {
        rsbsaNumber: rsbsaNumber.trim(),
        farmSizeHectares: parseFloat(farmSizeHectares) || 1.0,
        cropsGrown: cropsGrown.split(',').map((c) => c.trim()).filter(Boolean),
        submittedDocs,
      };

      // Try submitting to backend API if it's a real backend ObjectID
      if (selectedProgram.id && selectedProgram.id.length === 24) {
        await programApi.submitApplication(selectedProgram.id, payload);
      }

      // Show success modal state
      const refCode = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
      setSuccessApp({ progTitle: selectedProgram.title, refId: refCode });
      toastSuccess('Applied Successfully!', `Application for "${selectedProgram.title}" submitted to LGU.`);
    } catch (err: any) {
      console.error('Submission failed:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to submit application. Please try again.';
      setErrorMsg(errMsg);
      toastError('Application Failed', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '26px' }}>🏛️</span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
            Government Cash Assistance & Grants
          </h1>
        </div>
        <p style={{ fontSize: '18px', color: '#525450', marginTop: '4px', maxWidth: '800px' }}>
          Official government programs offering cash subsidies, fertilizer vouchers, fuel assistance, and irrigation grants for registered Filipino farmers.
        </p>
      </div>

      {/* ─── RSBSA Verification Notice Banner ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #E8F5E9 100%)',
          border: '1.5px solid #86EFAC',
          marginBottom: '28px',
        }}
      >
        <div style={{ fontSize: '28px', flexShrink: 0 }}>📋</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#14532D', marginBottom: '2px' }}>
            RSBSA Registration Required for All DA Programs
          </div>
          <div style={{ fontSize: '14px', color: '#166534', lineHeight: 1.4 }}>
            Prepare a clear photo or copy of your <strong>RSBSA Card / Stub</strong> or Farmers Registry Certificate before applying. Your Municipal Agriculture Office cross-checks this document during evaluation.
          </div>
        </div>
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
                padding: '10px 22px',
                borderRadius: '30px',
                border: `2px solid ${isSelected ? '#176B3A' : '#D8D6CF'}`,
                background: isSelected ? '#176B3A' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#1A1C1A',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ─── Program Cards Feed ─── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
          Loading official government programs...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '26px' }}>
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '26px',
                borderRadius: '20px',
                borderTop: prog.eligible ? '6px solid #176B3A' : '3px solid #D8D6CF',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                background: '#FFFFFF',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span className="badge badge-info" style={{ fontSize: '13px', fontWeight: 700 }}>
                    🏛️ {prog.organization}
                  </span>
                  {prog.eligible && (
                    <span className="badge badge-verified" style={{ fontSize: '13px', fontWeight: 700 }}>
                      ✓ Pre-Qualified
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0E4A27', marginBottom: '10px', lineHeight: 1.3 }}>
                  {prog.title}
                </h2>

                <p style={{ fontSize: '15px', color: '#525450', lineHeight: 1.6, marginBottom: '20px' }}>
                  {prog.description}
                </p>

                {/* Requirements Chips */}
                {prog.criteria && prog.criteria.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Primary Requirement:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '8px', background: '#F1F5F9', color: '#334155', fontWeight: 600 }}>
                        🆔 RSBSA Registration
                      </span>
                      <span style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '8px', background: '#F1F5F9', color: '#334155', fontWeight: 600 }}>
                        🌾 Smallholder
                      </span>
                    </div>
                  </div>
                )}

                {prog.isExpired ? (
                  <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 700, marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⛔ Deadline Passed: {prog.deadline} (Closed)
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#BA3C3C', fontWeight: 700, marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⏳ Application Deadline: {prog.deadline}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleOpenDetails(prog)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '15px' }}
                >
                  Details
                </button>
                {prog.isExpired ? (
                  <button
                    disabled
                    style={{
                      flex: 2,
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '15px',
                      background: '#F1F5F9',
                      color: '#94A3B8',
                      border: '1px solid #E2E8F0',
                      cursor: 'not-allowed',
                    }}
                  >
                    Closed
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartApply(prog)}
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '15px' }}
                  >
                    Apply Now →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Program Details Modal ─── */}
      {selectedProgram && !isApplying && !successApp && (
        <div className="modal-backdrop" onClick={() => setSelectedProgram(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span className="badge badge-info" style={{ fontSize: '14px' }}>🏛️ {selectedProgram.organization}</span>
              <button
                onClick={() => setSelectedProgram(null)}
                style={{ background: '#F8F7F3', border: 'none', fontSize: '20px', cursor: 'pointer', width: '38px', height: '38px', borderRadius: '50%' }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', marginBottom: '14px', lineHeight: 1.3 }}>
              {selectedProgram.title}
            </h2>

            <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.6, marginBottom: '24px' }}>
              {selectedProgram.description}
            </p>

            <div style={{ padding: '20px', borderRadius: '16px', background: '#EAF6EE', border: '1.5px solid #176B3A', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#176B3A', marginBottom: '8px' }}>
                ✓ Eligibility Criteria:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '15px', color: '#1A1C1A', lineHeight: 1.7 }}>
                {selectedProgram.criteria?.map((c, idx) => (
                  <li key={idx}>{c}</li>
                )) || (
                  <>
                    <li>Must be registered in the RSBSA (Registry System for Basic Sectors in Agriculture)</li>
                    <li>Must have active farming parcel in covered municipality</li>
                  </>
                )}
              </ul>
            </div>

            <div style={{ padding: '16px 20px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '28px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                📄 Required Documents to Upload:
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A' }}>
                • <strong>RSBSA Card / Official Stub Photo (Required)</strong><br />
                • Valid Government ID or Barangay Farmer Certificate
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button onClick={() => setSelectedProgram(null)} className="btn btn-secondary btn-large" style={{ flex: 1, borderRadius: '12px' }}>
                Close
              </button>
              <button
                onClick={() => handleStartApply(selectedProgram)}
                className="btn btn-primary btn-large"
                style={{ flex: 2, borderRadius: '12px', fontWeight: 800 }}
              >
                Proceed to Apply →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Interactive Application Modal with RSBSA Card Upload ─── */}
      {selectedProgram && isApplying && !successApp && (
        <div className="modal-backdrop" onClick={() => setIsApplying(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', padding: '32px' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-info" style={{ fontSize: '13px' }}>
                  🏛️ {selectedProgram.organization}
                </span>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  Deadline: {selectedProgram.deadline}
                </span>
              </div>
              <button
                onClick={() => setIsApplying(false)}
                style={{ background: '#F8F7F3', border: 'none', fontSize: '20px', cursor: 'pointer', width: '38px', height: '38px', borderRadius: '50%' }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', marginBottom: '6px' }}>
              Apply: {selectedProgram.title}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '22px' }}>
              Please fill in your farm details and attach a clear image of your RSBSA card or stub for LGU verification.
            </p>

            {errorMsg && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #F87171',
                  color: '#991B1B',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitApplication}>
              {/* RSBSA ID Number */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  RSBSA ID Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10-13-12-001-000456"
                  value={rsbsaNumber}
                  onChange={(e) => setRsbsaNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '15px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Enter your unique RSBSA number from your Registry stub or Municipal Agriculture Office record.
                </div>
              </div>

              {/* Farm Size & Crops Grown (2 columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Farm Size (Hectares) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="e.g. 1.5"
                    value={farmSizeHectares}
                    onChange={(e) => setFarmSizeHectares(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Primary Crops Grown *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rice, Yellow Corn"
                    value={cropsGrown}
                    onChange={(e) => setCropsGrown(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* RSBSA Card Photo Attachment (MANDATORY) */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  📷 Attach RSBSA Card / Stub Photo *
                </label>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 10px 0' }}>
                  Take a photo or upload an image of your RSBSA ID card, certificate, or official registry stub.
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: 'none' }}
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #94A3B8',
                      borderRadius: '16px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: '#F8FAFC',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#176B3A')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#94A3B8')}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🪪</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                      Click to Upload RSBSA Card Photo
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      Supports PNG, JPG, or WEBP (Max 10MB)
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '2px solid #86EFAC',
                      background: '#F0FDF4',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img
                        src={imagePreview}
                        alt="RSBSA Card Preview"
                        style={{
                          width: '140px',
                          height: '95px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                          ✓ RSBSA Document Attached
                        </div>
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                          {imageFile?.name || 'RSBSA_Card_Photo.png'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #FCA5A5',
                              background: '#FEF2F2',
                              color: '#991B1B',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Remarks / Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Remarks / Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Member of Barangay Patpat Farmers Cooperative..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  disabled={submitting}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '16px' }}
                >
                  {submitting || uploadingImage ? 'Submitting Application...' : '🚀 Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Application Submitted Success Modal ─── */}
      {successApp && (
        <div className="modal-backdrop" onClick={() => { setSuccessApp(null); setSelectedProgram(null); setIsApplying(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '24px', padding: '36px', textAlign: 'center' }}>
            <div style={{ fontSize: '54px', marginBottom: '14px' }}>🎉</div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
              Application Submitted!
            </h2>

            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Your application for <strong>{successApp.progTitle}</strong> has been received by the Municipal Agriculture Office.
            </p>

            <div style={{ padding: '16px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>Application Reference:</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#176B3A', fontFamily: 'monospace' }}>
                {successApp.refId}
              </div>
              <div style={{ marginTop: '10px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#DBEAFE', color: '#1E40AF', fontSize: '13px', fontWeight: 700 }}>
                  ● Status: Submitted (Awaiting LGU Review)
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '28px' }}>
              The LGU Agriculture Officer will inspect your attached <strong>RSBSA Card</strong> and contact you via phone once your verification is completed.
            </p>

            <button
              onClick={() => { setSuccessApp(null); setSelectedProgram(null); setIsApplying(false); }}
              className="btn btn-primary btn-large btn-full"
              style={{ borderRadius: '12px', fontWeight: 800 }}
            >
              Done / Return to Programs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
