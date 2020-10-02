const { TransactionProcessor } = require('sawtooth-sdk/processor')
const cbor = require('cbor')
const SimpleStoreHandler = require('./handler')
const transactionProcessor = new TransactionProcessor("tcp://localhost:4004")

transactionProcessor.addHandler(new SimpleStoreHandler())
transactionProcessor.start()

console.log(`Starting  transaction processor`)
console.log(`Connecting to Sawtooth validator at tcp://localhost:4004`)
