import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL file tidak diberikan" },
        { status: 400 }
      );
    }

    // Keamanan:
    // Proxy hanya boleh mengambil file dari backend kita sendiri.
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== "backend.mejatika.com") {
      return NextResponse.json(
        { error: "Host file tidak diizinkan" },
        { status: 403 }
      );
    }

    const response = await fetch(parsedUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Backend mengembalikan HTTP ${response.status}`,
        },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer.byteLength) {
      return NextResponse.json(
        { error: "File DOCX kosong" },
        { status: 404 }
      );
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "Content-Length": String(arrayBuffer.byteLength),

        "Content-Disposition": "inline",

        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("DOCX proxy error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil file DOCX",
      },
      { status: 500 }
    );
  }
}
