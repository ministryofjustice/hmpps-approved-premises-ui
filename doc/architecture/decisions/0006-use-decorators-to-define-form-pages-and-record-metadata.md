# 6. Use Decorators to Define Form Pages and Record Metadata

Date: 2022-11-28

## Status

Accepted

## Context

Now we have almost finished the Apply screens, we need to generate a schema for the data that gets
sent to the API. At the moment, we have a very simple schema that accepts all JSON-shaped content,
but going forward, we need to be much stricter. We should use the page classes to inform this schema
shape, rather than manually, so we can:

- Quickly generate a new schema to add to the API
- Complain loudly and obviously if any form changes cause a schema change, so we can update the API

To build this schema information, we need to know what fields each form page has. This is currently
set up like so:

```typescript
class MyFormPage {
...

  body: {
    name: string
    address: string
  }
...
}
```

The way the form classes are set up make it hard to keep a record of what page has what fields, as
the `body` definition is typing information, which gets thrown away after the code gets compiled
into Javascript, so we need to find a way of keeping a record of this information, so we can generate
a schema.

## Decision

We will refactor the classes to use [Typescript Class Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
, as well as adding classes for each Form, Section, and Task.

A page decorator will be added to each Page class like so:

```typescript
@Page({
  name: 'my-form-page',
  bodyProperties: ['name', 'address'],
})
class MyFormPage {
...
```

This sets up the information that will be common to each page, and the `bodyProperties` will record what
fields the page has. We will then be able to use the [`reflect-metadata`](https://www.npmjs.com/package/reflect-metadata)
package to record this information at build time, for us to fetch it during runtime. For example, in
our example above, we can get the information about this page like so:

```typescript
Reflect.getMetadata('page:name', SimpleClass) // Name
Reflect.getMetadata('page:bodyProperties', SimpleClass) // ['name', 'address']
```

The rest of the implementation of the class (the next/previous/errors methods etc) are included in the
class itself.

We can then have a Task class that has a decorator which records metadata about what pages it contains:

```typescript
@Task({ name: 'my-task', title: 'My Task', pages: [MyFormPage] })
class MyTask {}
```

And a Section class which contains the tasks:

```typescript
@Section({ name: 'my-section', title: 'My Section', tasks: [MyTask] })
class MySection {}
```

And a Form class that contains the tasks:

```typescript
@Form({ name: 'Apply', sections: [MySection] })
class Apply {}
```

We can then fetch the metadata about the form and bubble down into the sections, tasks and pages
and generate a schema.

## Consequences

This will require a degree of unpicking to get this all to fit together and refactoring the pages,
however, this will save us time in the long run and prevent the frontend schemas from going out
of sync with the API.

Decorators and metadata are a fairly new and experimental technology in Typescript, and the
implementation is subject to change. However, they are fairly mature and stable now, and
used heavily in frameworks such as React / Angular on the frontend, and Nest.js on the backend,
so the likelihood of the implementation changing dramatically is fairly low. However, in the
unlikely event of this happening, the test suite will alert us to any breaking changes when
Renovate bumps the version of Typescript we are using.

With this approach, we also lose type information about the body fields, however, this is
low-risk as the fields come from a HTTP request, so could potentially be anything. If there
is anything we need to do with the fields that require strong typing, we can cast the fields
as a given type in the code itself.
