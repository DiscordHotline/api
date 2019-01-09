import 'reflect-metadata';
import 'source-map-support/register';

import Kernel from './Kernel';

(new Kernel(process.env.ENVIRONMENT || 'dev', (process.env.DEBUG || '1') === '1'))
    .run()
    .catch(console.error);
