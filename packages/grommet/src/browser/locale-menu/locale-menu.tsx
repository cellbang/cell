import * as React from 'react';
import { Menu, MenuProps, ButtonType } from 'grommet';
import { ContainerUtil } from '@malagu/core';
import { LocaleManager, Locale } from '@malagu/widget';
import { useIntl, IntlShape } from 'react-intl';
import { Down } from 'grommet-icons';

function parseLabel(locale: Locale, intl: IntlShape) {
    return locale.label && intl.formatMessage({ id: locale.label }) || intl.formatDisplayName(locale.lang);
}

export function LocaleMenu(props: MenuProps & Omit<ButtonType, 'icon'>) {
    const intl = useIntl();
    const localeManager = ContainerUtil.get<LocaleManager>(LocaleManager);
    const [locales, setLocales] = React.useState<Locale[]>([]);
    const [current, setCurrent] = React.useState<Locale | undefined>(localeManager.currentSubject.value);
    React.useEffect(() => {
        localeManager.get().then(ls => setLocales(ls));
        const subscription = localeManager.currentSubject.subscribe(t => setCurrent(t));
        return () => subscription.unsubscribe();
    }, []);
    return (
        <Menu size="medium" hoverIndicator icon={<Down/>} {...props} label={parseLabel(current!, intl)}
            items={locales.map(l => ({ label: parseLabel(l, intl), onClick: () => localeManager.currentSubject.next(l) }))}
        />
    );
}
