import { IExcaliServerOptions } from '../ts/app';
import * as Http from 'http';
import * as Https from 'https';
import * as Fs from 'fs';
import { RequestParser } from '../parser/request.parser';
import { Core } from '../core/core.module';
import { getServer } from '../utils';

export class Excali {
  public defaultPort = 8000;
  requestParser: RequestParser;

  constructor(requestParser: RequestParser) {
    this.requestParser = requestParser;
  }

  public excaliServerOptions(options: IExcaliServerOptions) {
    const result: Https.ServerOptions = {};
    if (options.https) {
      result.cert = Fs.readFileSync(options.https.cert);
      result.key = Fs.readFileSync(options.https.key);
    }
    return result;
  }

  public excaliServer(port: number, options: IExcaliServerOptions = {}) {
    if (port === 0) {
      port = this.defaultPort;
    }

    const existingServer = getServer(port);
    if (existingServer) {
      return existingServer;
    }

    // const httpModule = Http;
    const server = Http.createServer(
      this.excaliServerOptions(options),
      async (request: Http.IncomingMessage, response: Http.ServerResponse) => {
        if (request.url == '/merhaaba') {
          response.writeHead(200, { 'Content-Type': 'text/plain' });
          response.write('Hello World');
          response.end();
          return;
        }
        await this.requestParser.parser(port, request, response);
      },
    ).listen(port, () => {
      console.log(`Excali server is running on port ${port}`);
    });
    return server;
  }
}

const core = new Core();
const requestParser = new RequestParser(core);
const excali = new Excali(requestParser);
excali.excaliServer(3000);
