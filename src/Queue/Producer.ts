import {ConfirmChannel, connect} from 'amqplib';
import {inject, injectable, postConstruct} from 'inversify';
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

    public async publish(message: any): Promise<boolean> {
        return new Promise(async (resolve) => {
            await this.initialize();

            try {
                this.channel.publish(
                    'hotline-reports',
                    'report',
                    Buffer.from(JSON.stringify(message)),
                    undefined,
                    async (err) => {
                        if (err) {
                            console.error(err);

                            return this.publish(message).then(resolve);
                        }

                        resolve(true);
                    },
                );
            } catch (_) {
                return this.publish(message).then(resolve);
            }
        });
    }
}
