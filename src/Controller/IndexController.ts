import * as express from 'express';
import {BaseHttpController, controller, httpGet, results} from 'inversify-express-utils';

@controller('/')
export class IndexController extends BaseHttpController {
    @httpGet('/')
    private index(req: express.Request, res: express.Response, next: express.NextFunction): results.JsonResult {
        return this.json({status: 'ok'}, 200);
    }
}
