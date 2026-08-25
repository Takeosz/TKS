const test = require('node:test')
const assert = require('node:assert/strict')

const { statuses, isValidLeadStatus } = require('../src/services/leadRules')

test('accepts every supported lead status', () => {
  for (const status of statuses) {
    assert.equal(isValidLeadStatus(status), true)
  }
})

test('rejects unknown or empty lead statuses', () => {
  assert.equal(isValidLeadStatus(''), false)
  assert.equal(isValidLeadStatus('archived'), false)
  assert.equal(isValidLeadStatus(null), false)
})
