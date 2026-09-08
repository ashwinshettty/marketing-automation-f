import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const TemplatePreviewContext = createContext(null);

export const TemplatePreviewProvider = ({ children }) => {
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [bodyParams, setBodyParams] = useState([]);

  const setTemplatePreview = useCallback(({ template = null, bodyParams: params = [] } = {}) => {
    setPreviewTemplate(template);
    setBodyParams(Array.isArray(params) ? params : []);
  }, []);

  const clearTemplatePreview = useCallback(() => {
    setPreviewTemplate(null);
    setBodyParams([]);
  }, []);

  const value = useMemo(
    () => ({
      previewTemplate,
      bodyParams,
      setTemplatePreview,
      clearTemplatePreview,
    }),
    [previewTemplate, bodyParams, setTemplatePreview, clearTemplatePreview],
  );

  return (
    <TemplatePreviewContext.Provider value={value}>
      {children}
    </TemplatePreviewContext.Provider>
  );
};

export const useTemplatePreview = () => {
  const context = useContext(TemplatePreviewContext);
  if (!context) {
    throw new Error('useTemplatePreview must be used within a TemplatePreviewProvider');
  }
  return context;
};
