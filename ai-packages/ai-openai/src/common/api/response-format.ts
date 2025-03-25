export enum ResponseFormatType {
    TEXT = 'text',
    JSON_OBJECT = 'json_object',
    JSON_SCHEMA = 'json_schema'
}

export class JsonSchema {
    name: string;
    schema: Map<string, any>;
    strict: boolean;
    constructor(name: string, schema: Map<string, any>, strict: boolean) {
        this.name = name;
        this.schema = schema;
        this.strict = strict;
    }

    static builder() {
        return new JsonSchemaBuilder();
    }
}

export class JsonSchemaBuilder {
    private name: string;
    private schema: Map<string, any>;
    private strict: boolean;

    withName(name: string) {
        this.name = name;
        return this;
    }

    withSchema(schema: Map<string, any>) {
        this.schema = schema;
        return this;
    }

    withStrict(strict: boolean) {
        this.strict = strict;
        return this;
    }

    build() {
        return new JsonSchema(this.name, this.schema, this.strict);
    }
}

/**
 * An object specifying the format that the model must output.
 *
 * Setting the type to JSON_SCHEMA, enables Structured Outputs which ensures the model
 * will match your supplied JSON schema. Learn more in the
 * [Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs).
 *
 * References: [OpenAi API - ResponseFormat](https://platform.openai.com/docs/api-reference/chat/create#chat-create-response_format),
 * [JSON Mode](https://platform.openai.com/docs/guides/structured-outputs#json-mode),
 * [Structured Outputs vs JSON mode](https://platform.openai.com/docs/guides/structured-outputs#structured-outputs-vs-json-mode)
 */
export class ResponseFormat {
    /**
     * Type Must be one of 'text', 'json_object' or 'json_schema'.
     */
    type: ResponseFormatType;

    /**
     * JSON schema object that describes the format of the JSON object. Only applicable
     * when type is 'json_schema'.
     */
    schema?: JsonSchema;

    /**
     * Whether the model must strictly adhere to the schema. Only applicable when type is
     * 'json_schema'.
     */
    strict?: boolean;

    constructor(type: ResponseFormatType, schema?: JsonSchema, strict?: boolean) {
        this.type = type;
        this.schema = schema;
        this.strict = strict;
    }

    static builder() {
        return new ResponseFormatBuilder();
    }
}

export class ResponseFormatBuilder {
    private type: ResponseFormatType;
    private schema?: JsonSchema;
    private strict?: boolean;

    withType(type: ResponseFormatType) {
        this.type = type;
        return this;
    }

    withSchema(schema: JsonSchema) {
        this.schema = schema;
        return this;
    }

    withStrict(strict: boolean) {
        this.strict = strict;
        return this;
    }
    build() {
        return new ResponseFormat(this.type, this.schema, this.strict);
    }
}
