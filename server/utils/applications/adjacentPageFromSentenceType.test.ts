import { adjacentPageFromSentenceType } from './adjacentPageFromSentenceType'

describe('adjacentPageFromSentenceType', () => {
  it('should return release-type for a standardDeterminate sentence', () => {
    expect(adjacentPageFromSentenceType('standardDeterminate')).toEqual('release-type')
  })

  it('should return situation for a communityOrder sentence', () => {
    expect(adjacentPageFromSentenceType('communityOrder')).toEqual('situation')
  })

  it('should return situation for a bailPlacement sentence', () => {
    expect(adjacentPageFromSentenceType('bailPlacement')).toEqual('situation')
  })

  it('should return release-type for an extendedDeterminate sentence', () => {
    expect(adjacentPageFromSentenceType('extendedDeterminate')).toEqual('release-type')
  })

  it('should return release-type for an ipp sentence', () => {
    expect(adjacentPageFromSentenceType('ipp')).toEqual('release-type')
  })

  it('should return release-type for a life sentence', () => {
    expect(adjacentPageFromSentenceType('life')).toEqual('release-type')
  })

  it('should return release-date for a non-statutory / MAPPA sentence', () => {
    expect(adjacentPageFromSentenceType('nonStatutory')).toEqual('managed-by-mappa')
  })
})
