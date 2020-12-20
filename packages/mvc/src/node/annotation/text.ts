import { View } from './view';

export const TEXT_VIEW_NAME = 'text';

export function Text(): MethodDecorator {
    return View(TEXT_VIEW_NAME);
};
