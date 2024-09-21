import * as React from 'react';
import { Menu, MenuProps, ButtonType, Text } from 'grommet';
import { ContainerUtil } from '@celljs/core';
import { LocaleManager, Locale } from '@celljs/widget';
import { useIntl, IntlShape } from 'react-intl';
import { Down } from 'grommet-icons';

function parseLabel(intl: IntlShape, locale?: Locale) {
    if (locale) {
        return locale.label ? intl.formatMessage({ id: locale.label }) : intl.formatDisplayName(locale.lang, { type: 'language' } );
    }
}

export function LocaleMenu(props: Omit<MenuProps, 'items'> & Omit<ButtonType, 'icon'> & { fontSize?: 'small' | 'medium' | 'large' | 'xlarge' | string; }) {
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
        <Menu size="medium" hoverIndicator icon={<Down size={props.fontSize}/>} {...props} label={<Text size={props.fontSize}>{parseLabel(intl, current)}</Text>}
            items={locales.map(l => ({ label: <Text size={props.fontSize}>{parseLabel(intl, l)}</Text>, onClick: () => localeManager.currentSubject.next(l) }))}
        />
    );
}
