import {injectable} from 'inversify';
import Tag from '../Entity/Tag';

import AbstractManager from './AbstractManager';

@injectable()
export default class TagManager extends AbstractManager<Tag> {
}
