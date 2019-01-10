import {ConfirmChannel, connect} from 'amqplib';
import {stringify} from 'flatted';
import {inject, injectable} from 'inversify';

import Types from '../types';

@injectable()
export default class Queue {
    private channel: ConfirmChannel;

    constructor(
        @inject(Types.queue.host) private host: string,
        @inject(Types.queue.port) private port: string,
        @inject(Types.queue.username) private username: string,
        @inject(Types.queue.password) private password: string,
    ) {
    }

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

        this.channel = await connection.createConfirmChannel();
    }

    public async publish(message: any, attempt = 0): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this.initialize();

            console.log(stringify(message));
            try {
                this.channel.publish(
                    'hotline-reports',
                    'report',
                    Buffer.from(stringify(message)),
                    undefined,
                    async (err) => {
                        if (err) {
                            console.error('Failed to publish message', err);
                            if (attempt < 5) {
                                return this.publish(message, attempt + 1).then(resolve).catch(reject);
                            }

                            return reject(err);
                        }

                        resolve(true);
                    },
                );
            } catch (e) {
                console.error('Failed to publish message', e);
                if (attempt < 5) {
                    return this.publish(message, attempt + 1).then(resolve).catch(reject);
                }

                reject(e);
            }
        });
    }
}
