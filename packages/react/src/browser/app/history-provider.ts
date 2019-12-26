import { Component, Value } from '@malagu/core';
import { HistoryProvider } from './app-protocol';
import { History, createHashHistory, createBrowserHistory, createMemoryHistory } from 'history';

@Component(HistoryProvider)
export class HistoryProviderImpl implements HistoryProvider {

    protected history: History;

    constructor(
        @Value('malagu.react.history') protected readonly historyOptions: any
    ) {
        const historyCreatorMap: { [key: string]: any } = {
            hash: createHashHistory,
            browser: createBrowserHistory,
            memory: createMemoryHistory
        };
        if (this.historyOptions) {
            const { type, ...options } = historyOptions;
            const create = historyCreatorMap[type] || createHashHistory;
            this.history = create(options);
        } else {
            this.history = createHashHistory();
        }

    }

    provide(): History {
        return this.history;
    }

}
