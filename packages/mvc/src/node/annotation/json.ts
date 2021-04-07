import { View } from './view';

export const JSON_VIEW_NAME = 'json';

export function Json(): MethodDecorator {
    return View(JSON_VIEW_NAME);
}
