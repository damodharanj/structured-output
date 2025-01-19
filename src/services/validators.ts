// services/validators.ts
import Ajv from 'ajv/dist/2020';
import { registerSchema, validate as hjValidate } from "@hyperjump/json-schema/draft-2020-12";

const ajv = new Ajv({ allErrors: true, strictSchema: false, dynamicRef: true });

export async function validateWithAjv(schema: any, data: any) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  
  console.log(valid, validate.errors)
  return {
    valid,
    errors: validate.errors?.map(err => ({instancePath: err.schemaPath, message: err.message}))
  };
}

export async function validateWithHyperjump(schema: any, data: any) {
  const schemaName = 'http://temp.schema/' + Math.random();
  await registerSchema(schema, schemaName);
  
  const result = await hjValidate(schemaName, data, "BASIC");
  
  return {
    valid: result.valid,
    errors: result.errors?.map(err => ({instancePath: err.instanceLocation, message: err.keyword}))
  };
}