import 'reflect-metadata';
import * as serverless from 'serverless-http';
import Kernel from './Kernel';

module.exports.handler = async (event, context) => (serverless(Kernel())(event, context));
