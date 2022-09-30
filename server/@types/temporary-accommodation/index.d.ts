declare module 'temporary-accommodation' {
  export type Premises = schemas['Premises']
  export type NewPremises = schemas['NewPremises']

  export interface schemas {
    Premises: {
      id: string
      added_at: string
      county: string
      town: string
      type: string
      address: string
    }
    NewPremises: {
      county: string
      town: string
      type: string
      address: string
    }
  }
}
