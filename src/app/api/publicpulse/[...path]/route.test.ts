import { NextRequest } from "next/server";
import { GET } from "@/app/api/publicpulse/[...path]/route";

describe("PublicPulse API proxy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ProblemDetails when the backend cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const request = new NextRequest("http://localhost/api/publicpulse/api/Reports");

    const response = await GET(request, {
      params: Promise.resolve({ path: ["api", "Reports"] }),
    });

    expect(response.status).toBe(502);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    const problemDetails = await response.json();
    expect(problemDetails).toMatchObject({
      title: "Upstream provider failed.",
      status: 502,
      detail: "Unable to reach the PublicPulse API.",
      instance: "/api/publicpulse/api/Reports",
    });
    expect(problemDetails.traceId).toBeDefined();
  });
});
