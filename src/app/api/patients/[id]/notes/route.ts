import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const role = request.headers.get("x-user-role");

        if (role !== "CAREGIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const note = await prisma.note.create({
            data: {
                patientId: id,
                content: content.trim(),
            },
        });

        return NextResponse.json({
            id: note.id,
            content: note.content,
            createdAt: note.createdAt,
        }, { status: 201 });
    } catch (error) {
        console.error("Create note error:", error);
        return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const role = request.headers.get("x-user-role");

        if (role !== "CAREGIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { noteId } = await request.json();

        if (!noteId) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
        }

        await prisma.note.delete({
            where: { id: noteId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete note error:", error);
        return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
    }
}
