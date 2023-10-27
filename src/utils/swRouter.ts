/// <reference lib="WebWorker" />

export interface RouteParams {
  request: Request;
  url: URL;
  event: FetchEvent;
}

export type RouteHandler = (
  options: RouteParams,
) => Promise<Response | undefined>;

export class Route {
  public matcher:
    | string
    | RegExp
    | ((options: RouteParams) => boolean | Promise<boolean>);
  public handler: (
    options: RouteParams,
  ) => Promise<Response | false> | Response | false;
  public method?: string | string[];

  constructor(
    matcher:
      | string
      | RegExp
      | ((options: RouteParams) => boolean | Promise<boolean>),
    handler: (
      options: RouteParams,
    ) => Promise<Response | false> | Response | false,
    method?: string | string[],
  ) {
    this.matcher = matcher;
    this.handler = handler;
    this.method = method;
  }
}

export class Router {
  public routes: Route[] = [];

  public addRoute(
    matcher:
      | string
      | RegExp
      | ((options: RouteParams) => boolean | Promise<boolean>)
      | Route,
    handler: (
      options: RouteParams,
    ) => Promise<Response | false> | Response | false,
    method?: string | string[],
  ) {
    if (matcher instanceof Route) {
      this.routes.push(matcher);
    } else this.routes.push(new Route(matcher, handler, method));
  }

  public async handleRequest(event: FetchEvent): Promise<Response | false> {
    const reqURL = new URL(event.request.url);
    for (const route of this.routes) {
      switch (typeof route.matcher) {
        // If the matcher is a string, treat it as a URL pathname. Must be an absolute path.
        case 'string':
          if (reqURL.pathname !== route.matcher) continue;
          break;
        // If the matcher is a function, call it with the event and request.
        case 'function':
          if (
            !(await route.matcher({
              url: reqURL,
              request: event.request,
              event,
            }))
          ) {
            continue;
          }
          break;
        // If the matcher is a RegExp, test the request URL against it.
        case 'object':
          if (!(route.matcher instanceof RegExp)) {
            throw new Error(
              'Route matcher must be a string, RegExp, or function.',
            );
          }
          if (!route.matcher.test(event.request.url)) {
            continue;
          }
          break;
        default:
          throw new Error(
            'Route matcher must be a string, RegExp, or function.',
          );
      }
      // If the route has a method, check if the request method matches.
      if (route.method) {
        if (typeof route.method === 'string') {
          if (route.method !== event.request.method) continue;
        } else if (!route.method.includes(event.request.method)) continue;
      }
      // If the route matches, call the handler and return the response.
      const response = await route.handler({
        url: reqURL,
        request: event.request,
        event,
      });
      // If the handler returns false, continue to the next route.
      if (response === false) continue;
      // Otherwise, return the response.
      return response;
    }
    return false;
  }
}
