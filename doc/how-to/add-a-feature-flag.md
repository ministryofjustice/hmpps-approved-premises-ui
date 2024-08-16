# Feature flags

Feature flags are managed using environment variables.
There is not currently a way of changing flag values without a deployment.
Formerly we used [Flipt](https://www.flipt.io).

## Adding a feature flag

### Step 0: Are you sure you need a feature flag?

Consider if a feature flag is necessary for the feature. If it's a small feature, like
a copy change, or some other small quality of life change, then you probably don't need a
feature flag. If it's a large feature that requires multiple PRs and is likely to need
communicating to users, then a feature flag _might_ be the way to go. It is still worth
considering other alternative routes before going down this one though.

### Step 1: Add a new flag to the local .env file

Test that it work as expected.

### Step 2: Add the flag to deployed environments

Configure the values in the {env}-values.yml files

### Step 3: Add the flag to the .env.example file

With the suggested value for local development (this will usually be the same as the value in dev-values.yml).
