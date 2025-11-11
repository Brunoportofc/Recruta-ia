import prisma from '../../lib/prisma.js';

class EmpresaRepository {
  async findById(id) {
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { id }
      });
      
      // Retornar null se não encontrar (não lançar erro)
      return empresa;
    } catch (error) {
      throw new Error(`Erro ao buscar empresa: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { email }
      });
      
      return empresa;
    } catch (error) {
      throw new Error(`Erro ao buscar empresa por email: ${error.message}`);
    }
  }

  async findByCNPJ(cnpj) {
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { cnpj }
      });
      
      return empresa;
    } catch (error) {
      throw new Error(`Erro ao buscar empresa por CNPJ: ${error.message}`);
    }
  }

  async create(empresaData) {
    try {
      const empresa = await prisma.empresa.create({
        data: empresaData
      });
      return empresa;
    } catch (error) {
      throw new Error(`Erro ao criar empresa: ${error.message}`);
    }
  }

  async update(id, empresaData) {
    try {
      const empresa = await prisma.empresa.update({
        where: { id },
        data: empresaData
      });
      return empresa;
    } catch (error) {
      throw new Error(`Erro ao atualizar empresa: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      await prisma.empresa.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar empresa: ${error.message}`);
    }
  }
}

export default new EmpresaRepository();

