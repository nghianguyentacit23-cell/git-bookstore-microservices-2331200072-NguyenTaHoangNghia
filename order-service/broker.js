import amqplib from 'amqplib';

let channel = null;
let connecting = null;

export async function connectToBroker() {
  if (channel) return channel;
  if (connecting) return connecting;

  connecting = (async () => {
    const url = process.env.RABBITMQ_URL || 'amqp://message-broker:5672';
    const conn = await amqplib.connect(url);
    const nextChannel = await conn.createChannel();

    conn.on('close', () => {
      channel = null;
      console.warn('RabbitMQ connection closed');
    });
    conn.on('error', err => {
      channel = null;
      console.error('RabbitMQ connection error:', err.message);
    });

    channel = nextChannel;
    console.log('Connected to RabbitMQ');
    return channel;
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export async function publishMessage(queue, message) {
  let lastError;

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const activeChannel = channel || await connectToBroker();
      await activeChannel.assertQueue(queue, { durable: true });
      return activeChannel.sendToQueue(
        queue,
        Buffer.from(typeof message === 'string' ? message : JSON.stringify(message)),
        { persistent: true }
      );
    } catch (err) {
      lastError = err;
      channel = null;
      console.warn(`RabbitMQ publish attempt ${attempt} failed:`, err.message);
      if (attempt < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError;
}

export default { connectToBroker, publishMessage };
