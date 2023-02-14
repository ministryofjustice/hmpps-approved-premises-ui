# 7. Manipulate data for views in util files

Date: 2023-02-14

## Status

Accepted

## Context

- Nunjucks is limited as to how much manipulation it allows and therefore some kinds of manipulation can only happen in Node
- Further, manipulation in Nunjucks is only testable with integration tests (with our current test setup) which are slow to run
- There isn't a clear precedent in HMPPS as to where such manipulation should happen

## Decision

We initially did such manipulation in the services but as the app has evolved we now believe that manipulation of data for views that isn't possible in Nunjucks should happen in individual utils which are imported into the Nunjucks templates. These utils should be imported on a file-by-file (as opposed to function-by-function) basis as global into the `nunjucksSetup.ts` file

## Consequences

- Our view code will be cleanly separated from the application code
- Our nunjucksSetup file will have to import and export a lot of util files
- The amount of utils files we have will grow at a faster rate
- Each util function lives separate to the data that it requires, meaning that it is simpler to test at the unit test level
- As the utils are imported as whole files without specifying individual functions there is little boilerplate involved in using the utils in the views. For example if we were to import functions on a function-by-function basis we would have to a have the following for each function we import:

```typescript
import { someFunction } from "./someUtilsFile"

...

njkEnv.addGlobal('someFunction', someFunction)
```

Whereas when functions are import on a file-by-file basis we only need to add the above for each file which could contain many util functions

## Examples

### Previous

```typescript
Service:
class MyService {
...
  tableRow(token){
    const client = this.clientFactory(token)
    const apiData = await client.all()

    return apiData.sort((a, b) => a.name.localeCompare(b.name))
      .map((i: SomeThing) => {
        return [
          this.textValue(i.name),
          this.textValue(i.code),
          this.textValue(i.count.toString()),
          this.htmlValue(
            `<a href="${paths.show({ id: p.id })}">View<span class="govuk-visually-hidden">about ${
              i.name
            }</span></a>`,
          ),
        ]
      })
  }
...
}

Controller:
class MyController {
...
  index(): RequestHandler {
      return async (req: Request, res: Response) => {
        const tableRows = await this.myService.tableRows(req.user.token)
        return res.render('/index', { tableRows })
      }
    }
...
}
```

View:

```njk
{{
      govukTable({
        captionClasses: "govuk-table__caption--m",
        firstCellIsHeader: true,
        head: [
          {
            text: "Name"
          },
          {
            text: "Code"
          },
          {
            text: "Count"
          },
          {
            html: '<span class="govuk-visually-hidden">Actions</span>'
          }
        ],
        rows: tableRows
      })
    }}

```

### Proposed

Service:

```typescript
class MyService {
...

  getAll(token){
    const client = this.clientFactory(token)
    const apiData = await client.all()

    return apiData
  }
...
}
```

Util file:

```typescript
function tableRows(apiData) {
  apiData
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((i: SomeThing) => {
      return [
        this.textValue(i.name),
        this.textValue(i.code),
        this.textValue(i.count.toString()),
        this.htmlValue(
          `<a href="${paths.show({ id: p.id })}">View<span class="govuk-visually-hidden">about ${i.name}</span></a>`,
        ),
      ]
    })
}
```

View:

```njk
{{
      govukTable({
        captionClasses: "govuk-table__caption--m",
        firstCellIsHeader: true,
        head: [
          {
            text: "Name"
          },
          {
            text: "Code"
          },
          {
            text: "Count"
          },
          {
            html: '<span class="govuk-visually-hidden">Actions</span>'
          }
        ],
        rows: Utils.tableRows()
      })
    }}

```
