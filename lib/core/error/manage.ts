
import * as Http from 'http';
import { ExcaliCustomError } from './handle';
import { Router } from '../router';

export const manageError = (res: Http.ServerResponse, err: ExcaliCustomError|Error|string): boolean =>{
    const router = new Router()
    
    if (typeof err === 'string')
    {
      router.sendResponse(res, 500, err)
        return true
    }

    const code = Object.keys(err).includes('code')? (err as ExcaliCustomError).code : 500
    router.sendResponse(res, code, err.message)
    return true
}