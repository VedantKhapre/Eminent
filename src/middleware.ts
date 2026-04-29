import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedPage = createRouteMatcher(["/profile(.*)", "/problems(.*)"]);
const isProtectedApi = createRouteMatcher(["/api/piston/evaluate"]);

export const onRequest = clerkMiddleware((auth, context) => {
  const { isAuthenticated, redirectToSignIn } = auth();

  if (!isAuthenticated && isProtectedApi(context.request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isAuthenticated && isProtectedPage(context.request)) {
    return redirectToSignIn({ returnBackUrl: context.request.url });
  }
});
