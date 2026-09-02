import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getWhatsAppMediaUrl } from '../api/whatsappApi';
import { deleteVacancy, fetchVacancies, fetchVacancyApplications } from '../api/vacancyApi';
import ConfirmModal from '../components/ConfirmModal';
import VacancyModal from './VacancyModal';
import { EMPTY_VACANCY_FILTERS } from './vacancyOptions';

const DEFAULT_PAGE_SIZE = 10;
const FILTER_DEBOUNCE_MS = 400;

const fieldClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const labelClassName = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-navy';

const formatLabel = (value) => {
  if (!value) return '-';
  const text = String(value).replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const eligibilityLabel = (value) => {
  const map = {
    strong_fit: 'Strong fit',
    possible_fit: 'Possible fit',
    weak_fit: 'Weak fit',
    not_a_fit: 'Not a fit',
  };
  return map[value] || formatLabel(value);
};

const scoreTone = (score) => {
  if (score >= 75) return 'bg-emerald-50 text-emerald-800';
  if (score >= 50) return 'bg-brand-yellow/30 text-brand-navy';
  return 'bg-red-50 text-red-700';
};

const VacanciesPage = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_VACANCY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_VACANCY_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [selected, setSelected] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const loadIdRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAppliedFilters((current) =>
        current.search === filters.search ? current : { ...current, search: filters.search },
      );
      setPage(1);
    }, FILTER_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    setAppliedFilters((current) => ({
      ...current,
      status: filters.status,
      department: filters.department,
      roleType: filters.roleType,
      employmentType: filters.employmentType,
    }));
    setPage(1);
  }, [filters.status, filters.department, filters.roleType, filters.employmentType]);

  const loadVacancies = useCallback(async (pageToLoad = 1, activeFilters = appliedFilters) => {
    const loadId = ++loadIdRef.current;
    try {
      setLoading(true);
      setError('');
      const data = await fetchVacancies({
        page: pageToLoad,
        limit: DEFAULT_PAGE_SIZE,
        ...activeFilters,
      });
      if (loadId !== loadIdRef.current) return;
      const list = Array.isArray(data?.vacancies) ? data.vacancies : [];
      setVacancies(list);
      setPagination({
        page: data?.pagination?.page || pageToLoad,
        limit: data?.pagination?.limit || DEFAULT_PAGE_SIZE,
        total: data?.pagination?.total ?? list.length,
        totalPages: data?.pagination?.totalPages || 0,
        hasNextPage: Boolean(data?.pagination?.hasNextPage),
        hasPrevPage: Boolean(data?.pagination?.hasPrevPage),
      });
    } catch (err) {
      if (axios.isCancel(err) || err?.code === 'ERR_CANCELED' || loadId !== loadIdRef.current) {
        return;
      }
      setError(err.message || 'Failed to load vacancies');
      setVacancies([]);
    } finally {
      if (loadId === loadIdRef.current) setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadVacancies(page, appliedFilters);
  }, [appliedFilters, page, loadVacancies]);

  const loadApplications = async (vacancy) => {
    setSelected(vacancy);
    setAppsLoading(true);
    try {
      const data = await fetchVacancyApplications(vacancy._id);
      setApplications(Array.isArray(data?.applications) ? data.applications : []);
    } catch {
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteVacancy(toDelete._id);
      setToDelete(null);
      if (selected?._id === toDelete._id) {
        setSelected(null);
        setApplications([]);
      }
      loadVacancies(page, appliedFilters);
    } catch (err) {
      setError(err.message || 'Failed to delete vacancy');
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-8 py-8">
      <div className="mb-5 rounded-2xl border border-brand-yellow/40 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-brand-navy">Current openings</h2>
            <p className="text-xs text-brand-muted">
              Staff JDs here are what Ash uses on WhatsApp chat and calls — and to score resumes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-navy-hover"
          >
            Add vacancy
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className={labelClassName}>Search</span>
            <input
              type="search"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              placeholder="Title, subject, or location"
              className={fieldClassName}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              className={fieldClassName}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClassName}>Department</span>
            <select
              value={filters.department}
              onChange={(event) => setFilters({ ...filters, department: event.target.value })}
              className={fieldClassName}
            >
              <option value="">All departments</option>
              <option value="Teaching">Teaching</option>
              <option value="Operations">Operations</option>
              <option value="Technology">Technology</option>
              <option value="Sales">Sales</option>
              <option value="Admin">Admin</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClassName}>Role type</span>
            <select
              value={filters.roleType}
              onChange={(event) => setFilters({ ...filters, roleType: event.target.value })}
              className={fieldClassName}
            >
              <option value="">All roles</option>
              <option value="teaching">Teaching</option>
              <option value="non-teaching">Non-teaching</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClassName}>Employment</span>
            <select
              value={filters.employmentType}
              onChange={(event) => setFilters({ ...filters, employmentType: event.target.value })}
              className={fieldClassName}
            >
              <option value="">All types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
        {error && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">{error}</div>
        )}
        <div className="h-full overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-brand-cream text-xs font-semibold uppercase tracking-wide text-brand-navy">
              <tr>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Positions</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Candidates</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-brand-muted">
                    Loading vacancies...
                  </td>
                </tr>
              )}
              {!loading && vacancies.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-brand-muted">
                    No vacancies yet. Add a JD so the agent can share openings and score resumes.
                  </td>
                </tr>
              )}
              {!loading &&
                vacancies.map((vacancy) => (
                  <tr
                    key={vacancy._id}
                    className={`border-t border-brand-yellow/20 ${
                      selected?._id === vacancy._id ? 'bg-brand-yellow/10' : 'hover:bg-brand-cream/60'
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-brand-navy">{vacancy.title}</td>
                    <td className="px-5 py-3 text-brand-muted">{vacancy.department}</td>
                    <td className="px-5 py-3 text-brand-muted">{vacancy.location || '-'}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatLabel(vacancy.employmentType)}</td>
                    <td className="px-5 py-3 text-brand-navy">
                      {Math.max(1, Number(vacancy.positionsOpen) || 1)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-brand-yellow/30 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                        {formatLabel(vacancy.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-navy">{vacancy.applicationCount || 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => loadApplications(vacancy)}
                          className="rounded-lg border border-brand-yellow/40 px-2.5 py-1 text-xs font-medium text-brand-navy hover:bg-brand-yellow/20"
                        >
                          Scores
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(vacancy)}
                          className="rounded-lg border border-brand-yellow/40 px-2.5 py-1 text-xs font-medium text-brand-navy hover:bg-brand-yellow/20"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(vacancy)}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-yellow/30 px-5 py-3 text-sm text-brand-muted">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-brand-yellow/40 px-3 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-brand-yellow/40 px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-5 rounded-2xl border border-brand-yellow/40 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-brand-navy">
                Candidate scores — {selected.title}
              </h3>
              <p className="text-xs text-brand-muted">
                Internal only. The candidate is not told this score on WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setApplications([]);
              }}
              className="text-xs font-medium text-brand-navy hover:underline"
            >
              Close
            </button>
          </div>
          {appsLoading && <p className="text-sm text-brand-muted">Loading scores...</p>}
          {!appsLoading && applications.length === 0 && (
            <p className="text-sm text-brand-muted">No resumes scored for this opening yet.</p>
          )}
          {!appsLoading && applications.length > 0 && (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="rounded-xl border border-brand-yellow/30 bg-brand-cream/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-brand-navy">
                        {app.candidateName || 'Candidate'} · {app.phone}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-muted">
                        <span>
                          {app.resumeFileName || 'Resume'} · {eligibilityLabel(app.eligibility)}
                        </span>
                        {app.mediaId ? (
                          <a
                            href={getWhatsAppMediaUrl(app.mediaId, app.resumeFileName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-brand-navy underline-offset-2 hover:underline"
                          >
                            View resume
                          </a>
                        ) : (
                          <span className="text-brand-muted/80">Resume file unavailable</span>
                        )}
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreTone(app.score)}`}>
                      {app.score}/100
                    </span>
                  </div>
                  {app.summary && <p className="mt-2 text-sm text-brand-navy">{app.summary}</p>}
                  {(app.strengths || app.gaps) && (
                    <div className="mt-2 grid gap-2 text-xs text-brand-muted md:grid-cols-2">
                      {app.strengths && <p><span className="font-semibold text-brand-navy">Strengths: </span>{app.strengths}</p>}
                      {app.gaps && <p><span className="font-semibold text-brand-navy">Gaps: </span>{app.gaps}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(creating || editing) && (
        <VacancyModal
          vacancy={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => loadVacancies(page, appliedFilters)}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete vacancy"
          message={`Delete “${toDelete.title}”? Candidate scores for this opening will also be removed.`}
          confirmLabel="Delete"
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default VacanciesPage;
