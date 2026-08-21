import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPut } from '../../../api/client';
import { Save, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import './PageEditor.css';

// A dynamic form renderer that iterates over JSON object keys
function DynamicForm({ data, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const renderField = (key, value, path) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // camelCase to Title Case
    
    // Arrays (e.g. stats, faqs, valueProps)
    if (Array.isArray(value)) {
      return (
        <div key={path} className="cms-field-group array-group">
          <label className="cms-label">{label}</label>
          <div className="cms-array-items">
            {value.map((item, index) => (
              <div key={index} className="cms-array-item">
                <div className="cms-array-item-header">
                  <span>Item {index + 1}</span>
                  <button 
                    type="button" 
                    className="btn-icon btn-danger"
                    onClick={() => {
                      const newArr = [...value];
                      newArr.splice(index, 1);
                      handleChange(key, newArr);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {/* Recursively render the object inside the array */}
                <DynamicForm 
                  data={item} 
                  onChange={(updatedItem) => {
                    const newArr = [...value];
                    newArr[index] = updatedItem;
                    handleChange(key, newArr);
                  }} 
                />
              </div>
            ))}
            <button 
              type="button" 
              className="btn btn-outline-green btn-sm"
              style={{ marginTop: '0.5rem' }}
              onClick={() => {
                // Determine template from the first item if exists
                const template = value.length > 0 
                  ? Object.keys(value[0]).reduce((acc, k) => ({...acc, [k]: ''}), {}) 
                  : { text: '' };
                handleChange(key, [...value, template]);
              }}
            >
              <Plus size={14} /> Add {label}
            </button>
          </div>
        </div>
      );
    }

    // Objects (e.g. primaryCta: { label, to })
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={path} className="cms-field-group object-group">
          <label className="cms-label">{label}</label>
          <div className="cms-nested-object">
            <DynamicForm 
              data={value} 
              onChange={(updatedObj) => handleChange(key, updatedObj)} 
            />
          </div>
        </div>
      );
    }

    // Primitive fields (strings, numbers)
    return (
      <div key={path} className="cms-field-group">
        <label className="cms-label">{label}</label>
        {typeof value === 'string' && value.length > 60 ? (
          <textarea 
            className="cms-input cms-textarea" 
            value={value} 
            onChange={(e) => handleChange(key, e.target.value)} 
          />
        ) : (
          <input 
            type={typeof value === 'number' ? 'number' : 'text'}
            className="cms-input" 
            value={value || ''} 
            onChange={(e) => handleChange(key, e.target.value)} 
          />
        )}
      </div>
    );
  };

  return (
    <div className="cms-dynamic-form">
      {Object.entries(data).map(([k, v]) => renderField(k, v, k))}
    </div>
  );
}

// Right Column: Workspace
function ActiveWorkspace({ section, pageId }) {
  const [contentData, setContentData] = useState(section.content || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await apiPut(`/api/pages/${pageId}/sections/${section.id}`, {
        content: contentData,
        settings: section.settings || {}
      });
      if (res.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="cms-workspace-card">
      <div className="cms-workspace-header">
        <div>
          <h2>{section.title}</h2>
          <span className="cms-section-type">Section Type: {section.type}</span>
        </div>
        <div className="cms-workspace-actions">
            {saveStatus === 'success' && <span className="text-success">Saved successfully!</span>}
            {saveStatus === 'error' && <span className="text-danger">Error saving changes.</span>}
            <button className="btn btn-primary btn-save" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
        </div>
      </div>
      
      <div className="cms-workspace-body">
        <div className="cms-form-container">
          {Object.keys(contentData).length > 0 ? (
            <DynamicForm data={contentData} onChange={setContentData} />
          ) : (
            <p className="text-muted">No content schema available for this section.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Page Editor
function PageEditor() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiGet(`/api/pages/slug/${slug}`);
        if (res.success) {
          setPage(res.data);
          // Auto-select the first section
          if (res.data.sections && res.data.sections.length > 0) {
            setActiveSectionId(res.data.sections[0].id);
          }
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Failed to fetch page data. Please check connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [slug]);

  if (loading) return <div className="cms-loading">Loading page data...</div>;
  if (error) return <div className="cms-error"><AlertCircle /> {error}</div>;
  if (!page) return <div className="cms-error">Page not found.</div>;

  const activeSection = page.sections?.find(s => s.id === activeSectionId);

  return (
    <div className="page-editor">
      {/* CMS Page Editor Header */}
      <div className="page-editor-header">
        <div className="header-left">
          <h1 className="page-title">Editing: {page.title}</h1>
          <span className={`status-badge ${page.status || 'published'}`}>{page.status || 'Published'}</span>
        </div>
        <div className="header-right">
          <span className="page-meta">/{page.slug}</span>
        </div>
      </div>

      <div className="split-layout">
        {/* LEFT COLUMN: SECTIONS NAV */}
        <div className="sidebar-sections">
          <h3 className="sidebar-title">Page Sections</h3>
          <ul className="sections-nav">
            {page.sections && page.sections.length > 0 ? (
              page.sections.map(section => (
                <li 
                  key={section.id} 
                  className={`section-nav-item ${activeSectionId === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSectionId(section.id)}
                >
                  <span className="section-nav-title">{section.title}</span>
                  <span className="section-nav-type">{section.type}</span>
                </li>
              ))
            ) : (
              <li className="cms-empty-sidebar">No sections available</li>
            )}
          </ul>
        </div>

        {/* RIGHT COLUMN: WORKSPACE */}
        <div className="workspace-area">
          {activeSection ? (
            <ActiveWorkspace key={activeSection.id} section={activeSection} pageId={page.id} />
          ) : (
            <div className="cms-empty">Select a section to edit</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageEditor;
