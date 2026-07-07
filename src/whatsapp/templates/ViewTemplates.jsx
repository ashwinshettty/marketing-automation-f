import React, { useEffect, useState } from 'react';
import { useTemplate } from '../../context/TemplateContext';
import { FaSort, FaSortUp, FaSortDown, FaInfoCircle, FaExclamationCircle, FaExternalLinkAlt, FaPhone, FaArrowUp, FaWhatsapp, FaTrash } from 'react-icons/fa';
import { toast } from '../../utils/toast';
import ConfirmationModal from './ConfirmationModal';

const ViewTemplates = ({ setActiveTab }) => {
  const { templates, fetchTemplates, loading, error, loadTemplateForEdit, deleteTemplate } = useTemplate();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, templateId: null, templateName: '' });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateName}"? This action cannot be undone.`)) {
      try {
        await deleteTemplate(templateId);
        // The deleteTemplate function already refreshes the templates list
        // Optionally show a success message
        alert(`Template "${templateName}" deleted successfully`);
      } catch (error) {
        alert(`Failed to delete template: ${error.message}`);
      }
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTemplate(deleteModal.templateId);
      // The deleteTemplate function already refreshes the templates list
      toast.success(`Template "${deleteModal.templateName}" deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete template: ${error.message}`);
    } finally {
      // Close modal regardless of outcome
      setDeleteModal({ isOpen: false, templateId: null, templateName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, templateId: null, templateName: '' });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="h-3 w-3 text-brand-muted/60" />;
    }
    return sortConfig.direction === 'asc'
      ? <FaSortUp className="h-3 w-3 text-brand-navy" />
      : <FaSortDown className="h-3 w-3 text-brand-navy" />;
  };

  const sortedTemplates = React.useMemo(() => {
    if (!templates || templates.length === 0) return [];
    
    let sortableTemplates = [...templates];
    if (sortConfig.key) {
      sortableTemplates.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'updatedAt') {
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTemplates;
  }, [templates, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTemplates = sortedTemplates.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'APPROVED': { 
        bg: 'bg-green-500', 
        text: 'text-white', 
        label: 'Active',
        icon: null
      },
      'PENDING': { 
        bg: 'bg-yellow-500', 
        text: 'text-white', 
        label: 'In review',
        icon: null
      },
      'REJECTED': { 
        bg: 'bg-red-500', 
        text: 'text-white', 
        label: 'Rejected',
        icon: null
      },
      'DRAFT': { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        label: 'Draft',
        icon: <FaExclamationCircle className="inline-block mr-1" />
      },
    };

    const config = statusConfig[status] || statusConfig['DRAFT'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} inline-flex items-center`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleRowClick = (template) => {
    setSelectedTemplate(template);
  };

  const handleCloseDetail = () => {
    setSelectedTemplate(null);
  };

  const handleEditTemplate = (template) => {
    // Warn user if editing an APPROVED template
    if (template.status === 'APPROVED') {
      const proceed = window.confirm(
        'This template is currently APPROVED and in use.\n\n' +
        'If you update it, the status will change to PENDING and it will need to be re-approved by Meta.\n\n' +
        'Do you want to continue?'
      );
      if (!proceed) {
        return;
      }
    }
    
    // Load template data into context for editing
    loadTemplateForEdit(template);
    // Switch to create tab (which will show Edit component)
    setActiveTab('create');
  };

  const renderTemplatePreview = (template) => {
    let bodyText = template.bodyText;
    
    // Replace variables with example values
    if (template.variables && template.variables.length > 0) {
      template.variables.forEach(variable => {
        const placeholder = `{{${variable.position}}}`;
        const exampleValue = variable.example || `[${variable.key || 'value'}]`;
        bodyText = bodyText.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), exampleValue);
      });
    }

    return (
      <div className="rounded-2xl border border-brand-yellow/40 bg-brand-cream/30 p-6">
        <h3 className="mb-4 text-lg font-semibold text-brand-navy">Your template</h3>
        <div className="max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header Image */}
          {template.media && template.media.url && (
            <div className="mb-4">
              <img 
                src={template.media.url} 
                alt="Template header" 
                className="w-full rounded-lg"
                style={{ maxHeight: '200px', objectFit: 'cover' }}
                onError={(e) => {
                  console.error('Failed to load template image:', template.media.url);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Header Text */}
          {template.headerText && (
            <div className="mb-4">
              <p className="font-semibold text-brand-navy">{template.headerText}</p>
            </div>
          )}

          {/* Body */}
          <div className="mb-4">
            <p className="whitespace-pre-wrap text-slate-800">{bodyText}</p>
          </div>

          {/* Footer */}
          {template.footerText && (
            <div className="mb-4">
              <p className="text-xs text-brand-muted">{template.footerText}</p>
            </div>
          )}

          {/* Buttons */}
          {template.buttons && template.buttons.length > 0 && (
            <div className="space-y-2 mt-4">
              {template.buttons.map((button, index) => {
                // Determine the correct icon based on button type
                let icon = null;
                if (button.type === 'URL') {
                  icon = <FaExternalLinkAlt className="w-4 h-4" />;
                } else if (button.type === 'PHONE') {
                  // Check if it's WhatsApp call or regular phone call
                  icon = button.subType === 'WHATSAPP' 
                    ? <FaWhatsapp className="w-4 h-4" />
                    : <FaPhone className="w-4 h-4" />;
                } else if (button.type === 'CUSTOM') {
                  icon = <FaArrowUp className="w-4 h-4" />;
                }

                return (
                  <button
                    key={index}
                    className="w-full py-2 px-4 border border-brand-navy/30 text-brand-navy rounded hover:bg-brand-yellow/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    disabled
                  >
                    {icon}
                    {button.text}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && templates.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand-yellow border-t-brand-navy" />
        <p className="mt-4 text-sm text-brand-muted">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
        <p className="font-semibold">Error loading templates</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  // If a template is selected, show detail view
  if (selectedTemplate) {
    return (
      <div className="overflow-hidden rounded-2xl border border-brand-yellow/40">
        <div className="border-b border-brand-yellow/30 bg-brand-cream/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-xl font-bold text-brand-yellow">
                {selectedTemplate.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-brand-navy">{selectedTemplate.name}</h2>
                  <span className="text-brand-muted">•</span>
                  <span className="capitalize text-brand-muted">
                    {selectedTemplate.language === 'en' ? 'English' : selectedTemplate.language}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-brand-muted">
                  {getStatusBadge(selectedTemplate.status)}
                  <span>•</span>
                  <span className="capitalize">{selectedTemplate.category?.toLowerCase()}</span>
                  <span>•</span>
                  <span>Updated on {formatDate(selectedTemplate.updatedAt || selectedTemplate.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedTemplate.status === 'APPROVED' && (
                <span className="text-sm italic text-amber-600">Editing will require re-approval</span>
              )}
              <button
                type="button"
                onClick={() => handleEditTemplate(selectedTemplate)}
                className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-navy-hover"
              >
                Edit Template
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">{renderTemplatePreview(selectedTemplate)}</div>
        <div className="flex justify-end border-t border-brand-yellow/30 bg-brand-cream/30 p-6">
          <button
            type="button"
            onClick={handleCloseDetail}
            className="rounded-xl border border-brand-yellow/40 bg-white px-6 py-2 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const thClass =
    'cursor-pointer px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-navy hover:bg-brand-yellow/10';

  return (
    <div className="overflow-hidden rounded-xl border border-brand-yellow/30">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[14%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-brand-yellow/30 bg-brand-cream shadow-sm">
              <th className={thClass} onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">
                  Template name
                  {getSortIcon('name')}
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('category')}>
                <div className="flex items-center gap-2">
                  Category
                  {getSortIcon('category')}
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('language')}>
                <div className="flex items-center gap-2">
                  Language
                  {getSortIcon('language')}
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('status')}>
                <div className="flex items-center gap-2">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-navy">
              <div className="flex items-center gap-1">
                <span className="leading-tight">Message<br />delivered</span>
                {getSortIcon('usageCount')}
              </div>
            </th>
              <th className={thClass} onClick={() => handleSort('updatedAt')}>
                <div className="flex items-center gap-2">
                  Last edited
                  {getSortIcon('updatedAt')}
                </div>
              </th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-navy">
              Actions
            </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedTemplates.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-brand-muted">
                  <p className="text-lg font-medium text-brand-navy">No templates found</p>
                  <p className="mt-2 text-sm">Create your first template to get started</p>
                </td>
              </tr>
            ) : (
              paginatedTemplates.map((template) => (
                <tr
                  key={template._id}
                  className="cursor-pointer transition hover:bg-brand-cream/40"
                  onClick={() => handleRowClick(template)}
                >
                  <td className="min-w-0 px-3 py-4">
                    <div className="truncate text-sm font-semibold text-brand-navy" title={template.name}>
                      {template.name}
                    </div>
                    <div className="mt-1 flex min-w-0 items-center gap-2">
                      {template.media?.url && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-brand-yellow-soft px-2 py-0.5 text-xs font-medium text-brand-navy">
                          Media
                        </span>
                      )}
                      {template.bodyText && (
                        <div className="min-w-0 truncate text-xs text-brand-muted" title={template.bodyText}>
                          {template.bodyText.substring(0, 50)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="truncate px-3 py-4 text-sm capitalize text-brand-navy">
                    {template.category?.toLowerCase()}
                  </td>
                  <td className="truncate px-3 py-4 text-sm text-brand-navy">
                    {template.language === 'en' ? 'English' : template.language}
                  </td>
                  <td className="px-3 py-4">{getStatusBadge(template.status)}</td>
                  <td className="px-3 py-4 text-sm text-brand-navy">{template.usageCount || 0}</td>
                  <td className="truncate px-3 py-4 text-sm text-brand-navy">
                    {formatDate(template.updatedAt || template.createdAt)}
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template._id, template.name);
                      }}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                      title="Delete template"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      {sortedTemplates.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-yellow/30 bg-brand-cream px-5 py-3">
          <p className="text-sm text-brand-muted">
            Showing <span className="font-medium text-brand-navy">{startIndex + 1}</span> to{' '}
            <span className="font-medium text-brand-navy">{Math.min(endIndex, sortedTemplates.length)}</span> of{' '}
            <span className="font-medium text-brand-navy">{sortedTemplates.length}</span> templates
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-brand-muted">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    currentPage === page
                      ? 'bg-brand-navy text-white'
                      : 'border border-brand-yellow/40 text-brand-navy hover:bg-brand-yellow/20'
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete the template "${deleteModal.templateName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ViewTemplates;
