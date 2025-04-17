import { Test } from '@celljs/testing';
import { Container } from  '@celljs/core'
import { AppService } from '../src/app.service';
import { expect } from 'chai';

describe('AppService (e2e)', function () {
    let container: Container;

    before(async function () {
        this.timeout(20000);
        container = await Test.createContainer();
    }); 

    it('getHello', () => {
        const appService = container.get(AppService);
        expect(appService.getHello()).to.equal('Hello World!');
    });
});
