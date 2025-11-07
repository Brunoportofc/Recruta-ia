import prisma from '../../lib/prisma.js';

class JobsRepository {
  async findAll() {
    try {
      const jobs = await prisma.job.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return jobs;
    } catch (error) {
      throw new Error(`Erro ao buscar vagas: ${error.message}`);
    }
  }

  async create(jobData) {
    try {
      const job = await prisma.job.create({
        data: jobData
      });
      return job;
    } catch (error) {
      throw new Error(`Erro ao criar vaga: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const job = await prisma.job.findUnique({
        where: { id }
      });
      
      if (!job) {
        throw new Error('Vaga não encontrada');
      }
      
      return job;
    } catch (error) {
      throw new Error(`Erro ao buscar vaga: ${error.message}`);
    }
  }

  async update(id, jobData) {
    try {
      const job = await prisma.job.update({
        where: { id },
        data: jobData
      });
      return job;
    } catch (error) {
      throw new Error(`Erro ao atualizar vaga: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      await prisma.job.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar vaga: ${error.message}`);
    }
  }
}

export default new JobsRepository();

