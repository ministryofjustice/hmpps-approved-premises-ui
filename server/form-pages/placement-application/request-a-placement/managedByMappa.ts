import ManagedByMappaBase from '../../shared/managedByMappa'

export default class ManagedByMappa extends ManagedByMappaBase {
  next() {
    return this.body.managedByMappa === 'yes' ? 'additional-placement-details' : 'sentence-type'
  }
}
