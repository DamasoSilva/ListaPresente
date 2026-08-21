# 🏡 Lista de Presentes Digital — Casa Nova

Sistema completo de lista de presentes para casais que estão montando uma casa nova. Substitui planilhas e listas de WhatsApp por uma experiência moderna, elegante e fácil de usar.

**Demo:** [https://3000-ikip9vcvyvue47gmi05sj.e2b.app](https://3000-ikip9vcvyvue47gmi05sj.e2b.app)

---

## ✨ Funcionalidades

### 🎁 Área Pública
- **Home elegante** com foto do casal, mensagem de boas-vindas e indicadores
- **Lista de presentes** com filtros por categoria, prioridade, faixa de preço e disponibilidade
- **Pesquisa** por nome ou descrição
- **Detalhes do produto** com galeria, descrição completa e disponibilidade
- **Sistema de reserva** com validação de estoque e controle de concorrência
- **Indicações externas** para produtos em lojas parceiras
- **Compartilhamento** via WhatsApp
- **Design responsivo** mobile-first
- **SEO otimizado** com Open Graph

### 🔐 Painel Administrativo
- **Dashboard** com estatísticas em tempo real
- **CRUD completo** de produtos, categorias e indicações
- **Gerenciamento de reservas** com alteração de status
- **Configurações do site** (textos, imagens, redes sociais)
- **Controle de estoque** com validação transacional
- **Logs de auditoria** para todas as ações administrativas
- **Autenticação segura** com JWT e bcrypt

### 🔒 Segurança
- Reserva transacional com `SELECT FOR UPDATE` (previne dupla reserva)
- Validação de estoque no banco de dados
- Proteção contra SQL injection (Drizzle ORM)
- Autenticação com cookies httpOnly assinados
- Rate limiting implícito via idempotency keys
- Sanitização de entradas

---

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, Drizzle ORM
- **Banco:** PostgreSQL 16
- **Auth:** JWT (jose), bcryptjs
- **Deploy:** Vercel (ou qualquer plataforma Node.js)

---

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL 14+
- npm ou pnpm

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <repo-url>
cd lista-presentes
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```bash
cp .env.example .env
```

Edite `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
AUTH_SECRET=change-me-to-a-long-random-string-at-least-16-chars
ADMIN_EMAIL=admin@novolar.com.br
ADMIN_PASSWORD=admin123456
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=  # opcional
```

**Importante:**
- `AUTH_SECRET`: gere uma string aleatória longa (mínimo 16 caracteres)
- `ADMIN_EMAIL` e `ADMIN_PASSWORD`: credenciais do primeiro administrador

### 4. Configure o banco de dados

Crie o banco PostgreSQL:

```bash
createdb app_db
# ou via psql:
# CREATE DATABASE app_db;
```

### 5. Aplique as migrations

```bash
npx drizzle-kit push
```

### 6. Popule com dados de exemplo

```bash
npx tsx src/db/seed.ts
```

Isso criará:
- 1 administrador (email/senha do `.env`)
- 10 categorias
- 15 produtos de exemplo
- 3 indicações externas
- Configurações iniciais do site

### 7. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Acesso ao Painel Administrativo

Após rodar o seed:

- **URL:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Email:** `admin@novolar.com.br` (ou o valor de `ADMIN_EMAIL`)
- **Senha:** `admin123456` (ou o valor de `ADMIN_PASSWORD`)

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── admin/              # Painel administrativo
│   │   ├── login/          # Página de login
│   │   ├── produtos/       # CRUD de produtos
│   │   ├── categorias/     # CRUD de categorias
│   │   ├── reservas/       # Gerenciamento de reservas
│   │   ├── indicacoes/     # CRUD de indicações
│   │   └── configuracoes/  # Configurações do site
│   ├── api/
│   │   └── auth/           # Rotas de autenticação
│   ├── presentes/
│   │   ├── page.tsx        # Lista de presentes
│   │   └── [slug]/         # Detalhes do produto
│   ├── indicacoes/         # Indicações externas
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Home
│   ├── globals.css         # Estilos globais
│   ├── robots.ts           # robots.txt
│   └── sitemap.ts          # sitemap.xml
├── components/
│   ├── ui.tsx              # Componentes base (Button, Input, Card, etc.)
│   ├── Header.tsx          # Cabeçalho
│   ├── Footer.tsx          # Rodapé
│   ├── ProductCard.tsx     # Card de produto
│   ├── ExternalProductCard.tsx
│   ├── AdminSidebar.tsx    # Sidebar do admin
│   └── ProductForm.tsx     # Formulário de produto
├── db/
│   ├── index.ts            # Conexão com banco
│   ├── schema.ts           # Schema Drizzle
│   └── seed.ts             # Script de seed
├── lib/
│   ├── auth.ts             # Autenticação (JWT, bcrypt)
│   ├── config.ts           # Configurações do site
│   ├── config-actions.ts   # Server actions de config
│   ├── actions.ts          # Server actions (reservas, CRUD)
│   └── utils.ts            # Utilitários (slugify, formatação, etc.)
└── types/
    └── (tipos globais)
```

---

## 🗄️ Schema do Banco

### Tabelas principais

- **admins**: administradores do sistema
- **categories**: categorias de produtos
- **products**: produtos da lista de presentes
- **reservations**: reservas feitas por convidados
- **external_products**: indicações de lojas externas
- **site_config**: configurações do site (chave-valor)
- **audit_logs**: logs de ações administrativas

### Relacionamentos

```
categories 1:N products
products 1:N reservations
```

### Controle de estoque

O controle de quantidade é feito via:
- `products.totalQuantity`: quantidade total
- `products.reservedQuantity`: quantidade já reservada
- `available = totalQuantity - reservedQuantity`

A reserva é transacional com `SELECT FOR UPDATE` para prevenir concorrência.

---

## 🎨 Personalização

### Cores

Edite `src/app/globals.css` para alterar a paleta:

```css
@theme {
  --color-bg: #faf6f2;
  --color-navy: #1f2a44;
  --color-rose: #f3c6cf;
  /* ... */
}
```

### Textos e imagens

Use o painel administrativo em `/admin/configuracoes` para alterar:
- Nome do casal
- Fotos
- Mensagens de boas-vindas
- Textos da seção "Como funciona"
- Redes sociais
- SEO

---

## 🚢 Deploy

### Vercel (recomendado)

1. Conecte o repositório à Vercel
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
3. Deploy!

### Outras plataformas

Qualquer plataforma Node.js funciona:
- Railway
- Render
- Fly.io
- AWS/GCP/Azure

**Importante:**
- Execute `npx drizzle-kit push` após o deploy
- Execute `npx tsx src/db/seed.ts` uma vez para criar o admin inicial

---

## 🔧 Scripts

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar servidor de produção
npm run lint         # ESLint
npm run typecheck    # TypeScript
npx drizzle-kit push # Aplicar schema no banco
npx tsx src/db/seed.ts # Popular banco com dados de exemplo
```

---

## 🧪 Testes

O projeto inclui validações para:

1. Produto com 1 unidade
2. Produto com múltiplas unidades
3. Reserva parcial
4. Reserva total
5. Tentativa de reservar quantidade maior que disponível
6. Cancelamento de reserva (restaura estoque)
7. Duas reservas simultâneas (concorrência)
8. Produto inativo
9. Usuário não autenticado tentando acessar admin
10. Admin autenticado

Para testar manualmente:
1. Acesse `/presentes`
2. Reserve um produto
3. Verifique se a quantidade disponível diminui
4. Tente reservar novamente (deve falhar se não houver estoque)
5. Acesse `/admin/reservas` e cancele a reserva
6. Verifique se o estoque foi restaurado

---

## 📱 Responsividade

O site é totalmente responsivo e otimizado para mobile:

- **Mobile:** 360px, 390px, 414px
- **Tablet:** 768px, 1024px
- **Desktop:** 1280px, 1440px

Testado em Chrome, Safari, Firefox e Edge.

---

## 🔒 Segurança

### Autenticação

- JWT assinado com HS256
- Cookies httpOnly e secure (em produção)
- Sessão de 7 dias
- Logout invalida o cookie

### Reservas

- Transação com `SELECT FOR UPDATE`
- Validação de estoque no banco
- Idempotency keys para prevenir dupla submissão
- Sanitização de entradas

### Admin

- Todas as rotas `/admin/*` são protegidas
- Server actions validam autenticação
- Logs de auditoria para todas as ações

---

## 🌐 SEO

- Meta tags dinâmicas
- Open Graph para compartilhamento
- `robots.txt` e `sitemap.xml`
- URLs amigáveis (slugs)
- Imagens otimizadas com `next/image`

---

## 📊 Analytics (opcional)

Para habilitar Google Analytics:

1. Adicione `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` no `.env`
2. O script é carregado automaticamente

Eventos rastreados:
- `page_view`
- `product_view`
- `reserve_start`
- `reserve_success`
- `external_product_click`

---

## 🐛 Troubleshooting

### Erro: "DATABASE_URL is required"

Verifique se o arquivo `.env` existe e contém `DATABASE_URL`.

### Erro: "AUTH_SECRET is required"

Gere uma string aleatória:

```bash
openssl rand -base64 32
```

Adicione ao `.env` como `AUTH_SECRET`.

### Erro: "Cannot find module './xxx'"

Execute:

```bash
rm -rf .next
npm run build
```

### Migrações não aplicadas

```bash
npx drizzle-kit push
```

---

## 📝 Licença

MIT License — sinta-se livre para usar e modificar.

---

## 💝 Créditos

Desenvolvido com carinho para celebrar novos lares.

**Stack:** Next.js, Drizzle ORM, PostgreSQL, Tailwind CSS

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação do Next.js e Drizzle ORM

---

**Feito com ♥ para casas novas**
