import * as React from 'react';
import { RpcUtil } from '@celljs/rpc/lib/common';
import { WelcomeServer } from '../common/welcome-protocol';
import { View } from '@celljs/react';
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
            <img alt="cell logo" src="./assets/logo.png"></img>
            <div className="hello">
                <h1>{response}</h1>
                <p>
                    For a guide and recipes on how to configure / customize this project,<br />
                check out the <a href="https://cell.cellbang.com/" target="_blank" rel="noopener">cell documentation</a>.
                </p>
            </div>
        </div>

}

@View({ index: true,  component: Hello })
export default class {}
