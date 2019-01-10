import {inject, injectable} from 'inversify';
import {BaseEntity, Connection, EntityManager, Repository} from 'typeorm';

import Types from '../types';

@injectable()
export default class AbstractManager<T extends BaseEntity> {
    protected manager: EntityManager;

    protected repository: Repository<T>;

    public constructor(@inject(Types.database) protected database: Connection, protected type: new () => T) {
        this.repository = database.getRepository<T>(type);
        this.manager    = this.repository.manager;
    }

    public async create(
        predicate?: (x: T) => (void | Promise<void>),
        save?: boolean,
    ): Promise<T>;
    public async create(partial?: Partial<T>, save?: boolean): Promise<T>;
    public async create(
        predicate?: ((x: T) => (void | Promise<void>)) | Partial<T>,
        save: boolean = true,
    ): Promise<T> {
        const instance = await this.createInstanceFromPredicate(predicate);

        if (save) {
            await this.save(instance);
        }

        return instance;
    }

    public async update(
        instance: T,
        predicate?: (x: T) => (void | Promise<void>),
        save?: boolean,
    ): Promise<T>;
    public async update(instance: T, partial?: Partial<T>, save?: boolean): Promise<T>;
    public async update(
        instance: T,
        predicate?: ((x: T) => (void | Promise<void>)) | Partial<T>,
        save: boolean = true,
    ): Promise<T> {
        if (predicate instanceof Function) {
            await predicate(instance);

        } else {
            instance = Object.assign(instance, predicate);
        }

        if (save) {
            await this.save(instance);
        }

        return instance;
    }

    public async save(instance: T): Promise<T> {
        await this.onBeforeSave(instance);
        await this.repository.save(instance as any);
        await this.onAfterSave(instance);

        return instance;
    }

    protected async onBeforeSave(instance: T): Promise<void> {
        if ((instance as any).updateDate) {
            (instance as any).updateDate = new Date();
        }
    }

    protected async onAfterSave(instance: T): Promise<void> {
    }

    protected async createInstanceFromPredicate(
        predicate?: ((x: T) => (void | Promise<void>)) | Partial<T>,
    ): Promise<T> {
        let instance: T;
        if (predicate instanceof Function) {
            instance = this.createInstance();

            await predicate(instance);

        } else {
            instance = Object.assign(this.createInstance(), predicate);
        }

        return instance;
    }

    protected createInstance(): T {
        return new this.type();
    }
}
