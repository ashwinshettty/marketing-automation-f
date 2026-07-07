import {
  buildVariableForPosition,
  resolveRecordValueByVariable,
} from './fieldPathUtils';
import { extractTemplateVariablePositions } from './whatsappTemplateValidation';

const resolveLeadValueForVariable = (lead, variable) => {
  if (!variable) return '';

  const sources = [lead?.rawStudent, lead].filter(Boolean);

  for (const source of sources) {
    const value = resolveRecordValueByVariable(source, variable);
    if (value) return value;
  }

  return '';
};

export const resolveTemplateBodyParams = (template, lead) => {
  const positions = extractTemplateVariablePositions(template?.bodyText);

  if (positions.length === 0) {
    return [];
  }

  return positions.map((position) => {
    const variable = buildVariableForPosition(template, position);
    return resolveLeadValueForVariable(lead, variable);
  });
};
