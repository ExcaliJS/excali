import * as http from "http";
import {
  HttpMethods,
  IExcaliServer,
  PathResult,
  RequestMessage,
} from "../types/app";
import { Core } from "../core";
import { ExcaliCustomError } from "../error/handle";
import { manageError } from "../error/manage";

export class RequestParser {
  private servers: Record<number, IExcaliServer> = {};

  constructor(private core: Core) {}

  public async parser(
    port: number,
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const server = this.servers[port];
    const urlInfo = this.core.parseUrl(req.url);
    const requestMessageInfo = req as RequestMessage;
    requestMessageInfo.query = urlInfo.Parameters;
    let error;

    try {
      urlInfo.Body = await this.core.parseBody(requestMessageInfo);
    } catch (err) {
      manageError(res, err as string);
      return;
    }

    let executed = false;

    if (server) {
      for (const route of server.routes) {
        const isPathValid: PathResult = this.core.pathsCheck(
          urlInfo.Route,
          route,
          req.method
        );

        if (isPathValid === PathResult.Redirect) {
          await route.handler(req, res);
          return;
        }

        if (isPathValid !== PathResult.NotInPath) {
          try {
            const params =
              requestMessageInfo.method === HttpMethods.GET
                ? urlInfo.Parameters
                : urlInfo.Body;
            const uriParams = this.core.urlParams(req.url || "", route.Regexp);
            const data = this.core.paramsCheck(
              requestMessageInfo,
              route.params,
              res,
              server,
              { ...params, ...uriParams }
            );

            const result = await route.handler(...data);
            if (isPathValid === PathResult.ValueReturned && !error) {
              if (!result) {
                this.core.sendResponse(res, 204, null);
                return;
              }

              const statusCode = this.core.getResponseCode();
              this.core.sendResponse(
                res,
                statusCode,
                result as string | Record<string, unknown>
              );
            }
          } catch (err) {
            if (error instanceof ExcaliCustomError || !server.defaltError) {
              error = err;
            } else {
              error = server.defaltError;
            }
          } finally {
            executed = isPathValid === PathResult.ValueReturned;
          }
        }

        if (executed) break;
      }
    }

    if (!executed) {
      return this.core.sendResponse(res, 404, "not found");
    }

    if (error) {
      manageError(res, error as string);
    }
  }
}
