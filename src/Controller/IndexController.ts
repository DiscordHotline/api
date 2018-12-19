import * as express from 'express';
import {inject} from 'inversify';
import {controller, httpGet, interfaces} from 'inversify-express-utils';
import {Vault} from '../Vault';
import Types from '../types';

@controller('/')
export class IndexController implements interfaces.Controller {
    public constructor(@inject(Types.vault.client) private vault: Vault) {
    }

    @httpGet('/')
    private async index(req: express.Request, res: express.Response, next: express.NextFunction): Promise<string> {
        return await this.vault.getSecret('database', 'host');
    }
}
