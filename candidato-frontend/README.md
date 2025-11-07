# Frontend - Área do Candidato | Recruta.ai

Frontend React + TypeScript completo para a área do candidato do sistema Recruta.ai.

## 🚀 Tecnologias

- **React 18** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## 📦 Instalação

```bash
npm install
```

## 🔧 Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5174`

## 🎯 Fluxo Completo da Aplicação

```
Login → Boas-vindas → Upload PDF → Formulário → Teste → Área do Candidato
```

### 1️⃣ Login
- Login com Email/Senha
- Login com LinkedIn (OAuth simulado)

### 2️⃣ Boas-vindas + Upload
- Upload de currículo em PDF (drag & drop)
- Validação de arquivo (máx 5MB)

### 3️⃣ Formulário de Currículo
- Extração automática de dados do PDF
- Preenchimento manual de campos vazios
- Seções: Pessoal, Experiências, Formações

### 4️⃣ Teste Comportamental
- 10 questões de múltipla escolha
- 5 categorias avaliadas
- Sistema de pontuação

### 5️⃣ Área do Candidato
- **Meu Perfil**: Visualizar/editar currículo
- **Minha Candidatura**: Tracking de 4 etapas

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/                      # Componentes UI
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── label.tsx
│   ├── UploadCurriculo.tsx      # Upload de PDF
│   └── ProtectedRoute.tsx       # Proteção de rotas
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticação
├── pages/
│   ├── Login.tsx                # Login
│   ├── Welcome.tsx              # Boas-vindas + Upload
│   ├── FormularioCurriculo.tsx  # Formulário
│   ├── TesteComportamental.tsx  # Teste
│   ├── AreaCandidato.tsx        # Dashboard
│   ├── MeuPerfil.tsx            # Perfil
│   └── MinhaCandidatura.tsx     # Status
├── services/
│   ├── authService.ts           # Autenticação
│   ├── pdfParserService.ts      # Extração PDF
│   └── testeComportamentalService.ts
├── lib/
│   └── utils.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 🎭 Funcionalidades Demo vs Real

### ✅ Extração de PDF (100% FUNCIONAL):
- **Biblioteca**: pdf.js da Mozilla
- **Extração Real de**:
  - Nome, Email, Telefone
  - Cidade e Estado
  - LinkedIn
  - Objetivo Profissional
  - Experiências (cargo, empresa, datas)
  - Formações (curso, instituição, status)
  - Habilidades técnicas
  - Idiomas com níveis
  - Certificações
- **Inteligência**: Usa regex e heurísticas para identificar seções
- **Formato**: Suporta qualquer PDF de currículo em português/inglês

### Autenticação (Mocada):
- **Email/Senha**: qualquer email e senha funcionam
- **LinkedIn**: clique e será autenticado automaticamente

### Teste Comportamental (Funcional):
- 10 questões reais de análise comportamental
- Cálculo automático por 5 categorias
- Sistema de pontuação real (50% = aprovado)

### Status da Candidatura (Demo):
- 4 etapas: Análise Currículo → Análise Testes → Entrevista → Resultado
- Botão para simular avanço de etapas (demo)

## 📄 Rotas

```
/login                    - Login (pública)
/welcome                  - Boas-vindas + Upload (protegida)
/formulario-curriculo     - Formulário (protegida)
/teste-comportamental     - Teste (protegida)
/area-candidato           - Dashboard (protegida)
/meu-perfil              - Perfil (protegida)
/minha-candidatura       - Status (protegida)
```

## 🔐 Sistema de Autenticação

- **AuthContext**: Gerenciamento de estado
- **authService**: API mocada
- **ProtectedRoute**: Proteção de rotas
- **localStorage**: Persistência de dados

## 📊 Dados Armazenados (localStorage)

```javascript
// Token de autenticação
recruta_ai_token

// Dados do usuário logado
recruta_ai_user

// Dados da candidatura completa
candidatura_dados: {
  curriculo: {...},
  testeResultado: {...},
  status: 'analise_curriculo',
  dataCandidatura: '2024-01-01T00:00:00.000Z'
}
```

## 🎨 Componentes UI

- **Button**: variantes (default, outline, ghost, linkedin)
- **Input**: campos de texto
- **Label**: rótulos de formulário
- **Card**: containers com header e conteúdo

## 📋 Status da Candidatura

1. **Análise do Currículo** (inicial)
2. **Análise dos Testes**
3. **Entrevista com Recrutador**
4. **Resultado Final** (aprovado/rejeitado)

## 🚧 Próximos Passos

- [ ] Integrar com backend real
- [ ] Implementar OAuth real do LinkedIn
- [x] ~~Upload real de PDF e extração com biblioteca~~ ✅ Implementado
- [ ] Melhorar precisão do parser (ML/NLP)
- [ ] Suporte para mais formatos de currículo
- [ ] Notificações por email
- [ ] Chat com recrutador
- [ ] Histórico de candidaturas
- [ ] Busca de vagas

## 📝 Build

```bash
npm run build
```

## 👨‍💻 Preview

```bash
npm run preview
```

---

## 🎓 Recursos Implementados

✅ Sistema de login completo  
✅ Upload de PDF com drag & drop  
✅ **Extração REAL de dados do PDF com pdf.js**  
✅ Parser inteligente com regex e heurísticas  
✅ Reconhecimento de 10+ tipos de informação  
✅ Formulário dinâmico com validações  
✅ Teste comportamental com 10 questões  
✅ Sistema de pontuação por categorias  
✅ Área do candidato com perfil editável  
✅ Tracking de status com 4 etapas  
✅ Design responsivo e moderno  
✅ Persistência de dados com localStorage  

**Nota:** Extração de PDF é 100% funcional. Autenticação e status são demo.

