import { View } from './view';

export const FILE_VIEW_NAME = 'file';

export function File(file?: string): MethodDecorator {
    return View(FILE_VIEW_NAME, { file });
}
