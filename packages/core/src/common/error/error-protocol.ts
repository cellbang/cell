import { CustomError } from './cutom-error';
import { Newable, Abstract } from '../utils';

export type ErrorType = Newable<CustomError> | Abstract<CustomError>;
