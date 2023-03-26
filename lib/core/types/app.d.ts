import * as Http from 'http';

export interface Iparams {
  name: string;
  reqeired: boolean;
}

export enum HttpMethods {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  MIDDLEWARE = 'MIDDLEWARE',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT  = 'PUT',
  REDIRECT = 'REDIRECT',
  STATIC = 'STATIC',
  USE = 'USE',
}


export enum PathResult {
    NotInPath =  -1,
    NoReturn = 1,
    ValueReturned = 2,
    Redirect = 3,
    Static = 4 
}

export interface IRoute {
  method : HttpMethods;
  path: string;
  handler: Function;
  params: Iparams[];
  Regexp: RegExp;
}


export interface IServer {
  AddRoute: (route : HttpMethods, path:string, exec: (...args:unknown[])=> unknown) => void;
  AddMiddleware: ( exec: (...args:unknown[])=> unknown) => void;
  AddStatic: (path:string, exec: (...args:unknown[])=> unknown) => void;
  AddRedirect: (path:string, exec: (...args:unknown[])=> unknown) => void;
  AddUse: (path:string, exec: (...args:unknown[])=> unknown) => void;
  Start: (port:number) => void;
  Stop: () => void;
  GetRoutes: () => IRoute[];
  GetMiddleware: () => IMiddleware[];
  GetStatic: () => IRoute[];
  GetRedirect: () => IRoute[];
  GetUse: () => IRoute[];
  GetServer: () => Http.Server;
}

export interface IExcaliServer extends IServer  {
  coreServer: Http.Server;
  routes: IRoute[];
  defaltError?: () => void;
}

export interface IExcaliServerOptions {
  https?: {key : string, cert : string};
  error?: {code : number, message : string};
}

export class RequestMessage extends Http.IncomingMessage {
  query?: Record<string, string>;
  body?: Record<string, string>;
}

export interface IUrlInfo 
{
    Route: string | null
    Parameters?: Record<string, unknown>
    Body?: Record<string, unknown>
}

export enum ExcaliError 
{
    MISSING_PARAMETER = 'A parameter is missing : ',
    UNKNOW_PARAMETER = 'Unknown parameter : ',
    UNABLE_TO_READ_BODY = 'Unabled to read body'
}



export interface IRouterClass {
  funcParams(func:Function,lowercase?:boolean): Iparams[]
  pathsCheck(path: string | null, route: IRoute, method?: string): PathResult
  paramsCheck(req: RequestMessage, expectations: Iparams[], res: Http.ServerResponse, server: IExcaliServer, params?: Record<string, unknown>): unknown[]
  parseUrl(url: string | undefined): IUrlInfo
  parseBody(req: RequestMessage): Promise<Record<string, unknown>>
  regexPath(path: string, method: HttpMethods): RegExp
  urlParams(url: string, regexp: RegExp): Record<string, string>
  sendResponse(res: Http.ServerResponse, code: number, body : string|boolean|Record<string, unknown>|null): void
}


