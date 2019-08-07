export interface ApplicationProps {

    // tslint:disable-next-line:no-any
    readonly [key: string]: any;

    mode?: string;

    /**
     * Frontend related properties.
     */
    readonly frontend: FrontendApplicationConfig;

    /**
     * Backend specific properties.
     */
    readonly backend: BackendApplicationConfig;
}
export namespace ApplicationProps {

    export const DEFAULT: ApplicationProps = {
        backend: {
        },
        frontend: {
            applicationName: 'Malagu'
        }
    };

}

/**
 * Base configuration for the Malagu application.
 */
export interface ApplicationConfig {
    // tslint:disable-next-line:no-any
    readonly [key: string]: any;

    entry?: string;
}

export interface FrontendApplicationConfig extends ApplicationConfig {

    /**
     * The name of the application. `Malagu` by default.
     */
    readonly applicationName: string;

}

export interface BackendApplicationConfig extends ApplicationConfig {

}
