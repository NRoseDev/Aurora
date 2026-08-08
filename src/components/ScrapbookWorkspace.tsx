'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addScrapbookWorkItem,
  getPendingScrapbookWork,
  reviewScrapbookWorkItem,
  updateScrapbookContext,
  type CreatorRepresentation,
  type ScrapbookWorkItem,
  type ScrapbookWorkType,
} from '../services/scrapbookService';

const WORK_TYPES: ScrapbookWorkType[] = [
  'idea',
  'content',
  'product',
  'development',
  'research',
  'manifestation',
];

const REPRESENTATIONS: CreatorRepresentation[] = [
  'creator',
  'ai-persona',
  'undecided',
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function titleCase(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ScrapbookWorkspace() {
  const [workItems, setWorkItems] = useState<ScrapbookWorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [creatorGoals, setCreatorGoals] = useState('');
  const [activeProjects, setActiveProjects] = useState('');
  const [preferredTopics, setPreferredTopics] = useState('');
  const [preferredContentTypes, setPreferredContentTypes] = useState('');
  const [representation, setRepresentation] =
    useState<CreatorRepresentation>('undecided');

  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDescription, setNewWorkDescription] = useState('');
  const [newWorkType, setNewWorkType] =
    useState<ScrapbookWorkType>('idea');
  const [newWorkRepresentation, setNewWorkRepresentation] =
    useState<CreatorRepresentation>('undecided');

  const loadPendingWork = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const pending = await getPendingScrapbookWork();
      setWorkItems(pending);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        'Unable to load Scrapbook background work.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPendingWork();
  }, [loadPendingWork]);

  const pendingCount = workItems.length;

  const groupedWork = useMemo(() => {
    return WORK_TYPES.map((type) => ({
      type,
      items: workItems.filter((item) => item.type === type),
    })).filter((group) => group.items.length > 0);
  }, [workItems]);

  async function handleSaveContext() {
    try {
      setErrorMessage('');

      await updateScrapbookContext({
        creatorGoals: creatorGoals
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        activeProjects: activeProjects
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        preferredTopics: preferredTopics
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        preferredContentTypes: preferredContentTypes
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        creatorRepresentation: representation,
      });

      setStatusMessage('Creator context saved');
    } catch (error) {
      console.error(error);
      setErrorMessage('Unable to save creator context.');
    }
  }

  async function handleCreateWorkItem() {
    const title = newWorkTitle.trim();
    const description = newWorkDescription.trim();

    if (!title || !description) {
      setErrorMessage(
        'Add a title and description before creating background work.'
      );
      return;
    }

    try {
      setErrorMessage('');

      await addScrapbookWorkItem({
        title,
        description,
        type: newWorkType,
        source: 'creator',
        tags: [],
        representation: newWorkRepresentation,
      });

      setNewWorkTitle('');
      setNewWorkDescription('');
      setStatusMessage('Added to Rise & Review');

      await loadPendingWork();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        'Unable to add the work item to Scrapbook.'
      );
    }
  }

  async function handleReview(
    item: ScrapbookWorkItem,
    decision: 'approved' | 'adjusted' | 'discarded'
  ) {
    try {
      setActionId(item.id);
      setErrorMessage('');

      const updated = await reviewScrapbookWorkItem(
        item.id,
        decision
      );

      if (!updated) {
        throw new Error('Work item no longer exists.');
      }

      setWorkItems((current) =>
        current.filter((currentItem) => currentItem.id !== item.id)
      );

      setStatusMessage(
        decision === 'approved'
          ? 'Approved and moved forward'
          : decision === 'adjusted'
          ? 'Marked for adjustment'
          : 'Removed from Rise & Review'
      );
    } catch (error) {
      console.error(error);
      setErrorMessage('Unable to update the work item.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">🌌</span>
              <h2 className="text-2xl font-bold text-slate-900">
                Scrapbook Intelligence
              </h2>
            </div>

            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Aurora can use your established direction, projects,
              interests, and creative preferences to build ideas in
              the background. Nothing moves forward without your
              review.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-violet-200 bg-white px-5 py-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Rise & Review
            </p>
            <p className="mt-1 text-3xl font-bold text-violet-600">
              {pendingCount}
            </p>
            <p className="text-xs text-slate-500">
              awaiting your decision
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Rise & Review
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Review everything Aurora has prepared before
                    anything is approved.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadPendingWork()}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="p-5">
              {isLoading ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Loading background work...
                </div>
              ) : workItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <div className="mb-3 text-3xl">🌱</div>

                  <h4 className="font-semibold text-slate-800">
                    Nothing waiting for review
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    When Aurora has creative work ready for you,
                    it will appear here for approval, adjustment,
                    or deletion.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {groupedWork.map((group) => (
                    <div key={group.type}>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {titleCase(group.type)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                          {group.items.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {group.items.map((item) => {
                          const isActing = actionId === item.id;

                          return (
                            <article
                              key={item.id}
                              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <h4 className="font-semibold text-slate-900">
                                      {item.title}
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-400">
                                      Created{' '}
                                      {formatDate(item.createdAt)}
                                    </p>
                                  </div>

                                  <span className="w-fit rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                    {item.source === 'aurora'
                                      ? 'Aurora'
                                      : 'Creator'}
                                  </span>
                                </div>

                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                  {item.description}
                                </p>

                                {item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                  <button
                                    type="button"
                                    disabled={isActing}
                                    onClick={() =>
                                      void handleReview(
                                        item,
                                        'approved'
                                      )
                                    }
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-50"
                                  >
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isActing}
                                    onClick={() =>
                                      void handleReview(
                                        item,
                                        'adjusted'
                                      )
                                    }
                                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-50"
                                  >
                                    Adjust
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isActing}
                                    onClick={() =>
                                      void handleReview(
                                        item,
                                        'discarded'
                                      )
                                    }
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-slate-900">
                Add Background Work
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Add a direction for Aurora to remember and work
                from.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="work-title"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Title
                </label>

                <input
                  id="work-title"
                  value={newWorkTitle}
                  onChange={(event) =>
                    setNewWorkTitle(event.target.value)
                  }
                  placeholder="Creative direction or project idea"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="work-description"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Direction
                </label>

                <textarea
                  id="work-description"
                  value={newWorkDescription}
                  onChange={(event) =>
                    setNewWorkDescription(event.target.value)
                  }
                  rows={5}
                  placeholder="Describe what you want Aurora to explore or create..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="work-type"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Work Type
                  </label>

                  <select
                    id="work-type"
                    value={newWorkType}
                    onChange={(event) =>
                      setNewWorkType(
                        event.target.value as ScrapbookWorkType
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    {WORK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {titleCase(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="work-representation"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Representation
                  </label>

                  <select
                    id="work-representation"
                    value={newWorkRepresentation}
                    onChange={(event) =>
                      setNewWorkRepresentation(
                        event.target
                          .value as CreatorRepresentation
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    {REPRESENTATIONS.map((item) => (
                      <option key={item} value={item}>
                        {item === 'ai-persona'
                          ? 'AI Persona'
                          : item === 'creator'
                          ? 'Myself'
                          : 'Decide Later'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleCreateWorkItem()}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add to Rise & Review
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-slate-900">
                Creator Context
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                This gives Aurora durable context about what you
                are building and how you create.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="creator-goals"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Current Goals
                </label>

                <textarea
                  id="creator-goals"
                  value={creatorGoals}
                  onChange={(event) =>
                    setCreatorGoals(event.target.value)
                  }
                  rows={4}
                  placeholder="One goal per line"
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="active-projects"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Active Projects
                </label>

                <textarea
                  id="active-projects"
                  value={activeProjects}
                  onChange={(event) =>
                    setActiveProjects(event.target.value)
                  }
                  rows={4}
                  placeholder="One project per line"
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="preferred-topics"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Topics
                </label>

                <input
                  id="preferred-topics"
                  value={preferredTopics}
                  onChange={(event) =>
                    setPreferredTopics(event.target.value)
                  }
                  placeholder="AI, ecommerce, healing"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="preferred-content-types"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Content Types
                </label>

                <input
                  id="preferred-content-types"
                  value={preferredContentTypes}
                  onChange={(event) =>
                    setPreferredContentTypes(event.target.value)
                  }
                  placeholder="Videos, posts, products"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="creator-representation"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Default Representation
                </label>

                <select
                  id="creator-representation"
                  value={representation}
                  onChange={(event) =>
                    setRepresentation(
                      event.target.value as CreatorRepresentation
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="undecided">
                    Decide per creation
                  </option>
                  <option value="creator">
                    Use my representation
                  </option>
                  <option value="ai-persona">
                    Use AI persona
                  </option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => void handleSaveContext()}
                className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Save Creator Context
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-900">
              How Scrapbook Works
            </h3>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  1
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Learn
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Aurora builds context from your projects,
                    ideas, preferences, and approved work.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  2
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Create
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Background work can be prepared while you are
                    away.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  3
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    You Decide
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Nothing is approved or moved forward without
                    your decision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
