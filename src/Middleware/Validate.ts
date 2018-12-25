import {validate} from 'class-validator';
import AbstractModel from '../Model/AbstractModel';

export default (cls: typeof AbstractModel) => async (req, res, next) => {
    const instance = new cls(req.body);
    const errors   = await validate(instance);
    if (errors.length > 0) {
        return res.status(400).json({message: 'Failed Validation', errors}, 400);
    }

    req.body = instance;
    next();
};
