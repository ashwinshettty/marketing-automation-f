import { TemplateProvider } from '../context/TemplateContext';
import MainTemplate from './templates/MainTemplate';

const WhatsAppPage = () => {
  return (
    <div className="min-w-0 px-8 py-8">
      <TemplateProvider>
        <MainTemplate />
      </TemplateProvider>
    </div>
  );
};

export default WhatsAppPage;
