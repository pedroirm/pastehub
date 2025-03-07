import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'pastehub-backend', // Nome do serviço correto
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4317', // Endpoint correto do Jaeger para gRPC
  }),
  instrumentations: [new HttpInstrumentation(), new FastifyInstrumentation()],
});

sdk.start();
console.log('🚀 OpenTelemetry iniciado com serviço: pastehub-backend');

process.on('SIGTERM', async () => {
  await sdk.shutdown();
  console.log('❌ OpenTelemetry desligado.');
});
