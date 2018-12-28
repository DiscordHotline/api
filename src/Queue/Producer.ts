import {Channel, connect, Connection, Replies} from 'amqplib';
import {inject, injectable} from 'inversify';
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

    public async initialize(): Promise<void> {
        this.connection = await connect({
            hostname: this.host,
            port:     parseInt(this.port, 10),
            username: this.username,
            password: this.password,
            vhost:    'hotline',
        });
        this.channel    = await this.connection.createChannel();
        this.exchange   = await this.channel.assertExchange('hotline-reports', 'direct', {durable: true});
        this.queue      = await this.channel.assertQueue('hotline-reports', {durable: true});
        await this.channel.bindQueue('hotline-reports', 'hotline-reports', 'report');
    }

    public async publish(message: any) {
        await this.channel.publish('hotline-reports', 'report', Buffer.from(JSON.stringify(message)));
    }
}
