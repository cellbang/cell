import { UserManager } from './user-protocol';
import { Autowired, Component, Value, PostConstruct } from '@celljs/core';
import { RestOperations, HttpMethod, HttpStatus, HttpHeaders } from '@celljs/http';
import { PathResolver } from '@celljs/web';
import { Method } from 'axios';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../common';

@Component(UserManager)
export class UserManagerImpl implements UserManager {

    protected readonly loginUserInfoStorageKey = 'cell:loginUserInfo';

    @Value('cell.security.loginPage')
    protected readonly loginPage: string;

    @Value('cell.security.openNewWindow')
    protected readonly openNewWindow: boolean;

    @Value('cell.security.logoutUrl')
    protected readonly logoutUrl: string;

    @Value('cell.security.logoutSuccessUrl')
    protected readonly logoutSuccessUrl: string;

    @Value('cell.security.logoutMethod')
    protected readonly logoutMethod: HttpMethod;

    @Value('cell.security.userInfoEndpoint')
    protected readonly userInfoEndpoint: any;

    @Value('cell.security.loginRequired')
    protected readonly loginRequired: boolean;

    @Autowired(RestOperations)
    protected restOperations: RestOperations;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    userInfoSubject: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);

    @PostConstruct()
    protected init() {

        this.restOperations.interceptors.response.use(response => response, error => {
            if (error.response) {
                if (error.response.status === HttpStatus.UNAUTHORIZED && !error.response.headers[HttpHeaders.WWW_AUTHENTICATE.toLowerCase()]) {
                    this.openLoginPage();
                    return;
                }
            }
            return Promise.reject(error);
        });

        this.userInfoSubject.subscribe(user => {
            if (user) {
                localStorage.setItem(this.loginUserInfoStorageKey, JSON.stringify(user));
            } else {
                localStorage.removeItem(this.loginUserInfoStorageKey);
            }
        });

        const userStr = localStorage.getItem(this.loginUserInfoStorageKey);
        if (userStr) {
            this.userInfoSubject.next(JSON.parse(userStr));
        } else {
            this.getUserInfo().then(() => {
                if (this.loginRequired) {
                    this.openLoginPage();
                }
            });
        }
    }

    async openLoginPage(newWindow?: boolean): Promise<void> {
        if (newWindow === undefined) {
            newWindow = this.openNewWindow;
        }
        this.userInfoSubject.next(undefined);
        const url = await this.pathResolver.resolve(this.loginPage.replace(/{redirect}/g, encodeURI(window.location.href)));
        if (newWindow) {
            window.open(url);
        } else {
            window.location.href = url;
        }
    }

    async logout(): Promise<void> {
        this.userInfoSubject.next(undefined);
        const method = (this.logoutMethod || HttpMethod.POST) as Method;
        await this.restOperations.request({ url: this.logoutUrl, method });
        window.location.href = await this.pathResolver.resolve(this.logoutSuccessUrl.replace(/{redirect}/g, encodeURI(window.location.href)));
    }

    async getUserInfo(): Promise<User | undefined> {
        const { url, method } = this.userInfoEndpoint;
        const { data } = await this.restOperations.request({ url: await this.pathResolver.resolve(url), method });
        this.userInfoSubject.next(data);
        return data;
    }

}
