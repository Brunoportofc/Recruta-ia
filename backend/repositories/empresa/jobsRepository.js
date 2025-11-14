import prisma from '../../lib/prisma.js';

class JobsRepository {
  async findAll() {
    try {
      const jobs = await prisma.vaga.findMany({
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
      const job = await prisma.vaga.create({
        data: jobData
      });
      return job;
    } catch (error) {
      throw new Error(`Erro ao criar vaga: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const job = await prisma.vaga.findUnique({
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
      const job = await prisma.vaga.update({
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
      await prisma.vaga.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar vaga: ${error.message}`);
    }
  }
}

export default new JobsRepository();

