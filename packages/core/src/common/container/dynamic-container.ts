import { Container } from 'inversify';

// dynamic loading component module at compile time
export const container: Promise<Container> = Promise.resolve(new Container());
