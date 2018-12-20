import * as bodyParser from 'body-parser';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';
import {Connection, createConnection} from 'typeorm';

import './Controller/IndexController';
import './Controller/ReportController';
import Report from './Entity/Report';
import User from './Entity/User';
import Types from './types';
import {Config, Vault} from './Vault';

let initialized          = false;
let container: Container = new Container({defaultScope: 'Singleton'});
let server               = new InversifyExpressServer(container);
let vault: Vault;
let connection: Connection;

server.setConfig((app) => {
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
});

export default async () => {
    if (!initialized) {
        // Vault
        container.bind<Config>(Types.vault.config).toConstantValue({
            vaultFile: process.env.VAULT_FILE,
            address:   process.env.VAULT_ADDR,
            rootToken: process.env.VAULT_TOKEN,
            roleId:    process.env.VAULT_ROLE_ID,
            secretId:  process.env.VAULT_SECRET_ID,
        });
        container.bind<Vault>(Types.vault.client).to(Vault);
        vault = container.get<Vault>(Types.vault.client);
        await vault.initialize();

        // Database/TypeORM
        connection = await createConnection({
            synchronize:       true,
            host:              await vault.getSecret('database', 'host'),
            database:          await vault.getSecret('api/database', 'name'),
            port:              3306,
            username:          await vault.getSecret('api/database', 'user'),
            password:          await vault.getSecret('api/database', 'password'),
            type:              'mysql',
            supportBigNumbers: true,
            bigNumberStrings:  true,
            entities:          [
                Report,
                User,
            ],
        });
        container.bind<Connection>(Types.database).toConstantValue(connection);

        initialized = true;
    }

    return server.build();
}
