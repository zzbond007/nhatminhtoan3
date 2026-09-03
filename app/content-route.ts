export type ContentRouteKind = "week" | "topic" | "lesson";

export type ContentRoute = {
  kind: ContentRouteKind;
  id: number;
  canonicalPath: string;
};

const ROUTE_LIMITS: Record<ContentRouteKind, number> = {
  week: 36,
  topic: 36,
  lesson: 180,
};

function normalizeBasePath(basePath: string) {
  const normalized = `/${basePath}`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized === "/" ? "" : normalized;
}

export function parseContentRoute(
  pathname: string,
  search = "",
  basePath = "",
): ContentRoute | null {
  const redirectedRoute = new URLSearchParams(search).get("route");
  let candidate = redirectedRoute ?? pathname;
  const normalizedBasePath = normalizeBasePath(basePath);

  if (redirectedRoute && !redirectedRoute.startsWith("/")) {
    candidate = `/${redirectedRoute}`;
  }
  if (
    normalizedBasePath &&
    (candidate === normalizedBasePath || candidate.startsWith(`${normalizedBasePath}/`))
  ) {
    candidate = candidate.slice(normalizedBasePath.length) || "/";
  }

  const match = candidate.match(/^\/(week|topic|lesson)\/(\d+)\/?$/);
  if (!match) return null;

  const kind = match[1] as ContentRouteKind;
  const id = Number(match[2]);
  if (!Number.isInteger(id) || id < 1 || id > ROUTE_LIMITS[kind]) return null;

  return {
    kind,
    id,
    canonicalPath: `${normalizedBasePath}/${kind}/${id}/`,
  };
}

export function contentRouteWeek(route: ContentRoute) {
  return route.kind === "lesson" ? Math.ceil(route.id / 5) : route.id;
}

export function lessonStageIndex(lesson: number) {
  return (lesson - 1) % 5;
}
