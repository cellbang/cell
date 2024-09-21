import './user-controller';
import './home-controller';
import { autoBindEntities } from '@celljs/typeorm';
import * as entities from './entity';
import { autoBind } from '@celljs/core';

autoBindEntities(entities);
export default autoBind();
