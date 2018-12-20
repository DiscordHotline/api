import 'reflect-metadata';
import * as serverless from 'serverless-http';
import Kernel from './Kernel';

let handler;

module.exports.handler = async (event, context) => {
    if (!handler) {
        handler = await Kernel();
    }

    return serverless(handler)(event, context);
};
