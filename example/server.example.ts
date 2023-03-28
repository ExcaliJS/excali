import { Route, excaliServer } from '../lib/app/main';
import { ExcaliCustomError } from '../lib/error/handle';
import { ExcaliError, HttpMethods } from '../lib/type/core.type';
import http from 'http';

excaliServer(8000);

Route(HttpMethods.GET, '/test', (req: http.IncomingMessage) => {
  return 'hello world';
});

Route(HttpMethods.GET, '/deneme', (req, res) => {
  return 'goodby world';
});

Route(HttpMethods.GET, '/error', (req, res) => {
  throw ExcaliCustomError.NotFound('not found');
});
