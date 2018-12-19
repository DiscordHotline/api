import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';
import * as serverless from 'serverless-http';

import './Controller/IndexController';
import {Config, Vault} from './Vault';
import Types from './types';


module.exports.handler = async (event, context) => {
    const container = new Container({defaultScope: 'Singleton'});
    // Vault
    container.bind<Config>(Types.vault.config).toConstantValue({
        vaultFile: process.env.VAULT_FILE,
        address:   process.env.VAULT_ADDR,
        rootToken: process.env.VAULT_TOKEN,
        roleId:    process.env.VAULT_ROLE_ID,
        secretId:  process.env.VAULT_SECRET_ID,
    });
    container.bind<Vault>(Types.vault.client).to(Vault);
    const vault: Vault = container.get<Vault>(Types.vault.client);
    await vault.initialize();

    const server = new InversifyExpressServer(container);
    server.setConfig((app) => {
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    });
    const app = server.build();
    const handler = serverless(app);

    return handler(event, context);
}
