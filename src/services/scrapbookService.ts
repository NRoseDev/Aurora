```typescript
// src/services/scrapbookService.ts

export type ScrapbookWorkStatus =
  | 'pending'
  | 'approved'
  | 'adjusted'
  | 'discarded';

export type ScrapbookWorkType =
  | 'idea'
  | 'content'
  | 'product'
  | 'development'
  | 'research'
  | 'manifestation';

export type CreatorRepresentation =
  | 'creator'
  | 'ai-persona'
  | 'undecided';

export interface ScrapbookContext {
  creatorGoals: string[];
  activeProjects: string[];
  preferredTopics: string[];
  preferredContentTypes: string[];
  creatorRepresentation: CreatorRepresentation;
  notes: string[];
  updatedAt: string;
}

export interface ScrapbookWorkItem {
  id: string;
  title: string;
  description: string;
  type: ScrapbookWorkType;
  status: ScrapbookWorkStatus;
  source: 'creator' | 'aurora';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  creatorFeedback?: string;
  representation?: CreatorRepresentation;
}

export interface ScrapbookActivity {
  id: string;
  type:
    | 'note-created'
    | 'work-generated'
    | 'work-approved'
    | 'work-adjusted'
    | 'work-discarded'
    | 'context-updated';
  description: string;
  createdAt: string;
}

export interface ScrapbookWorkspace {
  version: 1;
  context: ScrapbookContext;
  workQueue: ScrapbookWorkItem[];
  activity: ScrapbookActivity[];
  updatedAt: string;
}

const DB_NAME = 'aurora-scrapbook-workspace';
const DB_VERSION = 1;

const WORKSPACE_STORE = 'workspace';

const DEFAULT_CONTEXT: ScrapbookContext = {
  creatorGoals: [],
  activeProjects: [],
  preferredTopics: [],
  preferredContentTypes: [],
  creatorRepresentation: 'undecided',
  notes: [],
  updatedAt: new Date(0).toISOString(),
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

function createDefaultWorkspace(): ScrapbookWorkspace {
  const now = new Date().toISOString();

  return {
    version: 1,
    context: {
      ...DEFAULT_CONTEXT,
      updatedAt: now,
    },
    workQueue: [],
    activity: [],
    updatedAt: now,
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (
      typeof window === 'undefined' ||
      !('indexedDB' in window)
    ) {
      reject(new Error('IndexedDB is not available.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(
        request.error ??
          new Error('Unable to open Scrapbook workspace database.')
      );
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(WORKSPACE_STORE)) {
        database.createObjectStore(WORKSPACE_STORE, {
          keyPath: 'id',
        });
      }
    };
  });
}

async function readWorkspace(): Promise<ScrapbookWorkspace> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      WORKSPACE_STORE,
      'readonly'
    );

    const store = transaction.objectStore(WORKSPACE_STORE);
    const request = store.get('primary');

    request.onerror = () => {
      database.close();

      reject(
        request.error ??
          new Error('Unable to load Scrapbook workspace.')
      );
    };

    request.onsuccess = () => {
      const workspace = request.result?.workspace;

      database.close();

      if (!workspace) {
        resolve(createDefaultWorkspace());
        return;
      }

      resolve(workspace as ScrapbookWorkspace);
    };
  });
}

async function writeWorkspace(
  workspace: ScrapbookWorkspace
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      WORKSPACE_STORE,
      'readwrite'
    );

    transaction.objectStore(WORKSPACE_STORE).put({
      id: 'primary',
      workspace,
    });

    transaction.onerror = () => {
      database.close();

      reject(
        transaction.error ??
          new Error('Unable to save Scrapbook workspace.')
      );
    };

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
  });
}

function addActivity(
  workspace: ScrapbookWorkspace,
  type: ScrapbookActivity['type'],
  description: string
): ScrapbookWorkspace {
  const activity: ScrapbookActivity = {
    id: createId(),
    type,
    description,
    createdAt: new Date().toISOString(),
  };

  return {
    ...workspace,
    activity: [activity, ...workspace.activity].slice(0, 500),
    updatedAt: activity.createdAt,
  };
}

export async function getScrapbookWorkspace(): Promise<ScrapbookWorkspace> {
  return readWorkspace();
}

export async function updateScrapbookContext(
  updates: Partial<ScrapbookContext>
): Promise<ScrapbookWorkspace> {
  const workspace = await readWorkspace();
  const now = new Date().toISOString();

  const updatedWorkspace: ScrapbookWorkspace = {
    ...workspace,
    context: {
      ...workspace.context,
      ...updates,
      updatedAt: now,
    },
    updatedAt: now,
  };

  const withActivity = addActivity(
    updatedWorkspace,
    'context-updated',
    'Creator context updated.'
  );

  await writeWorkspace(withActivity);

  return withActivity;
}

export async function addScrapbookWorkItem(
  input: Omit<
    ScrapbookWorkItem,
    'id' | 'createdAt' | 'updatedAt' | 'status'
  > & {
    status?: ScrapbookWorkStatus;
  }
): Promise<ScrapbookWorkItem> {
  const workspace = await readWorkspace();
  const now = new Date().toISOString();

  const workItem: ScrapbookWorkItem = {
    ...input,
    id: createId(),
    status: input.status ?? 'pending',
    createdAt: now,
    updatedAt: now,
  };

  const updatedWorkspace: ScrapbookWorkspace = {
    ...workspace,
    workQueue: [workItem, ...workspace.workQueue],
    updatedAt: now,
  };

  const withActivity = addActivity(
    updatedWorkspace,
    'work-generated',
    `Scrapbook created work item: ${workItem.title}`
  );

  await writeWorkspace(withActivity);

  return workItem;
}

export async function updateScrapbookWorkItem(
  id: string,
  updates: Partial<
    Pick<
      ScrapbookWorkItem,
      | 'title'
      | 'description'
      | 'tags'
      | 'representation'
      | 'creatorFeedback'
      | 'type'
    >
  >
): Promise<ScrapbookWorkItem | null> {
  const workspace = await readWorkspace();

  const existing = workspace.workQueue.find(
    (item) => item.id === id
  );

  if (!existing) {
    return null;
  }

  const updatedItem: ScrapbookWorkItem = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const updatedWorkspace: ScrapbookWorkspace = {
    ...workspace,
    workQueue: workspace.workQueue.map((item) =>
      item.id === id ? updatedItem : item
    ),
    updatedAt: updatedItem.updatedAt,
  };

  const withActivity = addActivity(
    updatedWorkspace,
    'work-adjusted',
    `Scrapbook work adjusted: ${updatedItem.title}`
  );

  await writeWorkspace(withActivity);

  return updatedItem;
}

export async function reviewScrapbookWorkItem(
  id: string,
  status: Extract<
    ScrapbookWorkStatus,
    'approved' | 'adjusted' | 'discarded'
  >,
  creatorFeedback?: string
): Promise<ScrapbookWorkItem | null> {
  const workspace = await readWorkspace();

  const existing = workspace.workQueue.find(
    (item) => item.id === id
  );

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  const updatedItem: ScrapbookWorkItem = {
    ...existing,
    status,
    creatorFeedback:
      creatorFeedback ?? existing.creatorFeedback,
    reviewedAt: now,
    updatedAt: now,
  };

  const activityType: ScrapbookActivity['type'] =
    status === 'approved'
      ? 'work-approved'
      : status === 'discarded'
      ? 'work-discarded'
      : 'work-adjusted';

  const updatedWorkspace: ScrapbookWorkspace = {
    ...workspace,
    workQueue: workspace.workQueue.map((item) =>
      item.id === id ? updatedItem : item
    ),
    updatedAt: now,
  };

  const withActivity = addActivity(
    updatedWorkspace,
    activityType,
    `Scrapbook work ${status}: ${updatedItem.title}`
  );

  await writeWorkspace(withActivity);

  return updatedItem;
}

export async function getPendingScrapbookWork(): Promise<
  ScrapbookWorkItem[]
> {
  const workspace = await readWorkspace();

  return workspace.workQueue
    .filter((item) => item.status === 'pending')
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );
}

export async function getApprovedScrapbookWork(): Promise<
  ScrapbookWorkItem[]
> {
  const workspace = await readWorkspace();

  return workspace.workQueue
    .filter((item) => item.status === 'approved')
    .sort(
      (a, b) =>
        new Date(b.reviewedAt ?? b.updatedAt).getTime() -
        new Date(a.reviewedAt ?? a.updatedAt).getTime()
    );
}

export async function getScrapbookActivity(): Promise<
  ScrapbookActivity[]
> {
  const workspace = await readWorkspace();

  return workspace.activity;
}

export async function exportScrapbookWorkspace(): Promise<string> {
  const workspace = await readWorkspace();

  return JSON.stringify(
    {
      ...workspace,
      exportedAt: new Date().toISOString(),
      app: 'Aurora Scrapbook',
    },
    null,
    2
  );
}

export async function importScrapbookWorkspace(
  rawJson: string
): Promise<ScrapbookWorkspace> {
  const parsed: unknown = JSON.parse(rawJson);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid Scrapbook workspace.');
  }

  const value = parsed as Partial<ScrapbookWorkspace>;

  if (
    value.version !== 1 ||
    !value.context ||
    !Array.isArray(value.workQueue) ||
    !Array.isArray(value.activity)
  ) {
    throw new Error(
      'Invalid Aurora Scrapbook workspace format.'
    );
  }

  const workspace: ScrapbookWorkspace = {
    version: 1,
    context: {
      ...DEFAULT_CONTEXT,
      ...value.context,
    },
    workQueue: value.workQueue as ScrapbookWorkItem[],
    activity: value.activity as ScrapbookActivity[],
    updatedAt:
      typeof value.updatedAt === 'string'
        ? value.updatedAt
        : new Date().toISOString(),
  };

  await writeWorkspace(workspace);

  return workspace;
}

export async function clearScrapbookWorkspace(): Promise<void> {
  const workspace = createDefaultWorkspace();

  await writeWorkspace(workspace);
}
```
