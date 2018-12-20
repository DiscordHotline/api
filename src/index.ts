import 'reflect-metadata';
import * as serverless from 'serverless-http';
import Kernel from './Kernel';

module.exports.handler = async (event, context) => {
    const handler = await Kernel();

    return serverless(handler)(event, context);
}
