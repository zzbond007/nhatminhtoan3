export type IndexedContentRouteKind = "week" | "topic" | "lesson" | "mission" | "open-task";
export type StandaloneContentRouteKind = "assessment" | "roadmap";
export type ContentRouteKind = IndexedContentRouteKind | StandaloneContentRouteKind;

export type ContentRoute =
  | { kind: IndexedContentRouteKind; id: number; canonicalPath: string }
  | { kind: StandaloneContentRouteKind; canonicalPath: string };

const ROUTE_LIMITS: Record<IndexedContentRouteKind, number> = {
  week: 36,
  topic: 36,
  lesson: 180,
  mission: 36,
  "open-task": 36,
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

  const standaloneMatch = candidate.match(/^\/(assessment|roadmap)\/?$/);
  if (standaloneMatch) {
    const kind = standaloneMatch[1] as StandaloneContentRouteKind;
    return { kind, canonicalPath: `${normalizedBasePath}/${kind}/` };
  }

  const match = candidate.match(/^\/(week|topic|lesson|mission|open-task)\/(\d+)\/?$/);
  if (!match) return null;

  const kind = match[1] as IndexedContentRouteKind;
  const id = Number(match[2]);
  if (!Number.isInteger(id) || id < 1 || id > ROUTE_LIMITS[kind]) return null;

  return {
    kind,
    id,
    canonicalPath: `${normalizedBasePath}/${kind}/${id}/`,
  };
}

export function contentRouteWeek(route: ContentRoute) {
  if (!("id" in route)) return null;
  return route.kind === "lesson" ? Math.ceil(route.id / 5) : route.id;
}

export function lessonStageIndex(lesson: number) {
  return (lesson - 1) % 5;
}
