import { View } from './view';

export const HTML_VIEW_NAME = 'html';

export function Html(file?: string): MethodDecorator {
    return View(HTML_VIEW_NAME, { file });
}
