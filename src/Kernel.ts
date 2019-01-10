import {apikey} from 'apikeygen';
import * as bodyParser from 'body-parser';
import {Application} from 'express';
import * as http from 'http';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';
import * as morgan from 'morgan';
import {Connection, createConnection} from 'typeorm';
import {createLogger, format, Logger, transports} from 'winston';

import Category from './Entity/Category';
import Confirmation from './Entity/Confirmation';
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
import {ReportSubscriber} from './Subscriber/ReportSubscriber';
import Types from './types';
import {Config, Vault} from './Vault';

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

    return repo.save(rootConsumer);
}

export default class Kernel {
    public readonly container: Container = new Container({defaultScope: 'Singleton'});

    private app: Application;

    private vault: Vault;

    private connection: Connection;

    private initialized: Boolean = false;

    public constructor(environment: string, debug: boolean) {
        this.container.bind<string>(Types.environment).toConstantValue(environment);
        this.container.bind<boolean>(Types.debug).toConstantValue(debug);
    }

    public async boot(): Promise<void> {
        if (this.initialized) {
            return;
        }

        const server: InversifyExpressServer = new InversifyExpressServer(this.container);

        server.setConfig((app) => {
            app.use(bodyParser.urlencoded({extended: true}));
            app.use(bodyParser.json());
            app.use(morgan('dev'));
        });

        await import('./Controller');
        // Logger
        this.container.bind<Logger>(Types.logger).toDynamicValue(() => createLogger({
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
        this.container.bind<Config>(Types.vault.config).toConstantValue({
            vaultFile: process.env.VAULT_FILE,
            address:   process.env.VAULT_ADDR,
            rootToken: process.env.VAULT_TOKEN,
            roleId:    process.env.VAULT_ROLE_ID,
            secretId:  process.env.VAULT_SECRET_ID,
        });
        this.container.bind<Vault>(Types.vault.client).to(Vault);
        this.vault = this.container.get<Vault>(Types.vault.client);
        await this.vault.initialize();

        const queue = await this.vault.getSecrets('queue');
        this.container.bind<string>(Types.queue.host).toConstantValue(queue.host);
        this.container.bind<string>(Types.queue.port).toConstantValue(queue.port);
        this.container.bind<string>(Types.queue.username).toConstantValue(queue.username);
        this.container.bind<string>(Types.queue.password).toConstantValue(queue.password);
        this.container.bind<Producer>(Types.queue.producer).to(Producer);
        this.container.bind<ReportSubscriber>(Types.subscriber.report).to(ReportSubscriber);

        // Database/TypeORM
        // @todo change to async provider
        this.connection = await createConnection({
            synchronize:       true,
            host:              await this.vault.getSecret('database', 'host'),
            database:          await this.vault.getSecret('api/database', 'name'),
            port:              3306,
            username:          await this.vault.getSecret('api/database', 'user'),
            password:          await this.vault.getSecret('api/database', 'password'),
            type:              'mysql',
            supportBigNumbers: true,
            bigNumberStrings:  true,
            entities:          [
                Confirmation,
                Consumer,
                Report,
                Category,
                Subscription,
                Tag,
                User,
            ],
        });
        this.container.bind<Connection>(Types.database).toConstantValue(this.connection);
        this.connection.subscribers.push(this.container.get<ReportSubscriber>(Types.subscriber.report));
        await createRootUser(this.connection);

        this.container.bind<AbstractManager<Category>>(Types.manager.entity)
            .toDynamicValue((ctx) => new CategoryManager(ctx.container.get(Types.database), Category))
            .whenTargetTagged('entity', Category);
        this.container.bind<AbstractManager<Consumer>>(Types.manager.entity)
            .toDynamicValue((ctx) => new ConsumerManager(ctx.container.get(Types.database), Consumer))
            .whenTargetTagged('entity', Consumer);
        this.container.bind<AbstractManager<Report>>(Types.manager.entity)
            .toDynamicValue((ctx) => new ReportManager(ctx.container.get(Types.database), Report))
            .whenTargetTagged('entity', Report);
        this.container.bind<AbstractManager<User>>(Types.manager.entity)
            .toDynamicValue((ctx) => new UserManager(ctx.container.get(Types.database), User))
            .whenTargetTagged('entity', User);
        this.container.bind<AbstractManager<Subscription>>(Types.manager.entity)
            .toDynamicValue((ctx) => new SubscriptionManager(ctx.container.get(Types.database), Subscription))
            .whenTargetTagged('entity', Subscription);
        this.container.bind<AbstractManager<Tag>>(Types.manager.entity)
            .toDynamicValue((ctx) => new TagManager(ctx.container.get(Types.database), Tag))
            .whenTargetTagged('entity', Tag);

        // Authorizer
        this.container.bind<Authorizer>(Types.authorizer).to(Authorizer);
        setAuthorizorForMiddleware(this.container.get<Authorizer>(Types.authorizer));

        this.container.get<Logger>(Types.logger).info('Administrator Permission Bit: %d', PERMISSIONS.ADMINISTRATOR);

        this.app = server.build();

        this.initialized = true;
    }

    public async run(): Promise<http.Server> {
        await this.boot();

        const port = process.env.PORT || 3000;

        return this.app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
    }
}
