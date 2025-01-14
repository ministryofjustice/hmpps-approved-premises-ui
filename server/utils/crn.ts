export const isValidCrn = (crn: string) => {
  return Boolean(crn.match(/^[A-Z][0-9]{6}$/))
}
