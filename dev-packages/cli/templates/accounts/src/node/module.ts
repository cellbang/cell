
import { autoBind } from '@celljs/core';
import { autoBindEntities } from '@celljs/typeorm';
import * as entities from './entity';
import './index';

autoBindEntities(entities);

export default autoBind();
