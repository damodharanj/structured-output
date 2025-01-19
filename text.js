import Ajv from "ajv/dist/2020.js";
const ajv = new Ajv({
  strict: true,
  strictRequired: true,
})

const schema = {
  "$defs": {
    "key": {                    // Changed from "key1"
      "$dynamicAnchor": "TKey",
      "type": "number"
    },
    "value": {                  // Changed from "value1"
      "$dynamicAnchor": "TValue",
      "type": "number"
    }
  },
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "key": { "$dynamicRef": "#TKey" },
      "value": { "$dynamicRef": "#TValue" }
    },
    "required": ["key", "value"]
  }
}

const validate = ajv.compile(schema)

// Test the specific case
const testData = [{"key": 5, "value": 10}]
console.log("Is valid:", validate(testData))
console.log("Validation errors:", JSON.stringify(validate.errors, null, 2))