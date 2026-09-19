import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@job-aggregator/db";
import { requireAuth } from "@/lib/auth/require-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const { id } = await params;

  const existing = await prisma.savedSearch.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return NextResponse.json(
      { error: "Saved search not found" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const { keyword, location, remoteOnly, minSalary } = body;

  const updated = await prisma.savedSearch.update({
    where: { id },
    data: {
      ...(keyword !== undefined && { keyword }),
      ...(location !== undefined && { location }),
      ...(remoteOnly !== undefined && { remoteOnly }),
      ...(minSalary !== undefined && { minSalary }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const { id } = await params;

  const existing = await prisma.savedSearch.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return NextResponse.json(
      { error: "Saved search not found" },
      { status: 404 }
    );
  }

  await prisma.savedSearch.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
