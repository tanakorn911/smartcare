import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "smartcare-secret-key-change-in-production"
);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes
    if (pathname === "/login" || pathname === "/" || pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;

        // Role-based access control
        if (pathname.startsWith("/patient") && role !== "PATIENT") {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (pathname.startsWith("/caregiver") && role !== "CAREGIVER") {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Add user info to headers for API routes
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", payload.userId as string);
        requestHeaders.set("x-user-role", role);
        if (payload.patientId) {
            requestHeaders.set("x-patient-id", payload.patientId as string);
        }

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    } catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        "/patient/:path*",
        "/caregiver/:path*",
        "/api/records",
        "/api/records/:path*",
        "/api/patients",
        "/api/patients/:path*",
        "/api/predict",
        "/api/predict/:path*",
    ],
};
