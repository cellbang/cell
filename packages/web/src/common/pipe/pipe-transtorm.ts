import { Component, Value } from '@malagu/core';
import { PipeTransform, ArgumentMetadata } from './pipe-protocol';
import { ValidationErrors } from './validation-errors';
import { validate } from 'class-validator';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Component(PipeTransform)
export class ValidationPipe implements PipeTransform<any> {

    @Value('malagu.web.validationPipeOptions')
    protected options: any;

    readonly priority = 1000;

    public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        const opts = this.options || {};
        const { argType } = metadata;
        if (!argType) {
            return value;
        }
        if (!this.toValidate(metadata)) {
            return plainToInstance(
                argType,
                value,
                opts.transformOptions,
            );
        }
        const originalValue = value;
        value = this.toEmptyIfNil(value);

        const isNil = value !== originalValue;
        const isPrimitive = this.isPrimitive(value);
        this.stripProtoKeys(value);
        let entity = plainToInstance(
            argType,
            value,
            opts.transformOptions,
        );

        const originalEntity = entity;
        const isCtorNotEqual = entity.constructor !== argType;

        if (isCtorNotEqual && !isPrimitive) {
            entity.constructor = argType;
        } else if (isCtorNotEqual) {
            // when "entity" is a primitive value, we have to temporarily
            // replace the entity to perform the validation against the original
            // metatype defined inside the handler
            entity = { constructor: argType } as any;
        }

        const errors = await validate(entity, opts.validatorOptions);
        if (errors.length > 0) {
            throw new ValidationErrors(opts.detailedOutputDisabled ? undefined : errors);
        }
        if (isPrimitive) {
            // if the value is a primitive value and the validation process has been successfully completed
            // we have to revert the original value passed through the pipe
            entity = originalEntity;
        }
        if (opts.transformEnabled) {
            return entity;
        }
        if (isNil) {
            // if the value was originally undefined or null, revert it back
            return originalValue;
        }
        return Object.keys(opts.validatorOptions).length > 0
            ? instanceToPlain(entity, opts.transformOptions)
            : value;
    }

    private toValidate(metadata: ArgumentMetadata): boolean {
        const { argType } = metadata;
        const types = [String, Boolean, Number, Array, Object];
        // eslint-disable-next-line no-null/no-null
        return argType !== null && !types.some(t => argType === t);
    }

    private toEmptyIfNil<T = any, R = any>(value: T): R | {} | undefined {
        // eslint-disable-next-line no-null/no-null
        return value === null ? {} : value;
    }

    private stripProtoKeys(value: Record<string, any>): void {
        delete value.__proto__;
        const keys = Object.keys(value);
        keys
            .filter(key => typeof value[key] === 'object' && value[key])
            .forEach(key => this.stripProtoKeys(value[key]));
    }

    private isPrimitive(value: unknown): boolean {
        return ['number', 'boolean', 'string'].indexOf(typeof value) !== -1;
    }
}
