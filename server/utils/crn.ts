export const isValidCrn = (crn: string) => {
  return Boolean(crn.match(/^[A-Za-z][0-9]{6}$/))
}
