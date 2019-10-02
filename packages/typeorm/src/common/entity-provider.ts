
import { DEFAULT_CONNECTION_NAME } from './constants';

const _entitiyMap = new Map<string, Function[]>();

export function autoBindEntities(entities: any, name = DEFAULT_CONNECTION_NAME) {
    let _entities = entities;
    if (!Array.isArray(entities)) {
        _entities = [];
        for (const key of Object.keys(entities)) {
            _entities.push(entities[key]);
        }
    }
    if (!_entitiyMap.get(name)) {

    }
    const current = _entitiyMap.get(name) || [];

    _entitiyMap.set(name, [ ...current, ..._entities ]);

}

export namespace EntityProvider {
    export function getEntities(name = DEFAULT_CONNECTION_NAME) {
        return _entitiyMap.get(name);
    }
}
