import * as amqp from 'amqplib';

class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private queues = new Set<string>();
  private isConsuming = false;

  private async createConnection(): Promise<void> {
    if (this.connection) return;

    const connectionString = process.env.RABBITMQ_URL || 'amqp://admin:admin123@rabbitmq:5672';

    try {
      console.log('🔵 Conectando ao RabbitMQ...');
      this.connection = (await amqp.connect(connectionString, {
        heartbeat: 60,
      })) as unknown as amqp.Connection;

      // @ts-ignore
      this.channel = (await this.connection.createChannel()) as unknown as amqp.Channel;
      this.channel?.on('error', err =>
        console.error('❌ Erro no canal RabbitMQ:', err),
      ) as unknown as amqp.Channel;
      this.channel?.on('close', () => {
        console.warn('⚠️ Canal do RabbitMQ fechado, tentando reconectar...');
        this.connection = null;
        this.channel = null;
        setTimeout(() => this.createConnection(), 5000);
      });

      console.log('✅ Conexão RabbitMQ estabelecida com sucesso');
    } catch (error) {
      console.error('❌ Falha ao conectar ao RabbitMQ:', error);
      this.connection = null;
      this.channel = null;
      setTimeout(() => this.createConnection(), 5000);
    }
  }

  private async ensureChannel(): Promise<void> {
    if (!this.channel) {
      await this.createConnection();
    }
  }

  private async ensureQueue(queueName: string): Promise<void> {
    await this.ensureChannel();

    if (this.queues.has(queueName)) return;

    console.log(`🔵 Criando fila: ${queueName}`);
    try {
      await this.channel!.assertQueue(queueName, {
        durable: true,
        autoDelete: false,
      });

      this.queues.add(queueName);
    } catch (error) {
      console.error(`❌ Erro ao criar fila ${queueName}:`, error);
    }
  }

  async sendToQueue(queueName: string, message: any, retryCount = 0): Promise<void> {
    await this.ensureQueue(queueName);

    try {
      const sent = this.channel!.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
        mandatory: true,
      });

      if (!sent) throw new Error(`Falha ao enviar mensagem para a fila ${queueName}`);

      console.log(`✅ Mensagem enviada para a fila: ${queueName}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem para fila ${queueName}:`, error);

      if (retryCount < 3) {
        console.log(`🔄 Reenviando mensagem (${retryCount + 1}/3) para ${queueName}`);
        setTimeout(() => this.sendToQueue(queueName, message, retryCount + 1), 2000);
      } else {
        console.error(`❌ Falha final ao enviar mensagem para ${queueName}`);
      }
    }
  }

  async sendMessage(message: object): Promise<void> {
    await this.sendToQueue('text-views', message);
  }

  async consumeQueue(
    queueName: string,
    messageHandler: (msg: Record<string, any>) => Promise<void>,
  ): Promise<void> {
    await this.ensureQueue(queueName);

    if (this.isConsuming) return;
    this.isConsuming = true;

    try {
      console.log(`✅ Consumindo mensagens da fila: ${queueName}`);
      await this.channel!.consume(
        queueName,
        async msg => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              console.log('📊 Nova mensagem recebida:', content);
              await messageHandler(content);
              this.channel!.ack(msg);
            } catch (error) {
              console.error(`❌ Erro processando mensagem da fila ${queueName}:`, error);
              this.channel!.nack(msg, false, false);
            }
          }
        },
        { noAck: false },
      );
    } catch (error) {
      console.error(`❌ Erro ao consumir fila ${queueName}:`, error);
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        // @ts-ignore
        await this.connection.close();
        this.connection = null;
      }

      this.isConsuming = false;
      console.log('🔴 Conexão RabbitMQ fechada');
    } catch (error) {
      console.error('❌ Erro ao fechar conexão RabbitMQ:', error);
    }
  }
}

export default new RabbitMQService();
