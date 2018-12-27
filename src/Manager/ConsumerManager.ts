import {injectable} from 'inversify';

import Consumer from '../Entity/Consumer';
import AbstractManager from './AbstractManager';

@injectable()
export default class ConsumerManager extends AbstractManager<Consumer> {
}
