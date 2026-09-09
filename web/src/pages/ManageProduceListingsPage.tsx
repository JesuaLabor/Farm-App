import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getImageUrl } from '../api';
import { produceApi } from '../api/produce';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import type { ProduceListing, ListingStatus } from '../types/produce';

export const ManageProduceListingsPage: React.FC = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [searchParams] = useSearchParams();

  const [myListings, setMyListings] = useState<ProduceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add / Edit Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingListing, setEditingListing] = useState<ProduceListing | null>(null);

  // Form Fields
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('50');
  const [farmLocation, setFarmLocation] = useState('');
  const [availableDate, setAvailableDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load farmer's actual listings from backend
  const loadListings = async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        const data = await produceApi.listListings({ farmerId: user.id });
        setMyListings(data);
      } else {
        // Fallback to all listings if user ID not yet available
        const all = await produceApi.listListings();
        setMyListings(all);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [user?.id]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddModal();
    }
  }, [searchParams]);

  const defaultUserLocation = user
    ? [user.barangay, user.municipality, user.province].filter(Boolean).join(', ') || user.address || ''
    : '';

  const openAddModal = () => {
    setEditingListing(null);
    setCropName('');
    setCategory('vegetables');
    setQuantity('100');
    setUnit('kg');
    setPrice('50');
    setFarmLocation(defaultUserLocation || 'Northern Mindanao');
    setAvailableDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setImageFile(null);
    setImagePreview('');
    setExistingPhotos([]);
    setShowFormModal(true);
  };

  const openEditModal = (item: ProduceListing) => {
    setEditingListing(item);
    setCropName(item.cropName);
    setCategory(item.category || 'vegetables');
    setQuantity(String(item.quantity));
    setUnit(item.unit || 'kg');
    setPrice(String(item.pricePerUnit));
    setFarmLocation(item.location || '');
    setAvailableDate(item.harvestDate ? String(item.harvestDate).split('T')[0] : '');
    setDescription(item.description || '');
    setImageFile(null);
    setImagePreview('');
    setExistingPhotos(item.photos || []);
    setShowFormModal(true);
  };

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
    setExistingPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveListing = async (e: React.FormEvent) => {
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

    const finalPhotos = uploadedPhotoUrl
      ? [uploadedPhotoUrl]
      : existingPhotos.length > 0
      ? existingPhotos
      : [];

    try {
      const finalDescription = description.trim() || `Fresh harvest from ${farmLocation.trim()}`;

      if (editingListing) {
        // Update existing listing
        await produceApi.updateListing(editingListing.id, {
          cropName: cropName.trim(),
          category,
          quantity: Number(quantity) || 1,
          unit: unit.trim() || 'kg',
          pricePerUnit: Number(price) || 0,
          harvestDate: availableDate,
          location: farmLocation.trim(),
          photos: finalPhotos,
          description: finalDescription,
          status: editingListing.status === 'sold' && Number(quantity) > 0 ? 'available' : editingListing.status,
        });
        toastSuccess('Listing Updated!', `"${cropName}" changes have been saved.`);
      } else {
        // Create new listing
        await produceApi.createListing({
          cropName: cropName.trim(),
          category,
          quantity: Number(quantity) || 1,
          unit: unit.trim() || 'kg',
          pricePerUnit: Number(price) || 0,
          harvestDate: availableDate,
          location: farmLocation.trim(),
          photos: finalPhotos,
          description: finalDescription,
        });
        toastSuccess('Listing Published!', `"${cropName}" is now live on the marketplace.`);
      }

      await loadListings();
      setShowFormModal(false);
    } catch (err: any) {
      console.error('Failed to save listing:', err);
      toastError('Save Failed', err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePauseStatus = async (item: ProduceListing) => {
    const newStatus: ListingStatus = item.status === 'available' ? 'reserved' : 'available';
    try {
      // Optimistic update
      setMyListings((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, status: newStatus } : l))
      );
      await produceApi.updateListing(item.id, {
        cropName: item.cropName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        harvestDate: item.harvestDate,
        location: item.location,
        photos: item.photos,
        status: newStatus,
      });
      if (newStatus === 'available') {
        toastSuccess('Listing Live', `"${item.cropName}" is now accepting orders!`);
      } else {
        toastInfo('Listing Paused', `"${item.cropName}" is paused from marketplace search.`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toastError('Update Failed', 'Could not update listing status.');
      loadListings();
    }
  };

  const [listingToDelete, setListingToDelete] = useState<ProduceListing | null>(null);
  const [isDeletingListing, setIsDeletingListing] = useState(false);

  const handleConfirmDeleteListing = async () => {
    if (!listingToDelete) return;
    setIsDeletingListing(true);
    try {
      await produceApi.deleteListing(listingToDelete.id);
      toastInfo('Listing Deleted', `Listing for "${listingToDelete.cropName}" has been removed.`);
      setListingToDelete(null);
      loadListings();
    } catch (err: any) {
      toastError('Delete Failed', err.response?.data?.error || err.message);
    } finally {
      setIsDeletingListing(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
              My Crops for Sale
            </h1>
            <p style={{ fontSize: '16px', color: '#525450', marginTop: '6px', margin: 0 }}>
              Manage and list real harvests you are selling on the AgriConnect Marketplace.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="btn btn-primary btn-large"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '16px', fontWeight: 800 }}
          >
            <span>+ Add New Crop for Sale</span>
          </button>
        </div>
      </div>

      {/* ─── Add / Edit Crop Modal Form ─── */}
      {showFormModal && (
        <div className="modal-backdrop" onClick={() => setShowFormModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
                  {editingListing ? 'Edit Crop Details' : 'Add Crop for Sale'}
                </h2>
                <p style={{ fontSize: '14px', color: '#525450', marginTop: '4px', margin: 0 }}>
                  {editingListing
                    ? 'Update the price, quantity, or details of your crop.'
                    : 'Fill out the details below to publish your harvest to local buyers.'}
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                style={{
                  background: '#F8F7F3',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#525450',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveListing}>
              {/* Crop Name */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  1. What crop are you selling? *
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Tomato (Kamatis), Sweet Corn (Mais), Marang"
                  required
                  className="form-input"
                  style={{ fontSize: '15px', padding: '12px 14px' }}
                />
              </div>

              {/* Category */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  2. Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '15px', padding: '12px 14px' }}
                >
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="Grains & Cereals">Grains & Cereals</option>
                  <option value="Root Crops">Root Crops</option>
                  <option value="Spices & Herbs">Spices & Herbs</option>
                </select>
              </div>

              {/* Quantity & Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                    3. Total Quantity Available *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 100"
                    min="1"
                    required
                    className="form-input"
                    style={{ fontSize: '15px', padding: '12px 14px' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kg, sack, crate"
                    required
                    className="form-input"
                    style={{ fontSize: '15px', padding: '12px 14px' }}
                  />
                </div>
              </div>

              {/* Price per unit */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  4. Price per {unit || 'unit'} (₱) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 65"
                  min="0"
                  step="any"
                  required
                  className="form-input"
                  style={{ fontSize: '15px', padding: '12px 14px' }}
                />
              </div>

              {/* Location */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  5. Farm / Pickup Location *
                </label>
                <input
                  type="text"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  placeholder="e.g. Brgy. Carmen, Cagayan de Oro"
                  required
                  className="form-input"
                  style={{ fontSize: '15px', padding: '12px 14px' }}
                />
              </div>

              {/* Available / Harvest Date */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  6. When is it harvested / ready for pickup? *
                </label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  required
                  className="form-input"
                  style={{ fontSize: '15px', padding: '12px 14px' }}
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  7. Produce Description (optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your crop (e.g. freshly picked, organically grown, grade A size, sweet variety, ideal for retail or bulk buyers)..."
                  className="form-input"
                  style={{ fontSize: '14px', padding: '10px 14px', width: '100%', borderRadius: '10px', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              {/* Image Upload */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  8. Attach Produce Photo (optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />

                {!imagePreview && existingPhotos.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #93c5fd',
                      borderRadius: '14px',
                      padding: '20px',
                      textAlign: 'center',
                      backgroundColor: '#eff6ff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>📷</div>
                    <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '15px' }}>Click to upload fresh harvest photo</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Supports JPG, PNG, WEBP</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', borderRadius: '14px', border: '1.5px solid #bfdbfe', backgroundColor: '#f0f9ff' }}>
                    <img
                      src={imagePreview || getImageUrl(existingPhotos[0], '')}
                      alt="Crop preview"
                      style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {imageFile?.name || 'Current crop photo'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>Ready with listing</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      Change / Remove
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="btn btn-secondary btn-large"
                  style={{ flex: 1, fontSize: '15px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-large"
                  style={{ flex: 2, fontSize: '15px', fontWeight: 800 }}
                >
                  {isSubmitting
                    ? 'Saving Listing…'
                    : editingListing
                    ? 'Save Changes'
                    : 'Publish Listing →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Crop List or Empty State ─── */}
      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '36px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
          <p style={{ marginTop: '12px', fontSize: '16px', fontWeight: 600 }}>Loading your live produce listings…</p>
        </div>
      ) : myListings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {myListings.map((item) => {
            const isSoldOut = item.status === 'sold' || item.quantity <= 0;
            const isLive = item.status === 'available' && item.quantity > 0;
            const photoUrl = getImageUrl(item.photos?.[0], 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80');

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px',
                  padding: '20px 24px',
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <img
                    src={photoUrl}
                    alt={item.cropName}
                    style={{ width: '90px', height: '90px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1C1A', margin: 0 }}>
                        {item.cropName}
                      </h3>
                      {item.category && (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', backgroundColor: '#F0EFEA', color: '#555852' }}>
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0E4A27', margin: '4px 0' }}>
                      ₱{item.pricePerUnit} per {item.unit || 'kg'} • {item.quantity} {item.unit || 'kg'} available
                    </div>
                    <div style={{ fontSize: '14px', color: '#525450', fontWeight: 500 }}>
                      📍 {item.location || 'Region X'} • Available: {item.harvestDate ? String(item.harvestDate).split('T')[0] : 'Ready'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span
                    className={isLive ? 'badge badge-verified' : isSoldOut ? 'badge badge-danger' : 'badge badge-warning'}
                    style={{ fontSize: '14px', padding: '6px 14px', borderRadius: '20px' }}
                  >
                    {isLive ? '✓ Live & Selling' : isSoldOut ? '📦 Sold Out' : '⏸ Temporarily Paused'}
                  </span>

                  <button
                    onClick={() => togglePauseStatus(item)}
                    className="btn btn-secondary"
                    style={{ fontSize: '14px', padding: '8px 16px', fontWeight: 700 }}
                  >
                    {isLive ? 'Pause Sale' : 'Resume Sale'}
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="btn btn-accent"
                    style={{ fontSize: '14px', padding: '8px 16px', fontWeight: 700 }}
                  >
                    Edit Details
                  </button>

                  <button
                    onClick={() => setListingToDelete(item)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #fecdd3',
                      backgroundColor: '#fff1f2',
                      color: '#be123c',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    title="Delete listing permanently"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffe4e6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff1f2';
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '20px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🌱</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
            You don't have any crop listings yet
          </h2>
          <p style={{ fontSize: '16px', color: '#525450', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Publish your fresh harvest to connect with direct buyers, wholesale markets, and local vendors across Northern Mindanao.
          </p>
          <button
            onClick={openAddModal}
            className="btn btn-primary btn-large"
            style={{ padding: '12px 28px', fontSize: '16px', fontWeight: 800 }}
          >
            + Add Your First Crop
          </button>
        </div>
      )}

      {/* Modern UI/UX Destructive Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!listingToDelete}
        onClose={() => {
          if (!isDeletingListing) setListingToDelete(null);
        }}
        onConfirm={handleConfirmDeleteListing}
        item={
          listingToDelete
            ? {
                id: listingToDelete.id,
                name: listingToDelete.cropName,
                category: listingToDelete.category,
                price: listingToDelete.pricePerUnit,
                unit: listingToDelete.unit,
                stock: listingToDelete.quantity,
                image: listingToDelete.photos?.[0],
                typeLabel: 'Crop Listing',
              }
            : null
        }
        title="Delete Crop Listing?"
        description={`Are you sure you want to remove your harvest listing for "${listingToDelete?.cropName}"? Once removed, it will no longer appear in the produce marketplace.`}
        confirmText="Yes, Delete Listing"
        cancelText="Cancel, Keep Listing"
        isDeleting={isDeletingListing}
      />
    </div>
  );
};
