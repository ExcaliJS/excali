import { IExcaliServerOptions, IServer } from '../types/app';
import { getServer } from '../utils/server.info';
import * as Http from 'http';
import * as Https from 'https';
import * as Url from 'url';
import * as Fs from 'fs';

export class Excali {
  public defaultPort = 80;

  public serverOptions(options: IExcaliServerOptions): Https.ServerOptions {
    const result: Https.ServerOptions = {};
    if (options.https) {
      result.cert = Fs.readFileSync(options.https.cert);
      result.key = Fs.readFileSync(options.https.key);
    }
    return result;
  }
}
