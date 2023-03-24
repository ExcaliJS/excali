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



