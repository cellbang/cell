import { UserManager } from './user-protocol';
import { Autowired, Component, Value, PostConstruct } from '@malagu/core';
import { RestOperations, HttpMethod, PathResolver, HttpStatus } from '@malagu/web';
import { Method } from 'axios';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../common';

@Component(UserManager)
export class UserManagerImpl implements UserManager {

    protected readonly loginUserInfoStorageKey = 'malagu:loginUserInfo';

    @Value('malagu.security.loginPage')
    protected readonly loginPage: string;

    @Value('malagu.security.openNewWindow')
    protected readonly openNewWindow: boolean;

    @Value('malagu.security.logoutUrl')
    protected readonly logoutUrl: string;

    @Value('malagu.security.logoutSuccessUrl')
    protected readonly logoutSuccessUrl: string;

    @Value('malagu.security.logoutMethod')
    protected readonly logoutMethod: HttpMethod;

    @Value('malagu.security.userInfoEndpoint')
    protected readonly userInfoEndpoint: any;

    @Value('malagu.security.loginRequired')
    protected readonly loginRequired: boolean;

    @Autowired(RestOperations)
    protected restOperations: RestOperations;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    userInfoSubject: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);

    @PostConstruct()
    protected async init() {

        this.restOperations.interceptors.response.use(response => response, error => {
            if (error.response) {
                if (error.response.status === HttpStatus.UNAUTHORIZED) {
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
            if (!await this.getUesrInfo()) {
                if (this.loginRequired) {
                    this.openLoginPage();
                }
            }
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

    async getUesrInfo(): Promise<User | undefined> {
        const { url, method } = this.userInfoEndpoint;
        const { data } = await this.restOperations.request({ url: await this.pathResolver.resolve(url), method });
        this.userInfoSubject.next(data);
        return data;
    }

}
