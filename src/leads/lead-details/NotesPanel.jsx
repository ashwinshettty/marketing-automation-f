import { useEffect, useState } from 'react';
import { updateStudent } from '../../api/studentApi';
import {
  buildNotesUpdatePayload,
  normalizeNotesFromLead,
  sortNotesByNewest,
} from '../../utils/buildStudentUpdatePayload';
import { mapStudentToLead } from '../../utils/mapStudentToLead';
import { toast } from '../../utils/toast';

const formatISTDate = (dateString) => {
  if (!dateString) return 'Will be set on save';

  try {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M5 12h14" strokeLinecap="round" />
  </svg>
);

const NotesPanel = ({ lead, onLeadUpdate }) => {
  const [notes, setNotes] = useState(() => normalizeNotesFromLead(lead));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(normalizeNotesFromLead(lead));
  }, [lead]);

  const persistNotes = async (notesToSave, { successMessage } = {}) => {
    setIsSaving(true);

    try {
      const payload = buildNotesUpdatePayload(lead, notesToSave);
      const data = await updateStudent(lead.id, payload);

      if (!data?.student) {
        throw new Error(data?.message || 'Failed to save notes');
      }

      const updatedLead = mapStudentToLead(data.student);
      setNotes(normalizeNotesFromLead(updatedLead));
      onLeadUpdate?.(updatedLead);

      if (successMessage) {
        toast.success(successMessage);
      }

      return updatedLead;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNoteStatusChange = async (index, status) => {
    const currentNote = notes[index];
    if (!currentNote || currentNote.status === status) {
      return;
    }

    const updatedNotes = notes.map((note, noteIndex) =>
      noteIndex === index ? { ...note, status } : note,
    );
    const updatedNote = updatedNotes[index];

    if (!(updatedNote.text || '').trim()) {
      setNotes(updatedNotes);
      toast.info('Add note text before updating status');
      return;
    }

    const previousNotes = notes;
    setNotes(updatedNotes);

    try {
      await persistNotes(updatedNotes, {
        successMessage: `Note status updated to ${status}`,
      });
    } catch (err) {
      setNotes(previousNotes);
      toast.error(err.message || 'Failed to update note status');
    }
  };

  const handleNoteChange = (index, value) => {
    setNotes((current) =>
      current.map((note, noteIndex) =>
        noteIndex === index
          ? { ...note, text: value, recentlyEdited: true }
          : note,
      ),
    );
  };

  const handleAddNote = () => {
    setNotes((current) =>
      sortNotesByNewest([
        {
          text: '',
          createdAt: new Date().toISOString(),
          recentlyEdited: true,
          status: 'pending',
        },
        ...current.map((note) => ({ ...note, recentlyEdited: false })),
      ]),
    );
    toast.success('New note added successfully');
  };

  const handleRemoveNote = (index) => {
    setNotes((current) => {
      const removedWasEdited = current[index]?.recentlyEdited;
      const updatedNotes = current.filter((_, noteIndex) => noteIndex !== index);

      if (removedWasEdited && updatedNotes.length > 0) {
        const lastIndex = updatedNotes.length - 1;
        updatedNotes[lastIndex] = {
          ...updatedNotes[lastIndex],
          recentlyEdited: true,
        };
      }

      return updatedNotes;
    });
    toast.success('Note removed successfully');
  };

  const handleSave = async () => {
    try {
      await persistNotes(notes, { successMessage: 'Notes edited successfully' });
    } catch (err) {
      toast.error(err.message || 'Failed to save notes');
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-navy">Notes</p>
          <p className="text-xs text-brand-muted">
            Capture context with automatic IST timestamps.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNote}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-navy/90"
        >
          <PlusIcon />
          Add
        </button>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note, index) => (
            <div
              key={note._id || `note-${index}`}
              className="space-y-2 rounded-lg border border-slate-200 bg-brand-cream/40 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                  <span className="text-sm text-brand-navy">
                    {formatISTDate(note.createdAt)}
                  </span>
                  {note.recentlyEdited && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Recently edited
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-brand-muted">Status:</span>
                  <select
                    value={note.status || 'pending'}
                    onChange={(event) =>
                      handleNoteStatusChange(index, event.target.value)
                    }
                    disabled={isSaving}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-brand-navy outline-none focus:border-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveNote(index)}
                    className="rounded-md border border-slate-200 p-1.5 text-brand-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove note"
                    title="Remove note"
                  >
                    <MinusIcon />
                  </button>
                </div>
              </div>

              <textarea
                value={note.text || ''}
                onChange={(event) => handleNoteChange(index, event.target.value)}
                rows={3}
                placeholder="Type note details here..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-navy"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-brand-muted">
          No notes yet. Click Add to create your first note.
        </p>
      )}

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy transition hover:bg-brand-yellow/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
};

export default NotesPanel;
