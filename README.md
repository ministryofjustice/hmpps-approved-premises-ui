# Approved Premises

Apply for and manage approved premises

## Prerequisites

- Docker
- NodeJS (version specified in .node-version file)

## Setup

When running the application for the first time, run the following command:

```bash
script/setup
```

This will tear down and setup the application, create .env files and bootstrap the application.

If you're coming back to the application after a certain amount of time, you can run:

```bash
script/bootstrap
```

## Running the application

### Using AP Tools

In order to spin up a full stack of a working API and other [dependent services](./docker-compose.yml) we recommend using [AP Tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools).

NB. The approach AP Tools takes solves a critical limitation for working in
development. Due to how the frontend and API authenticate requests they both
require access to _the same_ instance of hmpps-auth. This project is the focus
of our development tooling across all CAS services and is most likely to receive
future updates.

After following the set up the common commands are:

```bash
ap-tools server start --local-ui --local-api
```

```bash
ap-tools server stop
```

The service should then be available at <http://localhost:3000>

[Log in credentials are documented within AP
tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools#start-server).

## Release process

Our release process aligns with the other CAS teams and as such [lives in
Confluence](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/4247847062/Release+process).
The steps are also available in the
[PULL_REQUEST_TEMPLATE](/.github/PULL_REQUEST_TEMPLATE.md#release-checklist).

## Manage infrastructure & view logs

This application is hosted on the MoJ Cloud Platform. For further details
head over to [our infrastructure documentation](/doc/how-to/manage-infrastructure.md).

## E2E tests

Install Playwright

```bash
npm install
npx playwright install
```

Test with and without UI

```bash
npm run test:e2e:ui
# or
npm run test:e2e:ci
```

### Suggest environment variable values:

#### Local testing

E2E_DELIUS_USERNAME_TO_ADD_AND_DELETE=BERNARD.BEAKS

### CI testing

E2E_DELIUS_USERNAME_TO_ADD_AND_DELETE=JOSEPHHOLLINSHEAD

## Feature flags

We use [Flipt](http://flipt.io) for feature flags. See https://github.com/ministryofjustice/hmpps-approved-premises-ui/blob/main/doc/how-to/add-a-feature-flag.md
for more details
