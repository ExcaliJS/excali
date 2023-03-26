import { Core } from "../core";
import * as Http from 'http';
import { HttpMethods, IExcaliServer, PathResult, RequestMessage } from "../types/app";
import { manageError } from "../error/manage";
import { ExcaliCustomError } from "../error/handle";

export class RequestParser {
  public core:Core;
  public servers: Record<number, IExcaliServer> = {}

  constructor(core:Core){
    this.core = core
  }
  public async parser(port: number, req: Http.IncomingMessage, res: Http.ServerResponse): Promise<void>{
    const server = this.servers[port]
    const urlInfo = this.core.parseUrl(req.url)
    const requestMessageInfo = req as RequestMessage
    requestMessageInfo.query = urlInfo.Parameters
    let error

    try {
        urlInfo.Body =  await this.core.parseBody(requestMessageInfo)
    }
    catch(err)
    {
        manageError(res, err as string)
        return 
    }
    
    let executed = false

    if (server){
        
        for (const idx in server.routes) {
            const route = server.routes[idx]
            const isPathValid = this.core.pathsCheck(urlInfo.Route, route, req.method)
            if (isPathValid === PathResult.Redirect)
            {
                await route.handler(req, res)
                return
            }

          }
}