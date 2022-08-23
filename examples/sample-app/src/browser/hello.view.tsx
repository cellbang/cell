import * as React from 'react';
import { RpcUtil } from '@malagu/rpc/lib/common';
import { WelcomeServer } from '../common/welcome-protocol';
import { View } from '@malagu/react';
import styles from './style/hello.module.scss';

const Hello = () => {
    const [ response, setResponse ] = React.useState('Loading');
    React.useEffect(() => {
        const welcomeServer = RpcUtil.get<WelcomeServer>(WelcomeServer);
        const init = async () => {
            setResponse(await welcomeServer.say());
        }
        init();
    }, []);

    return <div className={ styles.hello }>
            <img alt="malagu logo" src="./assets/logo.png"></img>
            <div className="hello">
                <h1>{response}</h1>
                <p>
                    For a guide and recipes on how to configure / customize this project,<br />
                check out the <a href="https://malagu.cellbang.com/" target="_blank" rel="noopener">malagu documentation</a>.
                </p>
            </div>
        </div>

}

@View({ index: true,  component: Hello })
export default class {}
