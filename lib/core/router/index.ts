import {
  ExcaliError,
  HttpMethods,
  IExcaliServer,
  Iparams,
  IRoute,
  IRouterClass,
  IUrlInfo,
  PathResult,
  RequestMessage
} from "../types/app";

import * as Http from 'http';
import { ExcaliCustomError } from "../error/handle";

export class Router implements IRouterClass {

   public servers: Record<number, IExcaliServer> = {}

  public funcParams(func: Function, lowercase = false): Iparams[] {
    const funcString = func.toString();
    const paramsString = funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')')).trim();

    const paramList: Iparams[] = [];

    paramsString.split(',').forEach((param) => {
      const [name, defaultValue] = param.trim().split('=');
      const paramName = lowercase ? name.toLowerCase() : name;
      const required = typeof defaultValue === 'undefined';

      paramList.push({ name: paramName, reqeired: required });
    });


    return paramList;
  }

}