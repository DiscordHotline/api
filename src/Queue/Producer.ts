import {Channel, connect, Replies} from 'amqplib';
import {inject, injectable, postConstruct} from 'inversify';
import Types from '../types';

@injectable()
export default class Queue {
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
        const connection = await connect(
            {
                hostname: this.host,
                port:     parseInt(this.port, 10),
                username: this.username,
                password: this.password,
                vhost:    'hotline',
            },
        );

        this.channel     = await connection.createChannel();
    }

    public async publish(message: any): Promise<boolean> {
        await this.initialize();

        return this.channel.publish('hotline-reports', 'report', Buffer.from(JSON.stringify(message)));
    }
}
