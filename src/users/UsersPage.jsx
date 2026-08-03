import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { createUser, deleteUser, listUsers } from '../api/authApi';
import ConfirmModal from '../components/ConfirmModal';
import { getAuthSession } from '../utils/authStorage';

const ASSIGNABLE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
];

const inputClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const emptyForm = {
  username: '',
  phoneNo: '',
  role: 'sales',
};

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsersPage = () => {
  const { role, _id: currentUserId } = getAuthSession();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isSuperAdmin = role === 'superadmin';

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await listUsers();
      setUsers(data.users || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    loadUsers();
    return undefined;
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return <Navigate to="/leads" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await createUser(form);
      setSuccess(`${form.username} added as ${form.role}`);
      setForm(emptyForm);
      await loadUsers();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setError('');
    setSuccess('');
    setIsDeleting(true);

    try {
      await deleteUser(userToDelete.id);
      setSuccess(`Access revoked for ${userToDelete.username}`);
      setUserToDelete(null);
      await loadUsers();
    } catch (deleteError) {
      setError(deleteError.message);
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-8 py-8">
      <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section className="rounded-2xl border border-brand-yellow/40 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-navy">Add user</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Create admin or sales access for the portal.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-brand-navy">
                Full name
              </label>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="phoneNo" className="mb-1.5 block text-sm font-medium text-brand-navy">
                Phone number
              </label>
              <input
                id="phoneNo"
                name="phoneNo"
                value={form.phoneNo}
                onChange={handleChange}
                required
                placeholder="98XXXXXXXX"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-brand-navy">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={inputClassName}
              >
                {ASSIGNABLE_ROLES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            {success && (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Adding...' : 'Add user'}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
          <div className="border-b border-brand-yellow/30 px-6 py-4">
            <h2 className="text-lg font-semibold text-brand-navy">Portal users</h2>
            <p className="mt-1 text-sm text-brand-muted">
              {isLoading ? 'Loading...' : `${users.length} user${users.length === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-cream/80">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                    Phone
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-brand-navy">
                    Access
                  </th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-brand-muted">
                      No users yet.
                    </td>
                  </tr>
                )}
                {users.map((user) => {
                  const isSelf = String(user.id) === String(currentUserId);

                  return (
                    <tr key={user.id} className="border-t border-brand-yellow/20">
                      <td className="px-5 py-4 font-medium text-brand-navy">{user.username}</td>
                      <td className="px-5 py-4 text-brand-muted">{user.phoneNo}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-brand-yellow/25 px-2.5 py-0.5 text-xs font-medium capitalize text-brand-navy">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            title={`Revoke access for ${user.username}`}
                            aria-label={`Revoke access for ${user.username}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {userToDelete && (
        <ConfirmModal
          title="Revoke access"
          message={`Remove ${userToDelete.username} from the portal? They will no longer be able to log in.`}
          confirmLabel="Revoke"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => !isDeleting && setUserToDelete(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
