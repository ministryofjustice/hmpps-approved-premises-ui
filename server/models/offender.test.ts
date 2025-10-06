import { OffenderDto, OffenderFullDto, OffenderNotFoundDto } from '../@types/shared'
import Offender from './offender'

describe('Offender', () => {
  describe('Full', () => {
    let offender: Offender
    let offenderDto: OffenderFullDto

    beforeEach(() => {
      offenderDto = {
        forename: 'Jane',
        surname: 'Smith',
        middleNames: ['Margaret'],
        crn: 'CRN123',
        objectType: 'Full',
      }

      offender = new Offender(offenderDto)
    })

    it('is not limited', () => {
      expect(offender.isLimited).toBe(false)
    })

    it('has crn matching OffenderDto', () => {
      expect(offender.crn).toBe(offenderDto.crn)
    })

    it('has name including forename and surname', () => {
      expect(offender.name).toBe('Jane Smith')
    })
  })

  describe('Limited', () => {
    let offender: Offender
    let offenderDto: OffenderDto

    beforeEach(() => {
      offenderDto = {
        crn: 'CRN123',
        objectType: 'Limited',
      }

      offender = new Offender(offenderDto)
    })

    it('is limited', () => {
      expect(offender.isLimited).toBe(true)
    })

    it('has crn matching OffenderDto', () => {
      expect(offender.crn).toBe(offenderDto.crn)
    })

    it('has empty name', () => {
      expect(offender.name).toBe('')
    })
  })

  describe('Not_Found', () => {
    let offender: Offender
    let offenderDto: OffenderNotFoundDto

    beforeEach(() => {
      offenderDto = {
        crn: 'CRN123',
        objectType: 'Not_Found',
      }

      offender = new Offender(offenderDto)
    })

    it('is limited', () => {
      expect(offender.isLimited).toBe(true)
    })

    it('has crn matching OffenderDto', () => {
      expect(offender.crn).toBe(offenderDto.crn)
    })

    it('has empty name', () => {
      expect(offender.name).toBe('')
    })
  })
})
