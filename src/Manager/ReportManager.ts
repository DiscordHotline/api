import {S3} from 'aws-sdk';
import * as generateName from 'gfycat-style-urls';
import {inject, injectable} from 'inversify';
import * as mime from 'mime-types';
import {Connection} from 'typeorm';
import {Logger} from 'winston';

import Report from '../Entity/Report';
import Types from '../types';
import {Vault} from '../Vault';
import AbstractManager from './AbstractManager';
import request = require('request');

@injectable()
export default class ReportManager extends AbstractManager<Report> {
    private bucketName: string;

    public constructor(
        @inject(Types.database) database: Connection,
        @inject(Types.vault.client) protected vault: Vault,
        @inject(Types.logger) protected logger: Logger,
        type: new () => Report,
    ) {
        super(database, type);
    }

    protected createInstance(): Report {
        const instance             = new Report();
        instance.tags              = [];
        instance.reportedUsers     = [];
        instance.confirmationUsers = [];
        instance.links             = [];

        return instance;
    }

    protected async onBeforeSave(instance: Report): Promise<void> {
        if (instance.links.length > 0) {
            for (const index of Object.keys(instance.links)) {
                try {
                    instance.links[index] = await this.reuploadImage(instance.links[index]);
                } catch (e) {
                    this.logger.error('Failed to re-upload image: %O', e);
                }
            }
        }

        return super.onBeforeSave(instance);
    }

    private async reuploadImage(url: string): Promise<string> {
        const s3 = new S3();
        if (!this.bucketName) {
            this.bucketName = await this.vault.getSecret('api', 'image-bucket-name');
        }

        return new Promise((resolve, reject) => {
            request({url, followRedirect: true, encoding: null}, (err, res, body) => {
                if (err) {
                    return reject(err);
                }

                const name = `${generateName(4, '-')}.${mime.extension(res.headers['content-type'])}`;
                s3.putObject(
                    {
                        Bucket:      this.bucketName,
                        Key:         name,
                        Body:        body,
                        ACL:         'public-read',
                        ContentType: res.headers['content-type'],
                    },
                    () => resolve(`https://i.hotline.gg/${name}`),
                );
            });
        });
    }
}
