import { NextRequest, NextResponse } from "next/server";

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 50;

function getIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
  return ip;
}

function isAllowedDomain(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (process.env.NODE_ENV === "production") {
    const allowedDomains = [
      process.env.NEXTAUTH_URL,
      process.env.ALLOWED_DOMAIN,
      "calira.com",
    ].filter(Boolean);

    if (origin && allowedDomains.some((domain) => origin.includes(domain!))) {
      return true;
    }

    if (host && allowedDomains.some((domain) => host.includes(domain!))) {
      return true;
    }

    return false;
  }

  return true;
}

// Rate limiting middleware
export async function rateLimit(request: NextRequest) {
  if (!isAllowedDomain(request)) {
    return NextResponse.json({ error: "Unauthorized domain" }, { status: 403 });
  }

  const ip = getIP(request);
  const now = Date.now();

  const currentData = rateLimitStore.get(ip);

  if (currentData && now < currentData.resetTime) {
    if (currentData.count >= RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        {
          error: "Too many requests",
          limit: RATE_LIMIT_MAX_REQUESTS,
          remaining: 0,
          reset: new Date(currentData.resetTime).toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(currentData.resetTime).toISOString(),
          },
        }
      );
    }

    currentData.count++;
    rateLimitStore.set(ip, currentData);
  } else {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
  }

  if (rateLimitStore.size > 1000) {
    const entries = Array.from(rateLimitStore.entries());
    const expiredEntries = entries.filter(([, data]) => now > data.resetTime);
    expiredEntries.forEach(([key]) => rateLimitStore.delete(key));
  }

  return null;
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    return handler(request);
  };
}
