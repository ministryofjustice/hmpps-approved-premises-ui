# Form Pages

Approved Premises has two large multi-step forms. These are expressed as multiple classes within the `./server/form-pages`
directory. Each form is broken up into Sections, Steps and Pages.

Each section is then added into the form's index.ts, exporting an object that is decorated with a `@Form`
decorator.

For ease of maintenance, and to ensure we can make changes to the form without huge changes to the
underlying data model in the API, responses within the form are sent to the API and stored as a JSON blob.

It's important that we make sure that the JSON we send to the API matches a schema, otherwise, we could end
up with all manner of unexpected consequences. With this in mind, each form has a schema definiton, which
is generated via a script:

```bash
npm run generate:schema:apply
```

Or

```bash
npm run generate:schema:assess
```

This generates a schema in JSON schema format, with the names of the steps keyed as properties, and
schemas generated from each page's body type within that property, e.g:

```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "type": "object",
  "title": "Apply Schema",
  "required": [
    "basic-information"
  ],
  "properties": {
    "basic-information": { // Task
      "type": "object",
      "properties": {
        "sentence-type": { // Page
          "type": "object",
          "properties": {  // Page Body
            "sentenceType": {
              "enum": [
                "bailPlacement",
                "communityOrder",
                "extendedDeterminate",
                "ipp",
                "life",
                "nonStatutory",
                "standardDeterminate"
              ],
              "type": "string"
            }
          }
        },
        ...
      }
    }
  }
}
```

This schema is then stored within the API database, and any submissions are checked against that schema.

Because we assume that any validation is done on the client side, we only check here for the basic
shape of the data, and throw a 400 error if the schema does not validate.

If a change occurs to the form, or any page within it, it's important to regenerate the schema
and ensure the new schema is added to the API before deploying any changes.
