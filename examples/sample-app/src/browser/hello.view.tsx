import * as React from 'react';
import { Autorpc } from '@malagu/rpc/lib/common/annotation/detached';
import { WelcomeServer } from '../common/welcome-protocol';
import { View } from '@malagu/react';
import styles from './style/hello.module.scss';

interface Prop { }
interface State {
    response: string
}
@View()
export class Hello extends React.Component<Prop, State> {

    @Autorpc(WelcomeServer)
    protected welcomeServer!: WelcomeServer;

    constructor(prop: Prop) {
        super(prop);
        this.state = { response: 'Loading' };
    }

    async componentDidMount() {
        const response = await this.welcomeServer.say();
        this.setState({
            response
        });
    }

    render() {
        return <div className={ styles.hello }>
            <img alt="malagu logo" src="./assets/logo.png"></img>
            <div className="hello">
                <h1>{this.state.response}</h1>
                <p>
                    For a guide and recipes on how to configure / customize this project,<br />
                check out the <a href="https://malagu.cellbang.com/" target="_blank" rel="noopener">malagu documentation</a>.
                </p>
            </div>
        </div>
    }
}
