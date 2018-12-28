import {injectable} from 'inversify';

import Subscription from '../Entity/Subscription';
import AbstractManager from './AbstractManager';

@injectable()
export default class SubscriptionManager extends AbstractManager<Subscription> {
}
