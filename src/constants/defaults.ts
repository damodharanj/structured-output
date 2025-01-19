export const DEFAULT_PROMPT = `what is 2 + 2`;

export const DEFAULT_JSON_SCHEMA = `
{
  "type": "object",
  "properties": {
    "steps": {
      "type": "array",
      "description": "A sequence of steps involved in the process.",
      "items": {
        "type": "object",
        "properties": {
          "description": {
            "type": "string",
            "description": "A description of the specific step."
          },
          "result": {
            "type": "string",
            "description": "The outcome of this specific step."
          }
        },
        "required": [
          "description",
          "result"
        ],
        "additionalProperties": false
      }
    },
    "final_result": {
      "type": "string",
      "description": "The final outcome or result of all the steps."
    }
  },
  "required": [
    "steps",
    "final_result"
  ],
  "additionalProperties": false
}`;

export const EXAMPLE_PROMPTS = {
  normal: [
    "Explain how promises work in JavaScript",
    "What are the SOLID principles?",
    "Compare different state management solutions in React"
  ],
  structured: [
    "Create a TypeScript interface for a blog post",
    "Design a REST API for a todo app",
    "Write a function to validate email addresses"
  ]
};