import { Test } from '@malagu/testing';
import * as request from 'supertest';

describe('HomeController (e2e)', function () {
    let server: string;

    before(async function () {
        this.timeout(20000);
        server = await Test.createHttpServer();
    });

    it('/ (GET)', () => request(server)
        .get('/')
        .expect(200)
        .expect('Welcome to Malagu'));
});
