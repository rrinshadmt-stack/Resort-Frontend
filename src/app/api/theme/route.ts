import { NextResponse } from "next/server";
import { DEFAULT_THEME_SETTINGS, ThemeSettings } from "@/types/theme";

// In-memory fallback state on Next.js server runtime
let currentSettings: ThemeSettings = { ...DEFAULT_THEME_SETTINGS };

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET() {
  try {
    // Try to contact backend Express server if available
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/theme`, {
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      clearTimeout(timeout);

      if (backendRes.ok) {
        const json = await backendRes.json();
        if (json?.data) {
          currentSettings = { ...currentSettings, ...json.data };
          return NextResponse.json({
            success: true,
            source: "backend-express",
            backendUrl: `${BACKEND_URL}/api/theme`,
            data: currentSettings,
          });
        }
      }
    } catch {
      // Backend not running, gracefully fallback
    }

    return NextResponse.json({
      success: true,
      source: "nextjs-internal",
      backendUrl: `${BACKEND_URL}/api/theme`,
      data: currentSettings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve theme settings",
        error: (error as Error).message,
        data: currentSettings,
      },
      { status: 200 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    currentSettings = {
      ...currentSettings,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    let backendSynced = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/theme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentSettings),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (backendRes.ok) {
        backendSynced = true;
      }
    } catch {
      // Backend offline, stored in nextjs state
    }

    return NextResponse.json({
      success: true,
      source: backendSynced ? "backend-express" : "nextjs-internal",
      backendSynced,
      message: "Theme settings saved successfully",
      data: currentSettings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save theme settings",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Support both POST and PUT for flexibility
  return PUT(request);
}
