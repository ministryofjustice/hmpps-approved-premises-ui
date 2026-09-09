export type WorkflowPersonTier = 'A' | 'B' | 'C' | 'D' | 'MISSING' | 'NOT_SUPERVISED'
export type WorkflowPersonGender = 'Male' | 'Female'

export type WorkflowOasysTier = Extract<WorkflowPersonTier, 'A' | 'B' | 'C' | 'D'>

export type WorkflowPersonDetails = {
  firstName: string
  lastName: string
  gender: string
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
