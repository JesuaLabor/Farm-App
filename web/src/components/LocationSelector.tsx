import React, { useEffect } from 'react';
import {
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
} from '../data/philippineLocations';

interface LocationSelectorProps {
  region: string;
  province: string;
  municipality: string;
  barangay: string;
  onChange: (region: string, province: string, municipality: string, barangay: string) => void;
  disabled?: boolean;
  layout?: 'stacked' | 'grid';
  showNumbers?: boolean;
  fontSize?: string;
  excludeBarangay?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  region,
  province,
  municipality,
  barangay,
  onChange,
  disabled = false,
  layout = 'stacked',
  showNumbers = true,
  fontSize,
  excludeBarangay = false,
}) => {
  const regions = getRegions();
  const currentRegion = regions.includes(region) ? region : regions[0];

  const provinces = getProvinces(currentRegion);
  const currentProvince = provinces.includes(province) ? province : provinces[0] || '';

  const municipalities = getMunicipalities(currentRegion, currentProvince);
  const currentMunicipality = municipalities.includes(municipality) ? municipality : municipalities[0] || '';

  const barangays = getBarangays(currentRegion, currentProvince, currentMunicipality);
  const currentBarangay = barangays.includes(barangay) ? barangay : barangays[0] || '';

  // Handle region change
  const handleRegionChange = (newRegion: string) => {
    const newProvinces = getProvinces(newRegion);
    const newProv = newProvinces[0] || '';
    const newMunicipalities = getMunicipalities(newRegion, newProv);
    const newMun = newMunicipalities[0] || '';
    const newBarangays = getBarangays(newRegion, newProv, newMun);
    const newBar = newBarangays[0] || '';
    onChange(newRegion, newProv, newMun, newBar);
  };

  // Handle province change
  const handleProvinceChange = (newProvVal: string) => {
    const newMunicipalities = getMunicipalities(currentRegion, newProvVal);
    const newMun = newMunicipalities[0] || '';
    const newBarangays = getBarangays(currentRegion, newProvVal, newMun);
    const newBar = newBarangays[0] || '';
    onChange(currentRegion, newProvVal, newMun, newBar);
  };

  // Handle municipality change
  const handleMunicipalityChange = (newMunVal: string) => {
    const newBarangays = getBarangays(currentRegion, currentProvince, newMunVal);
    const newBar = newBarangays[0] || '';
    onChange(currentRegion, currentProvince, newMunVal, newBar);
  };

  // Handle barangay change
  const handleBarangayChange = (newBarVal: string) => {
    onChange(currentRegion, currentProvince, currentMunicipality, newBarVal);
  };

  // Initial sync on mount if initial values are missing or invalid
  useEffect(() => {
    if (
      region !== currentRegion ||
      province !== currentProvince ||
      municipality !== currentMunicipality ||
      barangay !== currentBarangay
    ) {
      onChange(currentRegion, currentProvince, currentMunicipality, currentBarangay);
    }
  }, []);

  const isGrid = layout === 'grid';
  const inputStyle: React.CSSProperties = fontSize ? { fontSize } : {};

  return (
    <div
      style={
        isGrid
          ? {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }
      }
    >
      {/* 1. Region Dropdown */}
      <div className="form-group">
        <label htmlFor="select-region" className="form-label">
          {showNumbers ? '1. Region' : 'Region'}
        </label>
        <select
          id="select-region"
          className="form-input"
          value={currentRegion}
          disabled={disabled}
          style={inputStyle}
          onChange={(e) => handleRegionChange(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Province Dropdown */}
      <div className="form-group">
        <label htmlFor="select-province" className="form-label">
          {showNumbers ? '2. Province' : 'Province'}
        </label>
        <select
          id="select-province"
          className="form-input"
          value={currentProvince}
          disabled={disabled || provinces.length === 0}
          style={inputStyle}
          onChange={(e) => handleProvinceChange(e.target.value)}
        >
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Municipality / City Dropdown */}
      <div className="form-group">
        <label htmlFor="select-municipality" className="form-label">
          {showNumbers ? '3. Municipality / City' : 'Municipality / City'}
        </label>
        <select
          id="select-municipality"
          className="form-input"
          value={currentMunicipality}
          disabled={disabled || municipalities.length === 0}
          style={inputStyle}
          onChange={(e) => handleMunicipalityChange(e.target.value)}
        >
          {municipalities.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Barangay Dropdown (Hidden if excluded e.g. for LGU Staff) */}
      {!excludeBarangay && (
        <div className="form-group">
          <label htmlFor="select-barangay" className="form-label">
            {showNumbers ? '4. Barangay' : 'Barangay'}
          </label>
          <select
            id="select-barangay"
            className="form-input"
            value={currentBarangay}
            disabled={disabled || barangays.length === 0}
            style={inputStyle}
            onChange={(e) => handleBarangayChange(e.target.value)}
          >
            {barangays.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
