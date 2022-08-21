import './user-service';
import * as entities from './entity';
import { autoBind } from '@malagu/core';
import { autoBindEntities } from '@malagu/typeorm';

autoBindEntities(entities)

export default autoBind();
