import { coreTestModule } from '@celljs/core/lib/common/test/test-module';
import httpModule from '@celljs/http/lib/common/module';
import aiCoreModlue from '@celljs/ai-core/lib/common/module';
import { autoBind, ContainerFactory, ContainerProvider } from '@celljs/core';
import '../index';

const openAITestModule = autoBind();

export const createContainer = () => {
    const container = ContainerFactory.create(coreTestModule, httpModule, aiCoreModlue, openAITestModule);
    ContainerProvider.set(container);
    return container;
};
