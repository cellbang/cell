import { CustomError } from './custom-error';
import { Newable, Abstract } from '../utils';

export type ErrorType = Newable<CustomError> | Abstract<CustomError>;
