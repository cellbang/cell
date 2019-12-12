import { Component } from '@malagu/core';
import { HistoryProvider } from './app-protocol';
import { History, createHashHistory } from 'history';

@Component(HistoryProvider)
export class HistoryProviderImpl implements HistoryProvider {

    provide(): History {
        const history = createHashHistory();
        return history;
    }

}
