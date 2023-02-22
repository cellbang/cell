
import { autoBind } from '@malagu/core';
import { autoBindEntities } from '@malagu/typeorm';
import * as entities from './entity';
import './index';

autoBindEntities(entities);

export default autoBind();
