import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');
  
  // Você pode adicionar dados iniciais aqui
  // Exemplo:
  
  // const job1 = await prisma.job.create({
  //   data: {
  //     jobTitle: 'Desenvolvedor Full Stack',
  //     jobTitleType: 'text',
  //     company: 'Tech Solutions',
  //     companyType: 'text',
  //     workplace: 'REMOTE',
  //     location: 'São Paulo, SP',
  //     description: 'Vaga para desenvolvedor full stack...',
  //     ...
  //   }
  // });
  
  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

