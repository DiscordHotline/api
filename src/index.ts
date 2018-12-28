import * as serverless from 'serverless-http';
import Kernel from './Kernel';

let handler;
module.exports.handler = async (event, context) => {
    if (!handler) {
        handler = await Kernel();
    }
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUP - Lambda is warm!');

        return {
            statusCode: 200,
            body:       'Lambda is warm!',
        };
    }

    return serverless(handler)(event, context);
};
