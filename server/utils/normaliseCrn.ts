export const normaliseCrn = (crn: string | undefined) => (crn ? crn.toUpperCase().trim() : undefined)
