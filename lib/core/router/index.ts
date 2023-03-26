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

  public pathsCheck(path: string | null, route: IRoute, method?: string): PathResult {
    if (route.method === HttpMethods.REDIRECT) {
      return PathResult.Redirect
    }
    if (route.method === HttpMethods.MIDDLEWARE || ((route.method === method || route.method === HttpMethods.USE) && route.Regexp.test(path ?? ''))) {
      return route.method === HttpMethods.MIDDLEWARE ? PathResult.NoReturn : PathResult.ValueReturned
    }

    if (route.method === HttpMethods.STATIC && route.Regexp.test(path ?? ''))
      return PathResult.Static

    return PathResult.NotInPath
  }

  public paramsCheck(req: RequestMessage, expectations: Iparams[], res: Http.ServerResponse, server: IExcaliServer, params?: Record<string, unknown>): unknown[] {
    const result: unknown[] = []
    const unset: string[] = []

    const infos: Record<string, unknown> = {
      '_req': req,
      '_res': res,
      '_method': req.method,
      '_headers': req.headers,
      '_server': server
    }

    expectations.forEach(expectation => {
      const key = expectation.name
      let val = params && params[key]

      if (key in infos) val = infos[key]

      if (val !== undefined) {
        return result.push(val)
      }

      if (expectation.reqeired) {
        unset.push(key)
      }

    })

    if (unset.length > 0) {
      throw ExcaliCustomError.BadRequest(`${ExcaliError.MISSING_PARAMETER}${unset.join(',')}`)
    }

    return result

  }

}