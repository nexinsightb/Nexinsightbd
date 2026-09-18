import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, address, email, service, source } = body;

    // Validate required fields
    if (!name || !phone || !address || !email || !service) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_APPS_SCRIPT")) {
      // Dev mode: simulate success
      console.log("[Contact API] Simulated submission:", body);
      return NextResponse.json({ success: true, simulated: true });
    }

    // Proxy to Google Apps Script (server-side — URL hidden from browser)
    const queryParams = new URLSearchParams({
      name,
      phone,
      address,
      email,
      service,
      source: source || "Website",
    }).toString();

    const scriptUrl = `${GOOGLE_SCRIPT_URL}?${queryParams}`;

    // Fire and forget — don't wait for Google's slow cold start
    fetch(scriptUrl, { method: "GET" }).catch((err) => {
      console.error("[Contact API] Google Script fetch error:", err);
    });

    // Return success immediately (optimistic)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
