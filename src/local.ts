import 'reflect-metadata';
import Kernel from './Kernel';
import {calculatePermissions, PERMISSIONS} from './Permissions';

Kernel().then(app => app.listen(3000, () => console.log("Listening on http://localhost:3000")));
