import * as Http from 'http';

export interface Iparams {
  name: string;
  reqeired: string;
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

export interface IServer {
  AddRoute: (route : HttpMethods, path:string, exec: (...args:unknown[])=> unknown) => void;
  AddMiddleware: ( exec: (...args:unknown[])=> unknown) => void;
  AddStatic: (path:string, exec: (...args:unknown[])=> unknown) => void;
  AddRedirect: (path:string, exec: (...args:unknown[])=> unknown) => void;
  AddUse: (path:string, exec: (...args:unknown[])=> unknown) => void;
  Start: (port:number) => void;
  Stop: () => void;
  GetRoutes: () => IRoute[];
  GetMiddleware: () => IRoute[];
  GetStatic: () => IRoute[];
  GetRedirect: () => IRoute[];
  GetUse: () => IRoute[];
  GetServer: () => Http.Server;
}

export interface IRoute {
  method : HttpMethods;
  path: string;
  handler: Function;
  params: Iparams[];
  Regexp: RegExp;
}



