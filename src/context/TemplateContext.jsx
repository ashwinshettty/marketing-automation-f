import React, { createContext, useContext, useState } from 'react';
import * as templateApi from '../api/templateApi';

const TemplateContext = createContext();

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};

export const TemplateProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [templateData, setTemplateData] = useState({
    category: 'UTILITY', // Match backend enum
    templateType: 'INTERACTIVE', // Match backend enum
    name: '',
    language: 'en', // Match backend enum
    bodyText: '',
    headerText: '',
    footerText: '',
    variables: [],
    buttons: [],
    isActive: true
  });

  const updateTemplateData = (updates) => {
    setTemplateData(prev => ({ ...prev, ...updates }));
  };

  const goToNextStep = () => {
    setCurrentStep('edit');
  };

  const goToPreviousStep = () => {
    setCurrentStep('setup');
    setIsEditMode(false);
  };

  const resetTemplate = () => {
    setCurrentStep('setup');
    setIsEditMode(false);
    setTemplateData({
      category: 'UTILITY',
      templateType: 'INTERACTIVE',
      name: '',
      language: 'en',
      bodyText: '',
      headerText: '',
      footerText: '',
      variables: [],
      buttons: [],
      isActive: true
    });
    setError(null);
  };

  const buildBackendPayload = (dataToUse) => {
    const templateType =
      dataToUse.templateType === 'FLOW' ? 'INTERACTIVE' : dataToUse.templateType;

    return {
      name: dataToUse.name,
      category: String(dataToUse.category || '').toUpperCase(),
      templateType: String(templateType || '').toUpperCase(),
      language: dataToUse.language,
      bodyText: dataToUse.bodyText,
      headerText: dataToUse.headerText || undefined,
      footerText: dataToUse.footerText || undefined,
      variables: dataToUse.variables || [],
      buttons: dataToUse.buttons || [],
      isActive: dataToUse.isActive !== false,
    };
  };

  // Create template in backend
  const createTemplate = async (overrideData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Merge override data with template data
      const dataToUse = { ...templateData, ...overrideData };
      const backendData = buildBackendPayload(dataToUse);

      const response = await templateApi.createTemplate(backendData, dataToUse.uploadedFile);
      
      if (response.success) {
        // Refresh templates list
        await fetchTemplates();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create template');
      }
    } catch (err) {
      console.error('❌ CONTEXT: Error creating template');
      console.error('Error:', err);
      console.error('Error response data:', err.response?.data);
      
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create template';
      setError(errorMessage);
      
      // Re-throw the original error to preserve validation errors
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // Don't pass user filter for now, or handle it differently
      const response = await templateApi.getTemplates({ 
        // Remove user filter to avoid ObjectId casting issues
        // You can add authentication later when user management is implemented
        limit: 1000 // Fetch all templates (up to 1000)
      });
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // Submit template to Meta
  const submitTemplateToMeta = async (templateId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await templateApi.submitTemplate(templateId);
      
      if (response.success) {
        await fetchTemplates(); // Refresh to get updated status
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to submit template');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const deleteTemplate = async (templateId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await templateApi.deleteTemplate(templateId);
      
      if (response.success) {
        await fetchTemplates(); // Refresh templates list
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to delete template');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load template for editing
  const loadTemplateForEdit = (template) => {
    setTemplateData({
      _id: template._id,
      name: template.name,
      category: template.category,
      templateType: template.templateType,
      language: template.language,
      bodyText: template.bodyText,
      headerText: template.headerText || '',
      footerText: template.footerText || '',
      variables: template.variables || [],
      buttons: template.buttons || [],
      isActive: template.isActive,
      status: template.status
    });
    setCurrentStep('edit');
    setIsEditMode(true);
  };

  // Update existing template
  const updateTemplate = async (templateId, updates, uploadedFile = null) => {
    try {
      setLoading(true);
      setError(null);

      const backendData = buildBackendPayload({ ...templateData, ...updates });
      
      const response = await templateApi.updateTemplate(templateId, backendData, uploadedFile);
      
      if (response.success) {
        await fetchTemplates();
        if (response.data) {
          setTemplateData(response.data);
        }
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update template');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentStep,
    templateData,
    loading,
    error,
    templates,
    isEditMode,
    updateTemplateData,
    goToNextStep,
    goToPreviousStep,
    resetTemplate,
    createTemplate,
    updateTemplate,
    fetchTemplates,
    submitTemplateToMeta,
    deleteTemplate,
    loadTemplateForEdit,
    setError
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};
