import { History } from 'history';

export const HistoryProvider = Symbol('HistoryProvider');

export interface HistoryProvider  {
    provide(): History
}
