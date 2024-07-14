import * as React from 'react';
import { LOCALE_REACT_CONTEXT_PRIORITY } from './locale-protocol';
import { IntlProvider } from 'react-intl';
import { ContainerUtil, Logger } from '@malagu/core';
import { LocaleManager } from '@malagu/widget';
import { Context } from '../annotation';

export function LocaleContext({ children }: React.PropsWithChildren) {
    const localeManager = ContainerUtil.get<LocaleManager>(LocaleManager);
    const [locale, setLocale] = React.useState(localeManager.currentSubject.value);
    React.useEffect(() => {
        const subscription = localeManager.currentSubject.subscribe(l => setLocale(l));
        return () => subscription.unsubscribe();
    }, []);

    return (
        <IntlProvider locale={locale?.lang || navigator.language} messages={locale?.messages} onError={err => {
            const logger = ContainerUtil.get<Logger>(Logger);
            if (err.code !== 'MISSING_TRANSLATION') {
                logger.warn(err);
            }
        }}>
            {children}
        </IntlProvider>);
}

LocaleContext.priority = LOCALE_REACT_CONTEXT_PRIORITY;

@Context(LocaleContext)
export default class {}
