import * as Http from 'http';
import * as Https from 'https';
import * as Url from 'url';
import * as Fs from 'fs';
import { RequestParser } from '../parser/request.parser';
import { Core } from '../core/core.module';
import {
  HttpMethods,
  IExcaliServer,
  IRoute,
  IExcaliServerOptions,
} from '../type/core.type';
import { getServer, setServer } from '../utils/utils';
import { ExcaliCustomError } from '../error/handle';

const core = new Core();
const parseRequest = new RequestParser(core);
let MainPort = 8000;

const generateServerOptions = (
  options: IExcaliServerOptions,
): Https.ServerOptions => {
  const result: Https.ServerOptions = {};
  if (options.https) {
    result.cert = Fs.readFileSync(options.https.cert);
    result.key = Fs.readFileSync(options.https.key);
  }
  return result;
};

const pathToFunction = (
  port: number,
  req: Http.IncomingMessage,
  res: Http.ServerResponse,
) => {
  const newServer = getServer(port);
  const matchingRoute = newServer.routes.find(route => route.Path === req.url);
  if (matchingRoute) {
    const result = matchingRoute.Exec();
    res.end(result);
  }
};
export const excaliServer = (
  port = 8000,
  options: IExcaliServerOptions = {},
): IExcaliServer => {
  if (port === 0) {
    port = MainPort;
  }

  let server = getServer(port);
  if (server) {
    return server;
  }

  const excaliServers = options.https
    ? Https.createServer(
        generateServerOptions(options),
        async (req: Http.IncomingMessage, res: Http.ServerResponse) => {
          pathToFunction(port, req, res);
          await parseRequest.parser(port, req, res);
        },
      )
    : Http.createServer(
        async (req: Http.IncomingMessage, res: Http.ServerResponse) => {
          pathToFunction(port, req, res);
          await parseRequest.parser(port, req, res);
        },
      );

  const excaServer: IExcaliServer = {
    coreServer: excaliServers,
    routes: [
      {
        Method: HttpMethods.GET,
        Exec: () => 'hello world',
        Path: '/',
        Regexp: core.regexPath('/test', HttpMethods.GET),
        Params: core.funcParams(() => 'hello world'),
      },
    ],
    Route: (
      type: HttpMethods,
      path: string,
      exec: (...args: unknown[]) => unknown,
    ) => Route(type, path, exec, server),
    AddMiddleware: (exec: (...args: unknown[]) => unknown) =>
      AddMiddleware(exec, server),
    DefaultError: options.error,
  };

  setServer(port, excaServer);

  excaliServers.listen(port);

  return excaServer;
};

export const SetMainPort = (port: number): void => {
  MainPort = port;
};

export const Route = (
  type: HttpMethods,
  path: string,
  exec: (...args: any[]) => unknown,
  portOrServer: number | IExcaliServer = 8000,
): void => {
  const truePath = path.trim().toLowerCase();
  const server =
    typeof portOrServer === 'object' ? portOrServer : getServer(portOrServer);
  if (!server) {
    throw ExcaliCustomError.ServerError(
      `Server with port ${portOrServer} not found.`,
    );
  }
  const route: IRoute = {
    Method: type,
    Exec: exec,
    Path: truePath,
    Regexp: core.regexPath(truePath, type),
    Params: core.funcParams(exec),
  };
  server.routes.push(route);
};

export const AddMiddleware = (
  exec: (...args: any[]) => unknown,
  portOrServer: number | IExcaliServer = 0,
): void => {
  Route(HttpMethods.MIDDLEWARE, '', exec, portOrServer);
};
