'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type NoteCategory =
  | 'Idea'
  | 'Project'
  | 'Development'
  | 'Content'
  | 'Research'
  | 'Personal';

type NoteColor =
  | 'default'
  | 'yellow'
  | 'blue'
  | 'purple'
  | 'green'
  | 'pink';

interface ScrapbookNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: NoteColor;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ScrapbookBackup {
  version: 1;
  exportedAt: string;
  app: 'Aurora Scrapbook';
  notes: ScrapbookNote[];
}

const DB_NAME = 'aurora-scrapbook';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

const CATEGORIES: NoteCategory[] = [
  'Idea',
  'Project',
  'Development',
  'Content',
  'Research',
  'Personal',
];

const COLORS: NoteColor[] = [
  'default',
  'yellow',
  'blue',
  'purple',
  'green',
  'pink',
];

const colorClasses: Record<NoteColor, string> = {
  default: 'bg-white border-slate-200 text-slate-900',
  yellow: 'bg-amber-50 border-amber-200 text-amber-950',
  blue: 'bg-blue-50 border-blue-200 text-blue-950',
  purple: 'bg-purple-50 border-purple-200 text-purple-950',
  green: 'bg-emerald-50 border-emerald-200 text-emerald-950',
  pink: 'bg-pink-50 border-pink-200 text-pink-950',
};

const categoryClasses: Record<NoteCategory, string> = {
  Idea: 'bg-amber-100 text-amber-800',
  Project: 'bg-blue-100 text-blue-800',
  Development: 'bg-violet-100 text-violet-800',
  Content: 'bg-pink-100 text-pink-800',
  Research: 'bg-emerald-100 text-emerald-800',
  Personal: 'bg-slate-100 text-slate-700',
};

function createId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Unable to open scrapbook database.'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });

        store.createIndex('updatedAt', 'updatedAt', {
          unique: false,
        });

        store.createIndex('category', 'category', {
          unique: false,
        });

        store.createIndex('pinned', 'pinned', {
          unique: false,
        });
      }
    };
  });
}

async function getAllNotes(): Promise<ScrapbookNote[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      reject(request.error ?? new Error('Unable to load notes.'));
    };

    request.onsuccess = () => {
      resolve((request.result ?? []) as ScrapbookNote[]);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
}

async function saveNote(note: ScrapbookNote): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');

    transaction.objectStore(STORE_NAME).put(note);

    transaction.onerror = () => {
      reject(transaction.error ?? new Error('Unable to save note.'));
    };

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
  });
}

async function deleteNoteById(id: string): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');

    transaction.objectStore(STORE_NAME).delete(id);

    transaction.onerror = () => {
      reject(transaction.error ?? new Error('Unable to delete note.'));
    };

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
  });
}

async function replaceAllNotes(notes: ScrapbookNote[]): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.clear();

    for (const note of notes) {
      store.put(note);
    }

    transaction.onerror = () => {
      reject(transaction.error ?? new Error('Unable to import notes.'));
    };

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function isValidNote(value: unknown): value is ScrapbookNote {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const note = value as Partial<ScrapbookNote>;

  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    typeof note.category === 'string' &&
    CATEGORIES.includes(note.category as NoteCategory) &&
    typeof note.color === 'string' &&
    COLORS.includes(note.color as NoteColor) &&
    Array.isArray(note.tags) &&
    note.tags.every((tag) => typeof tag === 'string') &&
    typeof note.pinned === 'boolean' &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  );
}

export default function Scrapbook() {
  const [notes, setNotes] = useState<ScrapbookNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Idea');
  const [color, setColor] = useState<NoteColor>('default');
  const [tagsInput, setTagsInput] = useState('');
  const [pinned, setPinned] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    NoteCategory | 'All'
  >('All');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNotes() {
      try {
        const storedNotes = await getAllNotes();

        if (mounted) {
          setNotes(storedNotes);
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setErrorMessage(
            'Unable to access offline storage in this browser.'
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadNotes();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatusMessage('');
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );

  const filteredNotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...notes]
      .filter((note) => {
        if (
          categoryFilter !== 'All' &&
          note.category !== categoryFilter
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          note.title.toLowerCase().includes(normalizedSearch) ||
          note.content.toLowerCase().includes(normalizedSearch) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(normalizedSearch)
          )
        );
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }

        return (
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
        );
      });
  }, [notes, search, categoryFilter]);

  function resetEditor() {
    setSelectedNoteId(null);
    setTitle('');
    setContent('');
    setCategory('Idea');
    setColor('default');
    setTagsInput('');
    setPinned(false);
    setErrorMessage('');
  }

  function selectNote(note: ScrapbookNote) {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setColor(note.color);
    setTagsInput(note.tags.join(', '));
    setPinned(note.pinned);
    setErrorMessage('');
  }

  async function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      setErrorMessage('Add a title or some content before saving.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const now = new Date().toISOString();

      const tags = Array.from(
        new Set(
          tagsInput
            .split(',')
            .map((tag) => tag.trim().replace(/^#/, ''))
            .filter(Boolean)
        )
      );

      const note: ScrapbookNote = {
        id: selectedNote?.id ?? createId(),
        title: trimmedTitle || 'Untitled Thought',
        content: trimmedContent,
        category,
        color,
        tags,
        pinned,
        createdAt: selectedNote?.createdAt ?? now,
        updatedAt: now,
      };

      await saveNote(note);

      setNotes((current) => {
        const exists = current.some((item) => item.id === note.id);

        if (exists) {
          return current.map((item) =>
            item.id === note.id ? note : item
          );
        }

        return [...current, note];
      });

      setSelectedNoteId(note.id);
      setStatusMessage('Saved offline');
    } catch (error) {
      console.error(error);
      setErrorMessage('The note could not be saved.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedNoteId) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this scrapbook note? This cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteNoteById(selectedNoteId);

      setNotes((current) =>
        current.filter((note) => note.id !== selectedNoteId)
      );

      resetEditor();
      setStatusMessage('Note deleted');
    } catch (error) {
      console.error(error);
      setErrorMessage('The note could not be deleted.');
    }
  }

  async function handleTogglePin(note: ScrapbookNote) {
    const updatedNote: ScrapbookNote = {
      ...note,
      pinned: !note.pinned,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveNote(updatedNote);

      setNotes((current) =>
        current.map((item) =>
          item.id === updatedNote.id ? updatedNote : item
        )
      );

      if (selectedNoteId === updatedNote.id) {
        setPinned(updatedNote.pinned);
      }

      setStatusMessage(
        updatedNote.pinned ? 'Note pinned' : 'Note unpinned'
      );
    } catch (error) {
      console.error(error);
      setErrorMessage('Unable to update the note.');
    }
  }

  function handleExportJson() {
    const backup: ScrapbookBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'Aurora Scrapbook',
      notes,
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `aurora-scrapbook-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    setStatusMessage('Scrapbook exported');
  }

  function handleExportCsv() {
    const header = [
      'Title',
      'Content',
      'Category',
      'Tags',
      'Pinned',
      'Created',
      'Updated',
    ];

    const rows = notes.map((note) => [
      note.title,
      note.content,
      note.category,
      note.tags.join(', '),
      note.pinned ? 'Yes' : 'No',
      note.createdAt,
      note.updatedAt,
    ]);

    const csv = [
      header.map(escapeCsvValue).join(','),
      ...rows.map((row) =>
        row.map(escapeCsvValue).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `aurora-scrapbook-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    setStatusMessage('Scrapbook exported as CSV');
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImport(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed: unknown = JSON.parse(raw);

      let importedNotes: ScrapbookNote[] = [];

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'notes' in parsed &&
        Array.isArray(
          (parsed as { notes?: unknown }).notes
        )
      ) {
        importedNotes = (
          parsed as { notes: unknown[] }
        ).notes.filter(isValidNote);
      } else if (Array.isArray(parsed)) {
        importedNotes = parsed.filter(isValidNote);
      }

      if (importedNotes.length === 0) {
        throw new Error('No valid scrapbook notes found.');
      }

      const confirmed = window.confirm(
        `Import ${importedNotes.length} ${
          importedNotes.length === 1 ? 'note' : 'notes'
        }? This will replace the current offline scrapbook.`
      );

      if (!confirmed) {
        return;
      }

      await replaceAllNotes(importedNotes);

      setNotes(importedNotes);
      resetEditor();

      setStatusMessage('Scrapbook imported');
    } catch (error) {
      console.error(error);
      setErrorMessage(
        'The selected file is not a valid Aurora Scrapbook backup.'
      );
    }
  }

  function handleEditorKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      void handleSave();
    }
  }

  return (
    <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">📓</span>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Scrapbook
              </h1>
            </div>

            <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
              Capture creative thoughts, project notes, development ideas,
              and sparks of inspiration before they disappear.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleImportClick}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Import JSON
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleExportJson}
              disabled={notes.length === 0}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export JSON
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={notes.length === 0}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-medium">Offline storage active</span>

          <span className="text-emerald-700">
            Your scrapbook is persisted locally with IndexedDB.
          </span>

          {statusMessage && (
            <span className="ml-auto font-medium">
              {statusMessage}
            </span>
          )}
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ⌕
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your scrapbook..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value as NoteCategory | 'All'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="All">All categories</option>

                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Loading your scrapbook...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mb-3 text-4xl">✨</div>

                <h2 className="mb-2 text-lg font-semibold text-slate-900">
                  {notes.length === 0
                    ? 'Your scrapbook is empty'
                    : 'No notes found'}
                </h2>

                <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
                  {notes.length === 0
                    ? 'Start capturing ideas, features, project thoughts, and development sparks.'
                    : 'Try a different search term or category filter.'}
                </p>

                {notes.length === 0 && (
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Create your first note
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((note) => (
                  <article
                    key={note.id}
                    className={`group relative flex min-h-[220px] cursor-pointer flex-col rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      colorClasses[note.color]
                    } ${
                      selectedNoteId === note.id
                        ? 'ring-2 ring-violet-400'
                        : ''
                    }`}
                    onClick={() => selectNote(note)}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryClasses[note.category]}`}
                      >
                        {note.category}
                      </span>

                      <button
                        type="button"
                        aria-label={
                          note.pinned
                            ? 'Unpin note'
                            : 'Pin note'
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleTogglePin(note);
                        }}
                        className={`rounded-lg p-1.5 transition ${
                          note.pinned
                            ? 'text-amber-500'
                            : 'text-slate-400 opacity-0 group-hover:opacity-100'
                        } hover:bg-black/5`}
                      >
                        {note.pinned ? '★' : '☆'}
                      </button>
                    </div>

                    <h2 className="mb-2 line-clamp-2 text-lg font-bold">
                      {note.title}
                    </h2>

                    <p className="line-clamp-5 flex-1 whitespace-pre-wrap text-sm leading-6 opacity-75">
                      {note.content || 'No content'}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-black/5 px-2 py-1 text-[11px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}

                        {note.tags.length > 3 && (
                          <span className="rounded-md bg-black/5 px-2 py-1 text-[11px] font-medium">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <time
                        dateTime={note.updatedAt}
                        className="shrink-0 text-[11px] opacity-60"
                      >
                        {formatDate(note.updatedAt)}
                      </time>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="order-1 lg:order-2">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {selectedNoteId ? 'Edit Note' : 'New Thought'}
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {selectedNote
                      ? `Updated ${formatDateTime(
                          selectedNote.updatedAt
                        )}`
                      : 'Capture it while it is fresh.'}
                  </p>
                </div>

                {selectedNoteId && (
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    New
                  </button>
                )}
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label
                    htmlFor="scrapbook-title"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Title
                  </label>

                  <input
                    id="scrapbook-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="What's on your mind?"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="scrapbook-content"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Thought
                  </label>

                  <textarea
                    id="scrapbook-content"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    placeholder="Write freely... ideas, features, code thoughts, content concepts, things to research..."
                    rows={9}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  />

                  <p className="mt-1.5 text-right text-[11px] text-slate-400">
                    Ctrl/Cmd + Enter to save
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="scrapbook-category"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Category
                    </label>

                    <select
                      id="scrapbook-category"
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value as NoteCategory
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Color
                    </span>

                    <div className="flex h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                      {COLORS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          aria-label={`Use ${item} note color`}
                          onClick={() => setColor(item)}
                          className={`h-5 w-5 rounded-full border transition ${
                            item === 'default'
                              ? 'bg-white'
                              : item === 'yellow'
                              ? 'bg-amber-200'
                              : item === 'blue'
                              ? 'bg-blue-200'
                              : item === 'purple'
                              ? 'bg-purple-200'
                              : item === 'green'
                              ? 'bg-emerald-200'
                              : 'bg-pink-200'
                          } ${
                            color === item
                              ? 'ring-2 ring-slate-900 ring-offset-1'
                              : 'border-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="scrapbook-tags"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Tags
                  </label>

                  <input
                    id="scrapbook-tags"
                    type="text"
                    value={tagsInput}
                    onChange={(event) =>
                      setTagsInput(event.target.value)
                    }
                    placeholder="aurora, feature, idea"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  />

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Separate tags with commas.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(event) =>
                      setPinned(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />

                  <span>
                    <span className="block text-sm font-medium text-slate-700">
                      Pin this note
                    </span>

                    <span className="block text-xs text-slate-400">
                      Keep important thoughts at the top.
                    </span>
                  </span>
                </label>

                <div className="flex gap-2">
                  {selectedNoteId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSaving
                      ? 'Saving...'
                      : selectedNoteId
                      ? 'Save Changes'
                      : 'Save Thought'}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Notes
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {notes.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Pinned
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {notes.filter((note) => note.pinned).length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Storage
            </p>

            <p className="mt-1 text-sm font-semibold text-emerald-600">
              IndexedDB · Offline
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
