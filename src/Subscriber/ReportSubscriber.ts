import {S3} from 'aws-sdk';
import axios from 'axios';
import * as fileType from 'file-type';
import {generateCombination as generateName} from 'gfycat-style-urls';
import {inject, injectable} from 'inversify';
import {EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent} from 'typeorm';
import {Logger} from 'winston';

import Report from '../Entity/Report';
import Producer from '../Queue/Producer';
import Types from '../types';
import {Vault} from '../Vault';

type PublishType = 'NEW_REPORT' | 'EDIT_REPORT' | 'DELETE_REPORT';
const allowedFileTypes = ['gif', 'mp4', 'webp', 'png', 'jpg', 'txt'];

@EventSubscriber()
@injectable()
export class ReportSubscriber implements EntitySubscriberInterface<Report> {
    private bucketName: string;

    public constructor(
        @inject(Types.queue.producer) private producer: Producer,
        @inject(Types.logger) private logger: Logger,
        @inject(Types.vault.client) private vault: Vault,
    ) {
    }

    public listenTo() {
        return Report;
    }

    public async beforeInsert(event: InsertEvent<Report>): Promise<any> {
        await this.updateLinks(event.entity);
    }

    public async afterInsert(event: InsertEvent<Report>): Promise<any> {
        await this.publish('NEW_REPORT', event.entity);
    }

    public async beforeUpdate(event: UpdateEvent<Report>): Promise<any> {
        await this.updateLinks(event.entity);
        await this.publish('EDIT_REPORT', event.entity, event.databaseEntity);
    }

    public async beforeRemove(event: RemoveEvent<Report>): Promise<any> {
        await this.publish('DELETE_REPORT', event.entity as Report);
    }

    private async updateLinks(report: Report): Promise<void> {
        if (report.links.length > 0) {
            for (const index of Object.keys(report.links)) {
                try {
                    if (!/^https:\/\/i\.hotline\.gg\//.test(report.links[index])) {
                        report.links[index] = await this.reUploadImage(report.links[index]);
                    }
                } catch (e) {
                    this.logger.error('Failed to re-upload image: %O', e);
                }
            }
        }
    }

    private async reUploadImage(url: string): Promise<string> {
        const s3         = new S3({
            accessKeyId:     await this.vault.getSecret('api', 'aws_access_key'),
            secretAccessKey: await this.vault.getSecret('api', 'aws_access_secret'),
        });
        const bucketName = await this.vault.getSecret('api', 'image-bucket-name');

        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios({
                    url,
                    method: 'get',
                    responseType: 'arraybuffer',
                    // 15MB File size limit
                    maxContentLength: 1000000 * 15
                });

                let type = fileType(new Uint8Array(response.data));
                if (!type && response.headers['content-type'].includes('text/plain')) {
                    type = {ext: 'txt', mime: 'text/plain'};
                    response.data = response.data.toString('utf8');
                }
                if (!allowedFileTypes.includes(type.ext)) {
                    return resolve(url);
                }

                const name = `${generateName(3, '-')}.${type.ext}`;
                const req = {
                    Bucket:      bucketName,
                    Key:         name,
                    Body:        response.data,
                    ACL:         'public-read',
                    ContentType: `${type.mime}; charset=utf-8`
                };

                s3.putObject(
                    req,
                    (e, data) => {
                        console.log('Image Upload Result: ', e, data, `https://${bucketName}/${name}`);
                        e ? reject(e) : resolve(`https://f.hotline.gg/${name}`);
                    },
                );
            } catch (e) {
                reject(e);
            }
        });
    }

    private async publish(type: PublishType, report: Report, oldReport?: Report): Promise<void> {
        try {
            const data: any = {type, data: {id: report.id, report}};
            if (oldReport) {
                data.data.oldReport = oldReport;
            }

            await this.producer.publish(data);
            this.logger.info('Queued report message: %s %s', type, report.id);
        } catch (e) {
            this.logger.error('Failed to queue message: %O', e);
        }
    }
}
