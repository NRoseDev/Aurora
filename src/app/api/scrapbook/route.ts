import { NextResponse } from 'next/server';

interface ScrapbookNote {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ScrapbookStore {
  notes: ScrapbookNote[];
  updatedAt: string;
}

const store: ScrapbookStore = {
  notes: [],
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json({
    success: true,
    notes: store.notes,
    updatedAt: store.updatedAt,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const note: ScrapbookNote = {
      id: body.id || crypto.randomUUID(),
      title: String(body.title || 'Untitled Thought'),
      content: String(body.content || ''),
      category: String(body.category || 'Idea'),
      color: String(body.color || 'default'),
      tags: Array.isArray(body.tags)
        ? body.tags.map((tag: unknown) => String(tag))
        : [],
      pinned: Boolean(body.pinned),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = store.notes.findIndex(
      (existingNote) => existingNote.id === note.id
    );

    if (existingIndex >= 0) {
      store.notes[existingIndex] = note;
    } else {
      store.notes.push(note);
    }

    store.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      note,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to save scrapbook note.',
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || '');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note ID is required.',
        },
        { status: 400 }
      );
    }

    const originalLength = store.notes.length;

    store.notes = store.notes.filter(
      (note) => note.id !== id
    );

    if (store.notes.length === originalLength) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note not found.',
        },
        { status: 404 }
      );
    }

    store.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to delete scrapbook note.',
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.notes)) {
      return NextResponse.json(
        {
          success: false,
          error: 'A notes array is required.',
        },
        { status: 400 }
      );
    }

    store.notes = body.notes;
    store.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      notes: store.notes,
      updatedAt: store.updatedAt,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to update scrapbook.',
      },
      { status: 400 }
    );
  }
}
