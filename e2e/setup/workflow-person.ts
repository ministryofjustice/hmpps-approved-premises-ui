export type WorkflowPersonTier = 'A' | 'B' | 'C' | 'MISSING' | 'NOT_SUPERVISED'

export type WorkflowOasysTier = Extract<WorkflowPersonTier, 'A' | 'B' | 'C'>

export type WorkflowPersonDetails = {
  firstName: string
  lastName: string
  sex: string
  dob: Date
  pnc?: string
  ethnicity?: string
  croNumber?: string
}

export type WorkflowPerson = {
  crn: string
  name: string
  nomisId: string
  convictionDate: Date
  details: WorkflowPersonDetails
}
