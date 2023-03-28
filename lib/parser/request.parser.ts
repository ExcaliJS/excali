import * as http from 'http';
import {
  HttpMethods,
  IExcaliServer,
  PathResult,
  RequestMessage,
} from '../type/core.type';
import { Core } from '../core/core.module';
import { ExcaliCustomError } from '../error/handle';
import { manageError } from '../error/manage';

export class RequestParser {
  private servers: Record<number, IExcaliServer> = {};
  core: Core;

  constructor(core: Core) {
    this.core = core;
  }

  public async parser(
    port: number,
    req: http.IncomingMessage,
    res: http.ServerResponse,
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
          req.method,
        );

        if (isPathValid === PathResult.Redirect) {
          await route.Exec(req, res);
          return;
        }

        if (isPathValid !== PathResult.NotInPath) {
          try {
            const params =
              requestMessageInfo.method === HttpMethods.GET
                ? urlInfo.Parameters
                : urlInfo.Body;
            const uriParams = this.core.urlParams(req.url || '', route.Regexp);
            const data = this.core.paramsCheck(
              requestMessageInfo,
              route.Params,
              res,
              server,
              { ...params, ...uriParams },
            );

            const result = await route.Exec(...data);
            if (isPathValid === PathResult.ValueReturned && !error) {
              if (!result) {
                this.core.sendResponse(res, 204, null);
                return;
              }

              const statusCode = this.core.getResponseCode();
              this.core.sendResponse(
                res,
                statusCode,
                result as string | Record<string, unknown>,
              );
            }
          } catch (err) {
            if (error instanceof ExcaliCustomError || !server.DefaultError) {
              error = err;
            } else {
              error = server.DefaultError;
            }
          } finally {
            executed = isPathValid === PathResult.ValueReturned;
          }
        }

        if (executed) break;
      }
    }

    if (!executed) {
      return this.core.sendResponse(res, 404, 'not found');
    }

    if (error) {
      manageError(res, error as string);
    }
  }
}
