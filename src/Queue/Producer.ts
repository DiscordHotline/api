import * as withAutoRecovery from 'amqplib-auto-recovery';
import * as amqp from 'amqplib/callback_api';
import {Channel, Connection, Replies} from 'amqplib/callback_api';
import {inject, injectable, postConstruct} from 'inversify';
import {Logger} from 'winston';
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
        return new Promise(async (resolve, reject) => {
            await withAutoRecovery(amqp).connect(
                {
                    hostname:  this.host,
                    port:      parseInt(this.port, 10),
                    username:  this.username,
                    password:  this.password,
                    vhost:     'hotline',
                    heartbeat: 5,
                },
                (err, conn) => {
                    if (err) {
                        return reject(err);
                    }

                    conn.createChannel((e, channel) => {
                        if (e) {
                            return reject(e);
                        }

                        this.channel = channel;
                        resolve();
                    });
                },
            );
        });

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
