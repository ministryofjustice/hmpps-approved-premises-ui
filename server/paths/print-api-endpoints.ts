import routes from './api';

function recurse(paths: { [p: string]: unknown } | ArrayLike<unknown>) {
  for (const value of Object.values(paths)) {
    if (value.pattern === undefined) {
      recurse(value)
    } else {
      console.log(value.pattern)
    }
  }
}

recurse({ routes })


