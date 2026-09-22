/**
 * ============================================================================
 * KainaFresh Organic Platform — Global System Settings & Branding Manager
 * ============================================================================
 * 
 * Features:
 * 1. General & Branding Tab: Live site logo file upload (/api/settings/uploadlogo) & Site Title.
 * 2. Contact Information Tab: Phone numbers, emails, physical headquarters address.
 * 3. Social Media Tab: Facebook, Instagram, TikTok, LinkedIn, YouTube links.
 * 4. Header NavLinks Tab: Live CRUD manager for adding/deleting dynamic navigation links.
 */

// Import React hooks for managing state and lifecycle effects
import React, { useState, useEffect } from 'react';

// Import Lucide vector icons for UI tabs, notifications, and buttons
import { 
  Globe, Image as ImageIcon, Phone, Share2, 
  Save, Upload, CheckCircle2, AlertCircle, Users 
} from 'lucide-react';
import UserManagement from '../Users/UserManagement';

// Import HTTP API client utilities for CRUD calls
import { apiGet, apiPost, apiPostFormData, apiPut } from '../../../api/client';

import DashboardSkeleton from '../../../components/skeletons/DashboardSkeleton';

// Import Global Settings tab stylesheet
import './GlobalSettings.css';

/**
 * Interface definition representing a single dynamic navigation link item.
 */
interface NavItem {
  id: number;
  link_name: string;
  link: string;
  link_type: string;
}

/**
 * Interface definition representing global platform settings stored in MariaDB.
 */
interface SiteSettingsData {
  site_title?: string;
  site_logo?: string;
  primary_email?: string;
  secondary_email?: string;
  other_email?: string;
  primary_number?: string;
  secondary_number?: string;
  other_numbers?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
}

/**
 * Generic API response interface wrapper.
 */
interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  navlinks?: T;
  site_logo?: string;
  [key: string]: unknown;
}

/**
 * Toast Notification Banner Component.
 * Automatically dismisses itself after 3 seconds.
 */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    // Set auto-dismiss timer for 3000ms
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    // Render alert container with success or error class
    <div className={`cms-toast ${type}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
    </div>
  );
}

/**
 * Main GlobalSettings Admin Component.
 */
export default function GlobalSettings() {
  // Currently selected active tab identifier state
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'navlinks' | 'users'>('general');

  // Overall page initial loading state while fetching settings from MariaDB
  const [loading, setLoading] = useState(true);

  // Form saving button spinner state
  const [saving, setSaving] = useState(false);

  // Logo file uploading button spinner state
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Toast notification message state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Dynamic Navigation Links list state fetched from database
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  // Editing navigation link state
  const [editingNavLink, setEditingNavLink] = useState<NavItem | null>(null);
  const [editNavForm, setEditNavForm] = useState({ link_name: '', link: '', link_type: 'nav' });
  const [savingNavEdit, setSavingNavEdit] = useState(false);

  // Main global settings form state holding all site configurations
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

  /**
   * Fetches latest navigation links from MariaDB database endpoint.
   */
  const fetchNavLinks = async () => {
    try {
      // Query /api/navlinks API endpoint
      const res = await apiGet<ApiResponse<NavItem[]>>('/api/navlinks');
      const items = res?.data || res?.navlinks || [];
      if (Array.isArray(items)) {
        setNavItems(items as NavItem[]);
      }
    } catch (err) {
      console.error('Failed to fetch navlinks:', err);
    }
  };

  /**
   * Lifecycle effect: Fetches global settings and dynamic navlinks on component mount.
   */
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Perform parallel async fetch for both settings and navlinks
        const [settingsRes, navsRes] = await Promise.all([
          apiGet<ApiResponse<SiteSettingsData>>('/api/settings'),
          apiGet<ApiResponse<NavItem[]>>('/api/navlinks/nav')
        ]);

        if (isMounted) {
          // Populate settings form state if returned from MariaDB
          if (settingsRes?.success && settingsRes.data) {
            setForm(prev => ({
              ...prev,
              ...settingsRes.data
            }));
          }
          // Populate navlinks state array if returned from MariaDB
          if (navsRes?.success && Array.isArray(navsRes.data)) {
            setNavItems(navsRes.data as NavItem[]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial settings data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    // Cleanup function to avoid setting state on unmounted component
    return () => { isMounted = false; };
  }, []);

  const openEditNavLink = (item: NavItem) => {
    setEditingNavLink(item);
    setEditNavForm({
      link_name: item.link_name,
      link: item.link,
      link_type: item.link_type,
    });
  };

  const handleEditNavLink = async () => {
    if (!editingNavLink || !editNavForm.link_name || !editNavForm.link) {
      setToast({ type: 'error', message: 'Please provide both link name and URL path.' });
      return;
    }

    setSavingNavEdit(true);
    try {
      const res = await apiPut<ApiResponse>(
        `/api/navlinks/update/${editingNavLink.id}`,
        editNavForm,
      );
      if (!res.success) {
        throw new Error(res.message || 'Failed to update link.');
      }

      setToast({ type: 'success', message: 'Navigation link updated successfully!' });
      setEditingNavLink(null);
      await fetchNavLinks();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating nav link.';
      setToast({ type: 'error', message: errorMsg });
    } finally {
      setSavingNavEdit(false);
    }
  };

  /**
   * Generalized input field change handler.
   */
  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Submits all updated settings fields to MariaDB via POST /api/settings/create.
   */
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await apiPost<ApiResponse>('/api/settings/create', form);
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

  /**
   * Multipart File Upload Handler for updating Site Logo in MariaDB & Server Storage.
   */
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract selected file from input event
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    // Create Multipart FormData container
    const formData = new FormData();
    formData.append('site_logo', file);

    try {
      // POST multipart file to /api/settings/uploadlogo
      const res = await apiPostFormData<ApiResponse<SiteSettingsData>>('/api/settings/uploadlogo', formData);
      if (res.success && res.data) {
        const logoPath = typeof res.data === 'string' ? res.data : (res.data as SiteSettingsData).site_logo || '';
        
        // Update form state with new logo path
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
    return <DashboardSkeleton />;
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

        <button 
          className={`tab-btn ${activeTab === 'navlinks' ? 'active' : ''}`}
          onClick={() => setActiveTab('navlinks')}
        >
          <Globe size={16} /> Header Navigation Links
        </button>

        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> User Access & Controls
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

      {/* Tab Content 4: Header Navigation Links */}
      {activeTab === 'navlinks' && (
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Header Navigation Links Manager</h3>
            <p>Add and manage custom links displayed across the main site navigation bar.</p>
          </div>

          {/* NavLinks List */}
          <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.9rem' }}>Active Navigation Items</h4>
          {navItems.length > 0 ? (
            <table className="navlinks-table">
              <thead>
                <tr>
                  <th>LINK TITLE</th>
                  <th>URL PATH</th>
                  <th>TYPE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {navItems.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.link_name}</td>
                    <td style={{ color: '#6B7280' }}>{item.link}</td>
                    <td><span style={{ fontSize: '0.75rem', background: '#E0F2FE', color: '#0284C7', padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{item.link_type}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-icon"
                        onClick={() => openEditNavLink(item)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      {/* <button 
                        className="btn-icon btn-danger" 
                        onClick={async () => {
                          try {
                            const res = await apiDelete<ApiResponse>(`/api/navlinks/delete/${item.id}`);
                            if (res.success) {
                              setToast({ type: 'success', message: 'Navigation link removed.' });
                              fetchNavLinks();
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        Delete
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#6B7280', fontSize: '0.85rem', fontStyle: 'italic' }}>No custom navigation links added yet. Default site routes are active.</p>
          )}
        </div>
      )}

      {editingNavLink && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-nav-link-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(17, 24, 39, 0.45)',
          }}
          onClick={() => !savingNavEdit && setEditingNavLink(null)}
        >
          <div
            className="settings-card"
            style={{ width: 'min(100%, 520px)', margin: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="settings-card-header">
              <h3 id="edit-nav-link-title">Edit Navigation Link</h3>
              <p>Update the label and destination for this navigation item.</p>
            </div>

            <div className="settings-field" style={{ marginBottom: '1rem' }}>
              <label className="settings-label">Link Label / Title</label>
              <input
                type="text"
                className="settings-input"
                value={editNavForm.link_name}
                onChange={e => setEditNavForm(prev => ({ ...prev, link_name: e.target.value }))}
              />
            </div>

            <div className="settings-field" style={{ marginBottom: '1rem' }}>
              <label className="settings-label">URL Path</label>
              <input
                type="text"
                className="settings-input"
                value={editNavForm.link}
                onChange={e => setEditNavForm(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>

            <div className="settings-field" style={{ marginBottom: '1.25rem' }}>
              <label className="settings-label">Link Type</label>
              <input
                type="text"
                className="settings-input"
                value={editNavForm.link_type}
                onChange={e => setEditNavForm(prev => ({ ...prev, link_type: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn-icon"
                onClick={() => setEditingNavLink(null)}
                disabled={savingNavEdit}
              >
                Cancel
              </button>
              <button
                className="btn-upload"
                onClick={handleEditNavLink}
                disabled={savingNavEdit}
              >
                {savingNavEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 5: User Access & Controls */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <UserManagement />
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
