const statuses = ['new', 'in_progress', 'proposal', 'won', 'lost']

const isValidLeadStatus = (status) => statuses.includes(status)

module.exports = { statuses, isValidLeadStatus }
