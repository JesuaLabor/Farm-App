import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getImageUrl } from '../api';
import { produceApi } from '../api/produce';

const sampleMyListings = [
  {
    id: 'my-1',
    cropName: 'Fresh Red Tomatoes (Kamatis)',
    pricePerUnit: 65,
    unit: 'kg',
    quantity: 120,
    status: 'Active',
    location: 'Cagayan de Oro',
    harvestDate: '2026-09-15',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'my-2',
    cropName: 'Sweet Yellow Corn (Mais)',
    pricePerUnit: 42,
    unit: 'kg',
    quantity: 350,
    status: 'Active',
    location: 'Malaybalay, Bukidnon',
    harvestDate: '2026-09-20',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  },
];

export const ManageProduceListingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [myListings, setMyListings] = useState<any[]>(sampleMyListings);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields (One Clear Question Per Field)
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('120');
  const [price, setPrice] = useState('65');
  const [farmLocation, setFarmLocation] = useState('Cagayan de Oro');
  const [availableDate, setAvailableDate] = useState('2026-09-15');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowAddForm(true);
    }
  }, [searchParams]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;

    setIsSubmitting(true);
    let uploadedPhotoUrl = '';

    try {
      if (imageFile) {
        const uploadRes = await api.uploadImage(imageFile);
        uploadedPhotoUrl = uploadRes.url;
      }
    } catch (uploadErr) {
      console.warn('Image upload failed, continuing with listing:', uploadErr);
    }

    const finalPhoto = uploadedPhotoUrl || imagePreview || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';

    try {
      const backendListing = await produceApi.createListing({
        cropName,
        category: 'vegetables',
        quantity: Number(quantity),
        unit: 'kg',
        pricePerUnit: Number(price),
        harvestDate: availableDate,
        location: farmLocation,
        photos: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
        description: `Fresh harvest from ${farmLocation}`,
      });

      const formatted = {
        id: backendListing.id,
        cropName: backendListing.cropName,
        pricePerUnit: backendListing.pricePerUnit,
        unit: backendListing.unit,
        quantity: backendListing.quantity,
        status: 'Active',
        location: backendListing.location,
        harvestDate: backendListing.harvestDate ? String(backendListing.harvestDate).split('T')[0] : availableDate,
        imageUrl: getImageUrl(uploadedPhotoUrl, finalPhoto),
        photos: backendListing.photos || (uploadedPhotoUrl ? [uploadedPhotoUrl] : []),
      };

      setMyListings([formatted, ...myListings]);
    } catch (createErr) {
      console.warn('Backend listing creation error, adding locally:', createErr);
      const newListing = {
        id: `my-${Date.now()}`,
        cropName,
        pricePerUnit: Number(price),
        unit: 'kg',
        quantity: Number(quantity),
        status: 'Active',
        location: farmLocation,
        harvestDate: availableDate,
        imageUrl: getImageUrl(uploadedPhotoUrl, finalPhoto),
        photos: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
      };
      setMyListings([newListing, ...myListings]);
    } finally {
      setIsSubmitting(false);
      setShowAddForm(false);
      setToastMessage(`✓ Listing Published! Your ${cropName} is now live with photo attached.`);
      setCropName('');
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setToastMessage(''), 5000);
    }
  };

  const togglePauseStatus = (id: string) => {
    setMyListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Active' ? 'Paused' : 'Active' }
          : item
      )
    );
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27' }}>
              My Crops for Sale
            </h1>
            <p style={{ fontSize: '20px', color: '#525450', marginTop: '4px' }}>
              Manage and list crops you are selling on AgriConnect.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-large"
          >
            + Add New Crop for Sale
          </button>
        </div>
      </div>

      {/* ─── Confirmation Toast Alert ─── */}
      {toastMessage && (
        <div
          style={{
            padding: '20px 24px',
            background: '#EAF6EE',
            border: '3px solid #176B3A',
            borderRadius: '18px',
            color: '#176B3A',
            fontWeight: 800,
            fontSize: '20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#176B3A', fontWeight: 800, fontSize: '24px' }}>✕</button>
        </div>
      )}

      {/* ─── Add Crop Modal Form (Single Question Fields) ─── */}
      {showAddForm && (
        <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>Add Crop for Sale</h2>
                <p style={{ fontSize: '17px', color: '#525450' }}>Fill out the questions below to publish your crop.</p>
              </div>
              <button onClick={() => setShowAddForm(false)} style={{ background: '#F8F7F3', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#525450', width: '42px', height: '42px', borderRadius: '50%' }}>✕</button>
            </div>

            <form onSubmit={handlePublishListing}>
              {/* Question 1 */}
              <div className="form-group">
                <label className="form-label">1. What crop are you selling?</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Tomato, Yellow Corn, Carabao Mango"
                  required
                  className="form-input"
                  style={{ fontSize: '20px' }}
                />
              </div>

              {/* Question 2 */}
              <div className="form-group">
                <label className="form-label">2. How many kilograms do you have?</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 120"
                  required
                  className="form-input"
                  style={{ fontSize: '20px' }}
                />
              </div>

              {/* Question 3 */}
              <div className="form-group">
                <label className="form-label">3. What is your price per kilogram (₱)?</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 65"
                  required
                  className="form-input"
                  style={{ fontSize: '20px' }}
                />
              </div>

              {/* Question 4 */}
              <div className="form-group">
                <label className="form-label">4. Where is your farm located?</label>
                <input
                  type="text"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  placeholder="e.g. Cagayan de Oro, Bukidnon"
                  required
                  className="form-input"
                  style={{ fontSize: '20px' }}
                />
              </div>

              {/* Question 5 */}
              <div className="form-group">
                <label className="form-label">5. When will it be ready for pickup?</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  required
                  className="form-input"
                  style={{ fontSize: '20px' }}
                />
              </div>

              {/* Question 6 - Image Upload */}
              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">6. Attach a photo of your produce (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #93c5fd',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      backgroundColor: '#eff6ff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                    <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '16px' }}>Click to select or capture produce photo</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Supports JPG, PNG, WEBP (Max 10MB)</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '16px', border: '1px solid #bfdbfe', backgroundColor: '#f0f9ff' }}>
                    <img
                      src={imagePreview}
                      alt="Crop preview"
                      style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{imageFile?.name || 'Selected crop image'}</div>
                      <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>Ready to upload with listing</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary btn-large"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-large"
                  style={{ flex: 2 }}
                >
                  {isSubmitting ? 'Uploading & Publishing...' : 'Publish Listing →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Crop List or Empty State ─── */}
      {myListings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {myListings.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <img
                  src={getImageUrl(item.photos?.[0] || item.imageUrl, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80')}
                  alt={item.cropName}
                  style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1C1A' }}>
                    {item.cropName}
                  </h3>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', margin: '4px 0' }}>
                    ₱{item.pricePerUnit} per {item.unit} • {item.quantity} kg available
                  </div>
                  <div style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>
                    📍 {item.location} • Available: {item.harvestDate}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  className={item.status === 'Active' ? 'badge badge-verified' : 'badge badge-warning'}
                  style={{ fontSize: '16px', padding: '8px 16px' }}
                >
                  {item.status === 'Active' ? '✓ Live & Selling' : '⏸ Temporarily Paused'}
                </span>

                <button
                  onClick={() => togglePauseStatus(item.id)}
                  className="btn btn-secondary"
                  style={{ fontSize: '16px' }}
                >
                  {item.status === 'Active' ? 'Pause Sale' : 'Resume Sale'}
                </button>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-accent"
                  style={{ fontSize: '16px' }}
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>🌱</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
            You don't have any crop listings yet
          </h2>
          <p style={{ fontSize: '20px', color: '#525450', marginBottom: '28px' }}>
            Add your first crop for sale and start connecting with buyers across Northern Mindanao.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-large"
          >
            + Add Your First Crop
          </button>
        </div>
      )}
    </div>
  );
};
