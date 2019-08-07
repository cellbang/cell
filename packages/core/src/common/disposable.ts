import { Disposable } from 'vscode-jsonrpc/lib/events';

export {
    Disposable
};

export class DisposableCollection implements Disposable {
    protected readonly disposables: Disposable[] = [];

    constructor(...toDispose: Disposable[]) {
        toDispose.forEach(d => this.push(d));
    }

    dispose(): void {
        while (this.disposables.length !== 0) {
            this.disposables.pop()!.dispose();
        }
    }

    get disposed(): boolean {
        return this.disposables.length === 0;
    }

    push(disposable: Disposable): Disposable {
        const disposables = this.disposables;
        disposables.push(disposable);
        return {
            dispose(): void {
                const index = disposables.indexOf(disposable);
                if (index !== -1) {
                    disposables.splice(index, 1);
                }
            }
        };
    }

}
