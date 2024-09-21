import './user-service';
import * as entities from './entity';
import { autoBind } from '@celljs/core';
import { autoBindEntities } from '@celljs/typeorm';

autoBindEntities(entities)

export default autoBind();
