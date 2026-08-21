import React, { useState, useEffect } from 'react';
import { 
  Globe, Image as ImageIcon, Phone, Share2, 
  Save, Upload, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { apiGet, apiPost, apiPostFormData } from '../../../api/client';
import './GlobalSettings.css';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`cms-toast ${type}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
    </div>
  );
}

export default function GlobalSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    site_title: 'KainaFresh Organic Platform',
    site_logo: '',
    primary_email: 'info@kainafresh.rw',
    secondary_email: 'sales@kainafresh.rw',
    other_email: '',
    primary_number: '+250 788 123 456',
    secondary_number: '+250 788 654 321',
    other_numbers: '',
    address: 'Kigali Innovation City, Rwanda',
    facebook: 'https://facebook.com/kainafresh',
    instagram: 'https://instagram.com/kainafresh',
    tiktok: 'https://tiktok.com/@kainafresh',
    linkedin: 'https://linkedin.com/company/kainafresh',
    youtube: 'https://youtube.com/@kainafresh'
  });

  // Fetch current global settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await apiGet('/api/settings');
        if (res.success && res.data) {
          setForm(prev => ({
            ...prev,
            ...res.data
          }));
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await apiPost('/api/settings/create', form);
      if (res.success) {
        setToast({ type: 'success', message: 'Global system settings saved successfully!' });
      } else {
        setToast({ type: 'error', message: res.message || 'Failed to save settings.' });
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : 'Error saving system settings.';
      setToast({ type: 'error', message: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('site_logo', file);

    try {
      const res = await apiPostFormData('/api/settings/uploadlogo', formData);
      if (res.success && res.data) {
        const logoPath = typeof res.data === 'string' ? res.data : res.data.site_logo;
        setForm(prev => ({ ...prev, site_logo: logoPath }));
        setToast({ type: 'success', message: 'Site logo updated successfully!' });
      } else {
        setToast({ type: 'error', message: res.message || 'Logo upload failed.' });
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload logo.';
      setToast({ type: 'error', message: errorMsg });
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-dashboard" style={{ textAlign: 'center', padding: '4rem' }}>
        <RefreshCw size={32} className="spin-icon" style={{ color: '#076935' }} />
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-dashboard">
      {/* Toast Notification */}
      <div className="toast-container">
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>

      {/* Header */}
      <div className="settings-header">
        <h1>System Settings & Site Branding</h1>
        <p>Manage your global website identity, logo, contact channels, and system configurations.</p>
      </div>

      {/* Tabs Bar */}
      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <Globe size={16} /> General & Branding
        </button>

        <button 
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <Phone size={16} /> Contact Information
        </button>

        <button 
          className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          <Share2 size={16} /> Social Media Links
        </button>
      </div>

      {/* Tab Content 1: General & Branding */}
      {activeTab === 'general' && (
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Site Logo & Identity</h3>
            <p>Upload your official platform logo and set your global site title.</p>
          </div>

          {/* Logo Upload Box */}
          <div className="logo-upload-container">
            <div className="logo-preview-box">
              {form.site_logo ? (
                <img src={form.site_logo.startsWith('http') ? form.site_logo : `http://127.0.0.1:8000/${form.site_logo}`} alt="Site Logo" />
              ) : (
                <ImageIcon size={36} color="#9CA3AF" />
              )}
            </div>

            <div className="logo-upload-actions">
              <label htmlFor="logo-file-input" className="btn-upload">
                <Upload size={16} /> {uploadingLogo ? 'Uploading...' : 'Upload New Logo'}
              </label>
              <input 
                id="logo-file-input" 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                style={{ display: 'none' }} 
                disabled={uploadingLogo}
              />
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                Recommended format: PNG or SVG with transparent background (Max 2MB).
              </span>
            </div>
          </div>

          <div className="settings-grid-2" style={{ marginTop: '1.5rem' }}>
            <div className="settings-field full-width">
              <label className="settings-label">Platform / Site Title</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.site_title || ''} 
                onChange={e => handleChange('site_title', e.target.value)}
                placeholder="e.g. KainaFresh Organic Platform"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Contact Information */}
      {activeTab === 'contact' && (
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Contact Channels & Location</h3>
            <p>Update phone numbers, official email addresses, and headquarters location.</p>
          </div>

          <div className="settings-grid-2">
            <div className="settings-field">
              <label className="settings-label">Primary Phone Number</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.primary_number || ''} 
                onChange={e => handleChange('primary_number', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">Secondary Phone Number</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.secondary_number || ''} 
                onChange={e => handleChange('secondary_number', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">Primary Email Address</label>
              <input 
                type="email" 
                className="settings-input" 
                value={form.primary_email || ''} 
                onChange={e => handleChange('primary_email', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">Sales / Support Email</label>
              <input 
                type="email" 
                className="settings-input" 
                value={form.secondary_email || ''} 
                onChange={e => handleChange('secondary_email', e.target.value)}
              />
            </div>

            <div className="settings-field full-width">
              <label className="settings-label">Physical Address / Headquarters</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.address || ''} 
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Social Links */}
      {activeTab === 'social' && (
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Social Media Presence</h3>
            <p>Connect your official social media pages for customer engagement.</p>
          </div>

          <div className="settings-grid-2">
            <div className="settings-field">
              <label className="settings-label">Instagram URL</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.instagram || ''} 
                onChange={e => handleChange('instagram', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">Facebook URL</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.facebook || ''} 
                onChange={e => handleChange('facebook', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">TikTok Profile</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.tiktok || ''} 
                onChange={e => handleChange('tiktok', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">LinkedIn Page</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.linkedin || ''} 
                onChange={e => handleChange('linkedin', e.target.value)}
              />
            </div>

            <div className="settings-field full-width">
              <label className="settings-label">YouTube Channel</label>
              <input 
                type="text" 
                className="settings-input" 
                value={form.youtube || ''} 
                onChange={e => handleChange('youtube', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Action Footer */}
      <div className="settings-action-bar">
        <button 
          className="btn-save-settings" 
          onClick={handleSaveSettings} 
          disabled={saving}
        >
          <Save size={16} /> {saving ? 'Saving Changes...' : 'Save System Settings'}
        </button>
      </div>
    </div>
  );
}
