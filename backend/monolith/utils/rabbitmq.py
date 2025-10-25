# file: utils/rabbitmq.py
import pika
import json
import logging
from typing import Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

class RabbitMQClient:
    def __init__(self):
        self.connection = None
        self.channel = None
        self._connect()

    def _connect(self):
        """Establish connection to RabbitMQ"""
        try:
            credentials = pika.PlainCredentials(
                settings.RABBITMQ_USER,
                settings.RABBITMQ_PASSWORD
            )
            parameters = pika.ConnectionParameters(
                host=settings.RABBITMQ_HOST,
                port=settings.RABBITMQ_PORT,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            logger.info("RabbitMQ connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            self.connection = None
            self.channel = None

    def _ensure_connection(self):
        """Ensure connection is active, reconnect if needed"""
        if not self.connection or self.connection.is_closed:
            self._connect()

    def publish_message(self, queue_name: str, message: Dict[str, Any],
                       exchange: str = '', routing_key: str = '') -> bool:
        """Publish message to RabbitMQ queue"""
        if not self.channel:
            logger.warning("RabbitMQ not available, skipping message publish")
            return False

        try:
            self._ensure_connection()

            # Declare queue to ensure it exists
            self.channel.queue_declare(queue=queue_name, durable=True)

            message_body = json.dumps(message, default=str)

            self.channel.basic_publish(
                exchange=exchange or '',
                routing_key=routing_key or queue_name,
                body=message_body,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )

            logger.info(f"Message published to queue: {queue_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to publish message to {queue_name}: {e}")
            return False

    def consume_messages(self, queue_name: str, callback, auto_ack: bool = False):
        """Consume messages from RabbitMQ queue"""
        if not self.channel:
            logger.warning("RabbitMQ not available, cannot consume messages")
            return

        try:
            self._ensure_connection()

            # Declare queue to ensure it exists
            self.channel.queue_declare(queue=queue_name, durable=True)

            def wrapper(ch, method, properties, body):
                try:
                    message = json.loads(body)
                    logger.info(f"Processing message from queue: {queue_name}")
                    callback(ch, method, properties, message)
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    if not auto_ack:
                        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

            self.channel.basic_qos(prefetch_count=1)
            self.channel.basic_consume(
                queue=queue_name,
                on_message_callback=wrapper
            )

            logger.info(f"Started consuming messages from queue: {queue_name}")
            self.channel.start_consuming()

        except Exception as e:
            logger.error(f"Failed to consume messages from {queue_name}: {e}")

    def close(self):
        """Close RabbitMQ connection"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("RabbitMQ connection closed")

# Global RabbitMQ client instance
rabbitmq_client = RabbitMQClient()

# Queue names
ORDER_QUEUE = 'order_processing'
NOTIFICATION_QUEUE = 'notifications'
PAYMENT_QUEUE = 'payment_processing'

def publish_order_message(order_data: Dict[str, Any]) -> bool:
    """Publish order for processing"""
    return rabbitmq_client.publish_message(
        ORDER_QUEUE,
        {
            'type': 'order_created',
            'data': order_data,
            'timestamp': json.dumps(order_data.get('created_at'), default=str) if 'created_at' in order_data else None
        }
    )

def publish_notification_message(notification_data: Dict[str, Any]) -> bool:
    """Publish notification for sending"""
    return rabbitmq_client.publish_message(
        NOTIFICATION_QUEUE,
        {
            'type': 'send_notification',
            'data': notification_data
        }
    )

def publish_payment_message(payment_data: Dict[str, Any]) -> bool:
    """Publish payment for processing"""
    return rabbitmq_client.publish_message(
        PAYMENT_QUEUE,
        {
            'type': 'process_payment',
            'data': payment_data
        }
    )

def start_order_consumer(callback):
    """Start consuming order messages"""
    rabbitmq_client.consume_messages(ORDER_QUEUE, callback)

def start_notification_consumer(callback):
    """Start consuming notification messages"""
    rabbitmq_client.consume_messages(NOTIFICATION_QUEUE, callback)

def start_payment_consumer(callback):
    """Start consuming payment messages"""
    rabbitmq_client.consume_messages(PAYMENT_QUEUE, callback)

