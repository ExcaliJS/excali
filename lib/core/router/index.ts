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

  public parseUrl(url: string | undefined): IUrlInfo {
    if (!url)
      return { Route: null }

    const splitted = url.split('?', 2)
    const parametersSplitted = splitted.length > 1 ? splitted[1].split('&') : null
    const parameters: Record<string, unknown> = {}
    if (parametersSplitted) {
      for (let idx = 0; idx < parametersSplitted.length; idx++) {
        const current = parametersSplitted[idx]
        const parameter = current.split('=', 2)
        parameters[parameter[0].toLowerCase()] = parameter.length > 1 ? parameter[1] : null
      }
    }
    return { Route: splitted[0].toLowerCase().trim(), Parameters: parameters }

  }

  public parseBody(req: RequestMessage): Promise<Record<string, unknown>> {
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      let body: string = ''
      let result: Record<string, unknown> = {}

      req.on('data', (chunk: string) => {
        body += chunk
      })

      req.on('end', () => {
        try {
          if (req.headers['content-type'] === 'application/json') {
            result = JSON.parse(body)
          } else {
            result = { body }
          }
          resolve(result)
        } catch (err) {
          reject(ExcaliCustomError.BadRequest('unable to parse json body'))
        }
      })

      req.on('error', () => {
        reject(new Error(ExcaliError.UNABLE_TO_READ_BODY))
      })
    })

  }

  public regexPath(path: string, method: HttpMethods): RegExp {
    let res = path
    // pattern to find all the parameters
    const regexp1 = new RegExp('(:[^/]+)', 'g')
    let tmp

    // replace all * with (.*) to match any character
    res = res.replace(/\*/g, '(.*)')
    // loop through all the parameters
    while ((tmp = regexp1.exec(path)) !== null) {
      // get the name of the parameter
      const name = tmp[0].replace(':', '')
      // replace the parameter with a group that matches any character except for /
      res = res.replace(tmp[0], `(?<${name}>[^/]*)`)

    }
    // if the method is not static, add a $ to the end of the path to match the end of the string
    if (method !== HttpMethods.STATIC) {
      res += '$'
    }

    // return the path as a regex
    return new RegExp('^' + res, 'i')
  }
  public sendResponse(res: Http.ServerResponse, code: number, body: string | boolean | Record<string, unknown> | null): void {
    const objType = typeof body
    if (objType === 'object' && body !== null) {
      res.writeHead(code, { 'Content-Type': 'application/json' })
      body = JSON.stringify(body)
    }
    else {
      res.writeHead(code, { 'Content-Type': 'text/html' })
    }


    if (objType !== 'string' && body !== null) {
      body = body.toString()
    }

    res.write(body, 'utf-8')

    res.end()
  }
  public urlParams(url: string, regexp: RegExp): Record<string, string> {
    return regexp.exec(url)?.groups ?? {};
  }
}