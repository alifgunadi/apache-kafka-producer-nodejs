const logger = require('./utils/winston')
const isJSON = require('./utils/isJson')
const data_sample_detail = require('./sample-send-data-detail.json')
const data_sample_header = require('./sample-send-data-header.json')

const Kafka = require('node-rdkafka')

const producer = new Kafka.Producer({
  'metadata.broker.list': 'localhost:9092',
  'dr_cb': true, // Enable delivery report callback
  'message.max.bytes': 52428800,
})

let connection = false

const check_connect = () => {
  if (!connection) {
    producer.connect()
  } else {
    console.log('[KAFKA PRODUCER] Kafa broker has been connected')
  }
}

check_connect()

producer.on('ready', (payload) => {
  connection = true
  logger.info('[KAFKA PRODUCER] Producer connected and ready')

  // const message = isJSON(data_sample_detail) ? data_sample_detail : JSON.stringify(data_sample_detail)
  // const message = `Today is ${new Date().toLocaleString()}`

  const key = 'example-key'
  const detail_topic = 'data-detail'
  const detail_message = JSON.stringify(data_sample_detail)
  const header_topic = 'data-header'
  const header_message = JSON.stringify(data_sample_header)
  /* Send data detail */
  try {
    const buffer_detail = Buffer.from(detail_message)
    producer.produce(
      detail_topic,
      null, // Partition: null = let Kafka decide
      buffer_detail,
      key,
      Date.now(),
    )
  } catch (err) {
    connection = false
    logger.error(`[KAFKA PRODUCER] Error producing message detail: ${err.message || err}`)
  }
  /* Send data header */
  try {
    const buffer_header = Buffer.from(header_message)
    producer.produce(
      header_topic,
      null, // Partition: null = let Kafka decide
      buffer_header,
      key,
      Date.now(),
    )
  } catch (err) {
    connection = false
    logger.error(`[KAFKA PRODUCER] Error producing message header: ${err.message || err}`)
  }
})

// Delivery report (confirmation from Kafka broker)
producer.on('delivery-report', (err, report) => {
  if (err) {
    logger.error(`[KAFKA PRODUCER] Delivery failed: ${err.message || JSON.stringify(err)}`)
  } else {
    console.log(`[KAFKA PRODUCER] Delivery successful: ${JSON.stringify(report)}`)
  }
})

// Handle producer-level errors
producer.on('event.error', (err) => {
  connection = false
  logger.error(`[KAFKA PRODUCER] Producer error: ${err.message || err}`)
})

// Required: to get delivery reports
producer.setPollInterval(100)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[KAFKA PRODUCER] Shutting down...')
  producer.disconnect()
})
