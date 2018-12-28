import {Channel, connect, Connection, Replies} from 'amqplib';
import {inject, injectable, postConstruct} from 'inversify';
import Types from '../types';

@injectable()
export default class Queue {
    private connection: Connection;

    private channel: Channel;

    private exchange: Replies.AssertExchange;

    private queue: Replies.AssertQueue;

    constructor(
        @inject(Types.queue.host) private host: string,
        @inject(Types.queue.port) private port: string,
        @inject(Types.queue.username) private username: string,
        @inject(Types.queue.password) private password: string,
    ) {
    }

    @postConstruct()
    public async initialize(): Promise<void> {
        this.connection = await connect({
            hostname:  this.host,
            port:      parseInt(this.port, 10),
            username:  this.username,
            password:  this.password,
            vhost:     'hotline',
            heartbeat: 5,
        });
        this.channel    = await this.connection.createChannel();
    }

    public async publish(message: any): Promise<boolean> {
        try {
            return this.channel.publish('hotline-reports', 'report', Buffer.from(JSON.stringify(message)));
        } catch (e) {
            await this.initialize();

            return this.publish(message);
        }
    }
}
