import { expect, test, that } from '../lib/expect'

import { Errors } from '../../api'
import { Document } from '../../api/data'
import { Party as PartyModel } from '../../models'
import Models from '../../models'

const party: PartyModel = {
  room_code: 'ABCD',
  ended: false,
  guests: [],
  location: { host_name: 'Chance Snow' },
}

class Party {
  // tslint:disable-next-line:variable-name
  room_code = 'ABCD'
  type = 'party'
}

test('Resource Document instances have expected type', _ => {
  const document = Document.Resource(party.room_code, Models.Party, party)
  expect(that(document.data).does.include({
    id: 'ABCD',
    type: 'party',
  }))

  const newResourceDoc = Document.NewResource(Models.Party, party)
  expect(that(newResourceDoc.data).does.include({
    type: 'party',
  }))
  expect(that(newResourceDoc.data).does.not.have.ownProperty('id'))
})

test('Resource Document instances have expected type given class type', _ => {
  const document = Document.Resource(party.room_code, Party, party)
  expect(that(document.data).does.include({
    id: 'ABCD',
    type: 'party',
  }))

  const newResourceDoc = Document.NewResource(Party, party)
  expect(that(newResourceDoc.data).does.include({
    type: 'party',
  }))
  expect(that(newResourceDoc.data).does.not.have.ownProperty('id'))
})

test('Resource Identifier Document instances have expected type', _ => {
  const resourceIdDoc = Document.ResourceIdentifier(party.room_code, Models.Party)
  expect(that(resourceIdDoc.data).does.include({
    id: 'ABCD',
    type: 'party',
  }))
})

test('Resource Identifier Document instances have expected type given class type', _ => {
  const resourceIdDoc = Document.ResourceIdentifier(new Party().room_code, Party)
  expect(that(resourceIdDoc.data).does.include({
    id: 'ABCD',
    type: 'party',
  }))
})

test('Error Document instances have given errors', _t => {
  const errorDoc = Document.Error(Errors.defaultError)
  expect(that(errorDoc.errors).has.ordered.members([
    Errors.defaultError,
  ]))
  expect(that(errorDoc).does.not.have.ownProperty('data'))

  const errorsDoc = Document.Errors([Errors.defaultError, Errors.requestError])
  expect(that(errorsDoc.errors).has.ordered.members([
    Errors.defaultError,
    Errors.requestError,
  ]))
  expect(that(errorsDoc).does.not.have.ownProperty('data'))
})
