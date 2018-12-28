import 'reflect-metadata';
import 'source-map-support/register';

import {apikey} from 'apikeygen';
import * as bodyParser from 'body-parser';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';
import * as morgan from 'morgan';
import {Connection, createConnection} from 'typeorm';
import {createLogger, format, Logger, transports} from 'winston';
import Category from './Entity/Category';

import Consumer from './Entity/Consumer';
import Report from './Entity/Report';
import Subscription from './Entity/Subscription';
import Tag from './Entity/Tag';
import User from './Entity/User';
import AbstractManager from './Manager/AbstractManager';
import CategoryManager from './Manager/CategoryManager';
import ConsumerManager from './Manager/ConsumerManager';
import ReportManager from './Manager/ReportManager';
import SubscriptionManager from './Manager/SubscriptionManager';
import TagManager from './Manager/TagManager';
import UserManager from './Manager/UserManager';
import {PERMISSIONS} from './Permissions';
import Producer from './Queue/Producer';
import {default as Authorizer, setAuthorizorForMiddleware} from './Security/Authorizer';
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
    app.use(morgan('dev'));
});

async function createRootUser(_conn: Connection) {
    const repo       = _conn.getRepository<Consumer>(Consumer);
    let rootConsumer = await repo.findOne({name: 'root'});
    if (!!rootConsumer) {
        return;
    }

    rootConsumer             = new Consumer();
    rootConsumer.name        = 'root';
    rootConsumer.description = 'Root Consumer - Admin User';
    rootConsumer.permissions = PERMISSIONS.ADMINISTRATOR;
    rootConsumer.apiKey      = apikey(64);

    return rootConsumer.save();
}

export default async () => {
    if (!initialized) {
        await import('./Controller');
        // Logger
        container.bind<Logger>(Types.logger).toDynamicValue(() => createLogger({
            level:      process.env.DEBUG || false ? 'debug' : 'info',
            format:     format.combine(
                format.splat(),
                format.colorize(),
                format.timestamp(),
                format.align(),
                format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
            ),
            transports: [
                new transports.Console(),
            ],
        }));

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
                Consumer,
                Report,
                Category,
                Subscription,
                Tag,
                User,
            ],
        });
        container.bind<Connection>(Types.database).toConstantValue(connection);
        await createRootUser(connection);

        container.bind<AbstractManager<Category>>(Types.manager.entity)
                 .toDynamicValue((ctx) => new CategoryManager(ctx.container.get(Types.database), Category))
                 .whenTargetTagged('entity', Category);
        container.bind<AbstractManager<Consumer>>(Types.manager.entity)
                 .toDynamicValue((ctx) => new ConsumerManager(ctx.container.get(Types.database), Consumer))
                 .whenTargetTagged('entity', Consumer);
        container.bind<AbstractManager<Report>>(Types.manager.entity)
                 .toDynamicValue((ctx) => new ReportManager(ctx.container.get(Types.database), Report))
                 .whenTargetTagged('entity', Report);
        container.bind<AbstractManager<User>>(Types.manager.entity)
                 .toDynamicValue((ctx) => new UserManager(ctx.container.get(Types.database), User))
                 .whenTargetTagged('entity', User);
        container.bind<AbstractManager<Subscription>>(Types.manager.entity)
                 .toDynamicValue((ctx) => new SubscriptionManager(ctx.container.get(Types.database), Subscription))
                 .whenTargetTagged('entity', Subscription);
        container.bind<AbstractManager<Tag>>(Types.manager.entity)
                 .toDynamicValue((ctx) => new TagManager(ctx.container.get(Types.database), Tag))
                 .whenTargetTagged('entity', Tag);

        // Authorizer
        container.bind<Authorizer>(Types.authorizer).to(Authorizer);
        setAuthorizorForMiddleware(container.get<Authorizer>(Types.authorizer));

        const queue = await vault.getSecrets('queue');
        container.bind<string>(Types.queue.host).toConstantValue(queue.host);
        container.bind<string>(Types.queue.port).toConstantValue(queue.port);
        container.bind<string>(Types.queue.username).toConstantValue(queue.username);
        container.bind<string>(Types.queue.password).toConstantValue(queue.password);
        container.bind<Producer>(Types.queue.producer).to(Producer);

        container.get<Logger>(Types.logger).info('Administrator Permission Bit: %d', PERMISSIONS.ADMINISTRATOR);
        initialized = true;
    }

    return server.build();
};
