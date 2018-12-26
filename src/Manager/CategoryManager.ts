import {injectable} from 'inversify';
import Category from '../Entity/Category';

import AbstractManager from './AbstractManager';

@injectable()
export default class CategoryManager extends AbstractManager<Category> {
}
