import { useState } from 'react';
import { useTemplate } from '../../context/TemplateContext';
import SetUp from './SetUp';
import Edit from './Edit';
import ViewTemplates from './ViewTemplates';
import { tabClass, tabIndicatorClass } from './templateUi';

const MainTemplate = () => {
  const { currentStep, isEditMode } = useTemplate();
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
      <div className="border-b border-brand-yellow/30 bg-brand-cream/50 px-6 pt-5">
        <div className="flex gap-8">
          <button type="button" onClick={() => setActiveTab('view')} className={tabClass(activeTab === 'view')}>
            View Templates
            {activeTab === 'view' && <span className={tabIndicatorClass} />}
          </button>
          <button type="button" onClick={() => setActiveTab('create')} className={tabClass(activeTab === 'create')}>
            {isEditMode && currentStep === 'edit' ? 'Edit Template' : 'Create Template'}
            {activeTab === 'create' && <span className={tabIndicatorClass} />}
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'create' ? (
          currentStep === 'edit' ? <Edit setActiveTab={setActiveTab} /> : <SetUp />
        ) : (
          <ViewTemplates setActiveTab={setActiveTab} />
        )}
      </div>
    </div>
  );
};

export default MainTemplate;
