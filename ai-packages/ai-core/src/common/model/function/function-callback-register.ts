import { Component } from '@celljs/core';
import { FunctionCallback, FunctionCallbackRegister, ToolContext } from './function-protocol';
import { NotFoundError } from '../../error';

@Component(FunctionCallbackRegister)
export class FunctionCallbackRegisterImpl implements FunctionCallbackRegister {

    private functionCallbacks: Map<string, FunctionCallback> = new Map<string, FunctionCallback>();

    register(functionCallback: FunctionCallback): void {
        this.functionCallbacks.set(functionCallback.name, functionCallback);
    }

    unregister(functionName: string): void {
        this.functionCallbacks.delete(functionName);
    }

    call(functionName: string, functionArguments: string, toolContext: ToolContext): Promise<string> {
        const functionCallback = this.functionCallbacks.get(functionName);
        if (functionCallback) {
            return functionCallback.call(functionArguments, toolContext);
        }
        throw new NotFoundError(`Function ${functionName} not found`);
    }

    resolve(functionNames: string[]): FunctionCallback[] {
        const functionCallbacks: FunctionCallback[] = [];
        new Set(functionNames).forEach(functionName => {
            const functionCallback = this.functionCallbacks.get(functionName);
            if (functionCallback) {
                functionCallbacks.push(functionCallback);
            } else {
                throw new NotFoundError(`No function callback found for name: ${functionName}`);
            }
        });
        return functionCallbacks;
    }
}
