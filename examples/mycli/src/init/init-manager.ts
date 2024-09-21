import { resolve } from 'path';
import { existsSync, copy } from 'fs-extra';
import { prompts } from 'prompts';
import { templates } from './templates';
import { Component, Autowired } from '@celljs/core';
import { CONTEXT } from '../constants';
import * as chalk from 'chalk';

const PLACEHOLD = '{{ templatePath }}';

export interface Template {
    name: string;
    location: string;
}

@Component()
export class InitManager {

    protected name: string;
    protected location: string;

    @Autowired(CONTEXT)
    protected context: any;

    async output(): Promise<void> {
        await this.selectTemplate();
        await this.checkOutputDir();
        await this.doOutput();
    }

    protected get outputDir(): string {
        return resolve(process.cwd(), this.context.outputDir, this.context.name);
    }

    protected async checkOutputDir() {
        if (existsSync(this.outputDir)) {
            await prompts.confirm({
                name: 'overwrite',
                type: 'confirm',
                message: 'Project already exists, overwrite the project',
                onState: ({ value }) => {
                    if (value !== true) {
                        process.exit(-1);
                    }
                }
            });
            
        }
    }

    protected toTemplateMap(name: string, location: string) {
        return { title: name, value: { location, name} };
    }

    protected async selectTemplate(): Promise<void> {
        const templateMap = Object.keys(templates).map(key => this.toTemplateMap(key, templates[key]));
        let answers;
        if (templateMap.length == 1) {
            answers = { item: templateMap[0].value };
        } else {
            answers = await prompts.autocomplete({
                name: 'item',
                type: 'autocomplete',
                message: 'Select a template to init',
                choices: templateMap,
                suggest: async input => {
                    return templateMap.filter(item => !input || item.title.toLowerCase().includes(input.toLowerCase()));
                }
            });
        }
        
        this.name = answers.name;
        this.context.name = this.context.name || answers.name;
        this.location = answers.location;
    }

    protected get realLocation() {
        return this.location.replace(PLACEHOLD, resolve(__dirname, '..', '..', 'templates'));
    }

    protected async doOutput() {
        await copy(this.realLocation, this.outputDir);
        console.log(chalk`{bold.green Success!}`);
    }
}
