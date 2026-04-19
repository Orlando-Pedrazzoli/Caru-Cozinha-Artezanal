import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Dish from '@/models/Dish';
import { isAdmin } from '@/lib/utils/auth';

export async function PATCH(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: 'orderedIds must be an array', success: false },
        { status: 400 },
      );
    }

    // bulk update: cada dish recebe displayOrder = index
    const ops = orderedIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { displayOrder: index } },
      },
    }));

    if (ops.length > 0) {
      await Dish.bulkWrite(ops);
    }

    return NextResponse.json({ success: true, updated: ops.length });
  } catch (error) {
    console.error('Error reordering dishes:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to reorder', success: false, details: errorMessage },
      { status: 500 },
    );
  }
}
