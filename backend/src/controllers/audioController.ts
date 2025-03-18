import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { s3 } from '../config/s3';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { MultipartFile } from '@fastify/multipart';
import path from 'path';
export async function uploadAudio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data: MultipartFile = (await request.file()) as MultipartFile;
    const userId = request.user?.id;
    console.log(userId);
    if (!userId) {
      request.log.warn('🚨 Tentativa de upload sem autenticação');
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const audioId = uuidv4();
    const fileName = `${audioId}-${data.filename}`;
    const filePath = path.join('/tmp', fileName);

    // Garantir que o diretório temporário existe
    if (!fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp', { recursive: true });
    }

    // Salva temporariamente no servidor
    const fileStream = fs.createWriteStream(filePath);
    await data.file.pipe(fileStream);

    // Upload para MinIO
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET || 'pastehub-audio',
        Key: fileName,
        Body: fs.createReadStream(filePath),
        ContentType: data.mimetype,
      })
      .promise();

    // Salva os metadados no banco
    const newAudio = await prisma.audio.create({
      data: {
        title: data.filename,
        url: uploadResult.Location, // URL gerada pelo MinIO
        shareableId: audioId,
        authorId: userId,
      },
    });

    // Remove arquivo temporário
    fs.unlinkSync(filePath);

    return reply.status(201).send(newAudio);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getAudioById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const audio = await prisma.audio.findUnique({
      where: { id },
    });

    if (!audio) {
      return reply.status(404).send({ error: 'Audio not found' });
    }

    if (audio.authorId !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    return reply.send(audio);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
export async function streamAudio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const audio = await prisma.audio.findUnique({ where: { shareableId: id } });

    if (!audio) return reply.status(404).send({ error: 'Audio not found' });

    const bucket = process.env.AWS_BUCKET;
    const key = audio.url.split('/').pop();

    if (!bucket || !key) {
      return reply.status(500).send({ error: 'Invalid S3 parameters' });
    }

    const params = { Bucket: bucket, Key: key };

    try {
      const stream = s3.getObject(params).createReadStream();
      reply.header('Content-Type', 'audio/mp3');
      return reply.send(stream);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao carregar áudio' });
    }
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
export async function deleteAudio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const existingAudio = await prisma.audio.findUnique({
      where: { id },
    });

    if (!existingAudio) {
      return reply.status(404).send({ error: 'Audio not found' });
    }

    if (existingAudio.authorId !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const bucket = process.env.AWS_BUCKET;
    const key = existingAudio.url.split('/').pop();

    if (!bucket || !key) {
      return reply.status(500).send({ error: 'Invalid S3 parameters' });
    }

    await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    await prisma.audio.delete({ where: { id } });

    return reply.status(204).send();
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
