import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPut } from '../../../api/client';
import PageLoader from '../../../components/PageLoader/PageLoader';

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}
import { 
  Save, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp, GripVertical, 
  CheckCircle2, Layout, FileText, List, MessageSquare, Image as ImageIcon,
  Leaf, Truck, ShieldCheck, Package
} from 'lucide-react';
import './PageEditor.css';

// Utility to convert camelCase to human readable labels
const formatLabel = (key) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// Map of common icons used in KainaFresh for the Icon Picker
const IconMap = {
  Leaf: <Leaf size={18} />,
  Truck: <Truck size={18} />,
  ShieldCheck: <ShieldCheck size={18} />,
  Package: <Package size={18} />
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`cms-toast ${type}`}>
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <span>{message}</span>
    </div>
  );
}

// A dynamic form renderer that iterates over JSON object keys
function DynamicForm({ data, onChange }) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleAccordion = (path, index) => {
    const key = `${path}-${index}`;
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const renderField = (key, value, path) => {
    const label = formatLabel(key);
    
    // Arrays (e.g. stats, faqs, valueProps)
    if (Array.isArray(value)) {
      return (
        <div key={path} className="cms-field-group array-group">
          <label className="cms-label">
            <List size={18} color="#9CA3AF" /> {label}
          </label>
          
          {value.length === 0 ? (
            <div className="cms-empty-state">
              <FileText size={48} />
              <h3>No items added yet</h3>
              <p>Add the first item to this list to display it on your website.</p>
            </div>
          ) : (
            <div className="cms-array-items">
              {value.map((item, index) => {
                const accordionKey = `${path}-${index}`;
                const isExpanded = expandedItems[accordionKey] !== false; // Default expanded initially for empty, or just default true
                
                // Try to find a title for the accordion header
                const itemTitle = item.title || item.heading || item.question || item.name || item.value || `Item ${index + 1}`;

                return (
                  <div key={index} className="cms-accordion-item">
                    <div className="cms-accordion-header" onClick={() => toggleAccordion(path, index)}>
                      <div className="cms-accordion-header-left">
                        <span className="cms-accordion-drag"><GripVertical size={16} /></span>
                        <span className="cms-accordion-title">{itemTitle}</span>
                      </div>
                      <div className="cms-accordion-header-right">
                        <button 
                          type="button" 
                          className="btn-icon btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newArr = [...value];
                            newArr.splice(index, 1);
                            handleChange(key, newArr);
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                        <span className="btn-icon text-muted">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="cms-accordion-body">
                        <DynamicForm 
                          data={item} 
                          onChange={(updatedItem) => {
                            const newArr = [...value];
                            newArr[index] = updatedItem;
                            handleChange(key, newArr);
                          }} 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          <button 
            type="button" 
            className="btn-add-item"
            onClick={() => {
              // Determine template from the first item if exists
              const template = value.length > 0 
                ? Object.keys(value[0]).reduce((acc, k) => ({...acc, [k]: ''}), {}) 
                : { text: '' };
              
              handleChange(key, [...value, template]);
              // Auto-expand the new item
              setExpandedItems(prev => ({ ...prev, [`${path}-${value.length}`]: true }));
            }}
          >
            <Plus size={18} /> Add {label}
          </button>
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
        
        {/* Visual Icon Picker if field is named 'iconName' */}
        {key === 'iconName' ? (
          <div className="icon-preview-field">
            <span className="icon-preview">
              {IconMap[value] || <ImageIcon size={18} />}
            </span>
            <select
              className="cms-input has-icon"
              value={value || ''}
              onChange={(e) => handleChange(key, e.target.value)}
            >
              <option value="">Select an icon...</option>
              <option value="Leaf">Leaf (Organics)</option>
              <option value="Truck">Truck (Delivery)</option>
              <option value="ShieldCheck">Shield Check (Quality)</option>
              <option value="Package">Package (Bulk/Wholesale)</option>
            </select>
          </div>
        ) : typeof value === 'string' && value.length > 50 ? (
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
            placeholder={`Enter ${label.toLowerCase()}...`}
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
function ActiveWorkspace({ section, pageId, onSaveSuccess }) {
  const [contentData, setContentData] = useState(section.content || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiPut<ApiResponse>(`/api/pages/${pageId}/sections/${section.id}`, {
        content: contentData,
        settings: section.settings || {}
      });
      if (res.success) {
        onSaveSuccess('success', 'Changes saved successfully!');
      } else {
        onSaveSuccess('error', (res.message as string) || 'Failed to save changes.');
      }
    } catch (err) {
      console.error(err);
      onSaveSuccess('error', 'Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="cms-workspace-card">
      <div className="cms-workspace-header">
        <div className="cms-workspace-header-title">
          <h2>{section.title}</h2>
          <span className="cms-section-type-badge">
            <Layout size={14} /> {section.type}
          </span>
        </div>
        <div className="cms-workspace-actions">
            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
        </div>
      </div>
      
      <div className="cms-workspace-body">
        {Object.keys(contentData).length > 0 ? (
          <DynamicForm data={contentData} onChange={setContentData} />
        ) : (
          <div className="cms-empty-state">
             <Layout size={48} />
             <h3>No Content Schema</h3>
             <p>This section does not have editable content fields associated with it.</p>
          </div>
        )}
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
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiGet<ApiResponse<{ id: number; title: string; sections: Array<{ id: number; title: string; type: string; content: any }> }>>(`/api/pages/slug/${slug}`);
        if (res.success && res.data) {
          setPage(res.data as any);
          // Auto-select the first section
          if (res.data.sections && res.data.sections.length > 0) {
            setActiveSectionId(res.data.sections[0].id);
          }
        } else {
          setError((res.message as string) || 'Page not found.');
        }
      } catch (error) {
        console.error(error);
        setError('Failed to fetch page data. Please check connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [slug]);

  if (loading) return <PageLoader text="Loading CMS page schema & sections from database..." />;
  if (error) return <div className="cms-error"><AlertCircle /> {error}</div>;
  if (!page) return <div className="cms-error">Page not found.</div>;

  const activeSection = page.sections?.find(s => s.id === activeSectionId);

  const getSectionIcon = (type) => {
    switch (type) {
      case 'hero': return <ImageIcon size={18} />;
      case 'value_props': return <List size={18} />;
      case 'faqs': return <MessageSquare size={18} />;
      case 'story': return <FileText size={18} />;
      default: return <Layout size={18} />;
    }
  };

  return (
    <div className="page-editor">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>

      {/* CMS Page Editor Header */}
      <div className="page-editor-header">
        <div className="header-left">
          <h1 className="page-title">Editing: {page.title}</h1>
          <span className={`status-badge ${page.status || 'published'}`}>
             <CheckCircle2 size={16} /> {page.status || 'Published'}
          </span>
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
                  <div className="section-nav-icon">
                    {getSectionIcon(section.type)}
                  </div>
                  <div className="section-nav-content">
                    <span className="section-nav-title">{section.title}</span>
                    <span className="section-nav-type">{section.type.replace('_', ' ')}</span>
                  </div>
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
            <ActiveWorkspace 
              key={activeSection.id} 
              section={activeSection} 
              pageId={page.id} 
              onSaveSuccess={(type, message) => setToast({ type, message })}
            />
          ) : (
            <div className="cms-empty-state">
              <Layout size={48} />
              <h3>Select a section</h3>
              <p>Choose a page section from the sidebar to start editing its content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageEditor;
