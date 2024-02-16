export type TestOptions = {
  person: {
    crn: string
    name: string
  }
  user: {
    name: string
    username: string
    password: string
  }
  indexOffenceRequired: boolean
  oasysSections: Array<string>
}
