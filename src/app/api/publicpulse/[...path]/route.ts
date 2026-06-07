import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const backendUrl = new URL(path.join("/"), ensureTrailingSlash(backendBaseUrl));
  backendUrl.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");

  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);
  headers.set("accept", "application/json");

  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.text(),
      cache: "no-store",
    });

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "content-type":
          backendResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        type: "https://tools.ietf.org/html/rfc7231#section-6.6.3",
        title: "Upstream provider failed.",
        status: 502,
        detail: "Unable to reach the PublicPulse API.",
        instance: request.nextUrl.pathname,
        traceId: crypto.randomUUID(),
      },
      {
        status: 502,
        headers: {
          "content-type": "application/problem+json",
        },
      },
    );
  }
}

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}
