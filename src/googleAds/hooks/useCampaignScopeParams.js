import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * URL-backed campaign / status / date filters shared by Assets, Ad groups, Audiences.
 */
export default function useCampaignScopeParams({
  defaultRange = 'LAST_30_DAYS',
  defaultType = '',
} = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCampaignId = searchParams.get('campaignId') || '';
  const urlCampaignName = searchParams.get('campaign') || '';
  const urlStatus = searchParams.get('status') || '';
  const urlRange = searchParams.get('range') || defaultRange;
  const urlStart = searchParams.get('startDate') || '';
  const urlEnd = searchParams.get('endDate') || '';
  const urlType = searchParams.get('type') || defaultType;

  const [range, setRange] = useState(urlRange);
  const [startDate, setStartDate] = useState(urlStart);
  const [endDate, setEndDate] = useState(urlEnd);
  const [applied, setApplied] = useState({
    campaignId: urlCampaignId,
    campaignName: urlCampaignName,
    status: urlStatus,
    type: urlType,
    range: urlRange,
    ...(urlRange === 'CUSTOM' && urlStart && urlEnd ? { startDate: urlStart, endDate: urlEnd } : {}),
  });

  useEffect(() => {
    setRange(urlRange);
    setStartDate(urlStart);
    setEndDate(urlEnd);
    setApplied({
      campaignId: urlCampaignId,
      campaignName: urlCampaignName,
      status: urlStatus,
      type: urlType,
      range: urlRange,
      ...(urlRange === 'CUSTOM' && urlStart && urlEnd
        ? { startDate: urlStart, endDate: urlEnd }
        : {}),
    });
  }, [urlCampaignId, urlCampaignName, urlStatus, urlType, urlRange, urlStart, urlEnd]);

  const writeParams = (next) => {
    const params = new URLSearchParams();
    if (next.campaignId) {
      params.set('campaignId', next.campaignId);
      if (next.campaignName) params.set('campaign', next.campaignName);
    }
    if (next.status) params.set('status', next.status);
    if (next.type && next.type !== 'all' && next.type !== '') params.set('type', next.type);
    params.set('range', next.range || defaultRange);
    if (next.range === 'CUSTOM') {
      if (next.startDate) params.set('startDate', next.startDate);
      if (next.endDate) params.set('endDate', next.endDate);
    }
    setSearchParams(params, { replace: true });
  };

  const chooseCampaign = (id, row) => {
    writeParams({
      ...applied,
      campaignId: id || '',
      campaignName: row?.name || '',
    });
  };

  const chooseStatus = (value) => {
    writeParams({ ...applied, status: value || '' });
  };

  const chooseType = (value) => {
    writeParams({ ...applied, type: value || '' });
  };

  const chooseRange = (value) => {
    setRange(value);
    if (value !== 'CUSTOM') {
      writeParams({
        ...applied,
        range: value,
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const applyCustom = () => {
    if (!startDate || !endDate || startDate > endDate) return;
    writeParams({
      ...applied,
      range: 'CUSTOM',
      startDate,
      endDate,
    });
  };

  return {
    applied,
    range,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    chooseCampaign,
    chooseStatus,
    chooseType,
    chooseRange,
    applyCustom,
    writeParams,
  };
}
