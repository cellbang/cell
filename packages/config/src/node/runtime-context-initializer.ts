import { Component, ContextInitializer, ExpressionContext } from '@malagu/core';
import { ConfigUtil } from './config-util';
import { existsSync, readFileSync } from 'fs';
import { load } from 'js-yaml';
import { resolve } from 'path';

@Component(ContextInitializer)
export class RuntimeContextInitializer implements ContextInitializer {

    protected doInitializeForEnv(ctx: ExpressionContext) {
        if (process.env.MALAGU_PROPS_FILE) {
            const propsFile = resolve(process.cwd(), process.env.MALAGU_PROPS_FILE);
            if (existsSync(propsFile)) {
                const props = load(readFileSync(propsFile, 'utf-8'));
                ConfigUtil.merge(ctx, props);

            }
        }

    }

    protected doInitializeForDefault(ctx: ExpressionContext) {
        const propsFiles = [];
        propsFiles.push(resolve(process.cwd(), 'malagu.yml'));
        propsFiles.push(resolve(process.cwd(), 'malagu.yaml'));
        if (process.cwd() !== __dirname) {
            propsFiles.push(resolve(__dirname, 'malagu.yml'));
            propsFiles.push(resolve(__dirname, 'malagu.yaml'));
        }

        for (const propsFile of propsFiles) {
            if (existsSync(propsFile)) {
                const props = load(readFileSync(propsFile, 'utf-8'));
                ConfigUtil.merge(ctx, props);
            }
        }
    }

    initialize(ctx: ExpressionContext): void {
        this.doInitializeForEnv(ctx);
        this.doInitializeForDefault(ctx);
    }

    priority = 500;

}
