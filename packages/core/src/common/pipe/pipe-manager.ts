import { Component, Autowired } from '../annotation';
import { PipeManager, PipeProvider, MethodMetadata } from './pipe-protocol';
import { getTarget } from '../utils';

@Component(PipeManager)
export class PipeManagerImpl implements PipeManager {

    @Autowired(PipeProvider)
    protected readonly pipeProvider: PipeProvider;

    async apply(metadata: MethodMetadata, args: any[]): Promise<void> {
        const paramTypes = Reflect.getMetadata('design:paramtypes', getTarget(metadata.target), metadata.method);
        if (paramTypes) {
            for (let index = 0; index < args.length; index++) {
                let arg = args[index];
                for (const pipe of this.pipeProvider.provide()) {
                    arg = await pipe.transform(arg, { argType: index < paramTypes.length ? paramTypes[index] : undefined });
                }
                args[index] = arg;
            }
        }
    }

}
