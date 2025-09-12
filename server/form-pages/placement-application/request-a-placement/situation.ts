import SituationBase from '../../shared-examples/situation'

export default class Situation extends SituationBase {
  next() {
    return 'additional-placement-details'
  }
}
