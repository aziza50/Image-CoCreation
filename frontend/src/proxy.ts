import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  let response = await updateSession(request);
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  } else {
    if (
      (session && request.nextUrl.pathname === "/auth/login") ||
      request.nextUrl.pathname === "/"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

const isPublicRoute = (request: NextRequest): boolean => {
  //need to include callbacks and google auth routes as public routes so that users can log in and sign up without being redirected to the login page
  const publicRoutes = ["/auth", "/auth/*"];
  return publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
};

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
