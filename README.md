# Caru - Cozinha Artesanal | Menu Digital e Sistema de Encomendas

Menu digital com sistema completo de encomendas, gestao de stock e agenda semanal para a Caru - Cozinha Artesanal. Desenvolvido com Next.js 15, React 19, MongoDB e Tailwind CSS.

Producao: https://www.caru.pt

---

## Funcionalidades

### Menu Digital (Cliente)

- Interface mobile-first responsiva
- Pesquisa em tempo real por nome, sabor e descricao
- Filtros dieteticos: Fitness, Vegetariano, Vegano, Sem Gluten, Sem Lactose
- Categorias com cores dinamicas: Salgados, Doces, Fitness, Acompanhamentos
- Badge de disponibilidade: "Disponivel hoje", "Sob encomenda", "Esgotado", "Ultimas unidades"
- Suporte bilingue: Portugues e Ingles

### Sistema de Encomendas

- Carrinho de compras com persistencia em localStorage
- Sidebar do carrinho abre automaticamente ao adicionar produto e fecha quando vazio
- Selecao de data: botao "Hoje" (quando disponivel) ou date picker para outra data
- Selecao de horario: Manha ou Tarde
- Metodo de pagamento: Pagamento na entrega ou MBWay direto
- Checkout via WhatsApp com mensagem pre-formatada
- Numero de encomenda auto-gerado (CARU-YYYYMMDD-001)
- Reserva automatica de stock ao criar encomenda

### Painel Administrativo

- Dashboard com navegacao rapida para Encomendas, Agenda e Stock
- Gestao de encomendas com filtros por status (Pendente, Confirmada, A preparar, Pronta, Entregue, Cancelada)
- Modal de detalhes com link direto para WhatsApp do cliente
- Marcacao de pagamento com um clique
- Polling automatico a cada 30 segundos para novas encomendas
- Agenda semanal: grid visual de produtos por dias da semana com toggles rapidos
- Batch update de agenda com botoes "Seg-Sex", "Todos", "Limpar"
- Gestao de stock: tabela com alertas de stock baixo e esgotado
- Reposicao inline com historico de movimentos por produto
- CRUD completo de produtos com upload de imagens via Cloudinary
- Formulario com campos de schedule (7 dias), stock e configuracoes de encomenda
- Sistema de QR Code para menu e avaliacoes Google

### Stock e Disponibilidade

- Operacoes atomicas no MongoDB para evitar overselling
- Fluxo: reserva ao encomendar, baixa definitiva ao confirmar, devolucao ao cancelar
- Log de auditoria completo (StockLog) com rastreio por encomenda
- Alertas visuais de stock baixo e esgotado no admin e no menu do cliente

---

## Stack Tecnica

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, Tailwind CSS 3, Radix UI, Lucide Icons
- **Backend**: Next.js API Routes, Mongoose ODM
- **Base de dados**: MongoDB Atlas
- **Imagens**: Cloudinary
- **Autenticacao admin**: JWT (jose) + bcryptjs
- **i18n**: next-intl (PT/EN)
- **Deploy**: Vercel
- **Dominio**: Hostinger (caru.pt)

---

## Pre-requisitos

- Node.js 18+
- Conta MongoDB Atlas
- Conta Cloudinary

---

## Instalacao

1. Clonar o repositorio

```bash
git clone https://github.com/Orlando-Pedrazzoli/Caru-Cozinha-Artezanal.git
cd Caru-Cozinha-Artezanal
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variaveis de ambiente

Criar ficheiro `.env.local` na raiz do projeto:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/caru-db

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=senha_segura

# JWT
JWT_SECRET=string_aleatoria_segura_minimo_32_caracteres

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp e MBWay (numero da Carol)
NEXT_PUBLIC_WHATSAPP_NUMBER=351932040087
NEXT_PUBLIC_MBWAY_NUMBER=351932040087
```

4. Popular a base de dados

```bash
npm run seed
```

5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

6. Aceder a aplicacao

- Menu: http://localhost:3000/pt
- Admin: http://localhost:3000/admin

---

## Estrutura do Projeto

```
Caru-Cozinha-Artezanal/
|
|-- app/
|   |-- [locale]/               # Menu digital com i18n (PT/EN)
|   |   |-- page.tsx            # Pagina principal do menu
|   |   |-- layout.tsx          # Layout com next-intl provider
|   |-- admin/
|   |   |-- dashboard/          # Dashboard principal
|   |   |-- orders/             # Gestao de encomendas
|   |   |-- schedule/           # Agenda semanal
|   |   |-- stock/              # Gestao de stock
|   |   |-- dishes/             # CRUD de produtos (new/edit)
|   |   |-- qrcode/             # Gestao de QR codes
|   |   |-- login/              # Login admin
|   |-- api/
|   |   |-- menu/               # GET menu publico
|   |   |-- orders/             # CRUD encomendas
|   |   |-- orders/[id]/        # Operacoes por encomenda
|   |   |-- stock/              # Dashboard e restock
|   |   |-- stock/[dishId]/     # Stock individual + logs
|   |   |-- schedule/           # Agenda semanal (GET/PATCH/PUT)
|   |   |-- checkout/whatsapp/  # Criar encomenda + gerar link WhatsApp
|   |   |-- dishes/             # CRUD produtos (admin)
|   |   |-- categories/         # Listar categorias
|   |   |-- upload/             # Upload Cloudinary
|   |   |-- auth/               # Login/logout/check
|   |   |-- qrcode/             # Gerar QR codes
|   |-- layout.tsx              # Root layout
|   |-- global.css              # Estilos globais + paleta Caru
|
|-- components/
|   |-- menu/
|   |   |-- DishCard.tsx        # Card do produto com carrinho e disponibilidade
|   |   |-- DishDetailModal.tsx # Modal de detalhes do produto
|   |   |-- MenuFilters.tsx     # Filtros dieteticos
|   |   |-- AvailabilityBadge.tsx # Badge de disponibilidade por dia/stock
|   |-- cart/
|   |   |-- CartProvider.tsx    # Context global do carrinho
|   |   |-- CartIcon.tsx        # Icone com badge no header
|   |   |-- CartDrawer.tsx      # Sidebar do carrinho com checkout
|   |-- checkout/
|   |   |-- WhatsAppCheckout.tsx # Formulario e envio via WhatsApp
|   |-- admin/
|   |   |-- DishForm.tsx        # Formulario completo (schedule/stock/order settings)
|   |   |-- DishTable.tsx       # Tabela de produtos
|   |-- ui/                     # Componentes base (Button, Input, Card, Dialog, Badge, Label)
|   |-- providers/              # ThemeProvider
|
|-- models/
|   |-- Dish.ts                 # Produto (schedule, stock, orderSettings)
|   |-- Category.ts             # Categoria (cor, ordem)
|   |-- Order.ts                # Encomenda (items, status, pagamento)
|   |-- StockLog.ts             # Auditoria de movimentos de stock
|   |-- Table.ts                # Mesas e QR codes
|
|-- lib/
|   |-- db/mongoose.ts          # Conexao MongoDB com cache
|   |-- i18n/config.ts          # Configuracao de idiomas
|   |-- utils/
|   |   |-- cn.ts               # Tailwind merge + formatPrice
|   |   |-- auth.ts             # JWT encrypt/decrypt + session
|   |   |-- stock.ts            # Operacoes atomicas de stock
|   |   |-- whatsapp.ts         # Formatacao de mensagem WhatsApp
|
|-- messages/
|   |-- pt.json                 # Traducoes Portugues
|   |-- en.json                 # Traducoes Ingles
|
|-- scripts/
|   |-- seed.js                 # Popular BD com 4 categorias + 41 produtos
|
|-- public/                     # Logos, favicons, manifest
```

---

## Modelo de Dados

### Dish (Produto)

```javascript
{
  name: { pt, en },
  description: { pt, en },
  baseDescription: { pt, en },
  flavor: { pt, en },
  category: ObjectId -> Category,
  price: Number,
  weight: String,
  calories: Number,
  images: [{ url, cloudinaryId, isPrimary }],
  dietaryInfo: { vegetarian, vegan, glutenFree, dairyFree, fitness },
  allergens: [String],
  portionSizes: [{ label: { pt, en }, price, weight }],
  badges: [{ type: 'popular' | 'novo' | 'artesanal' | 'sazonal' }],
  schedule: { monday, tuesday, wednesday, thursday, friday, saturday, sunday },
  stock: { enabled, quantity, reserved, lowStockThreshold },
  orderSettings: { minQuantity, maxQuantity, leadTimeHours, acceptSameDay },
  available: Boolean,
  displayOrder: Number
}
```

### Order (Encomenda)

```javascript
{
  orderNumber: String,          // CARU-20260407-001
  customer: { name, phone, email, notes },
  items: [{ dish, name, flavor, quantity, unitPrice, subtotal }],
  totals: { subtotal, discount, total },
  deliveryDate: Date,
  deliveryTime: String,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
  statusHistory: [{ status, timestamp, note }],
  payment: {
    method: 'on_delivery' | 'mbway' | 'transfer' | 'cash',
    status: 'pending' | 'paid' | 'refunded',
    paidAt: Date
  },
  source: 'website' | 'whatsapp' | 'admin'
}
```

### Category (Categoria)

```javascript
{
  name: { pt, en },
  slug: String,
  color: String,                // hex color para UI
  order: Number,
  active: Boolean
}
```

### StockLog (Auditoria)

```javascript
{
  dish: ObjectId -> Dish,
  action: 'restock' | 'order_reserved' | 'order_confirmed' | 'order_cancelled' | 'manual_adjust',
  quantity: Number,
  previousStock: Number,
  newStock: Number,
  order: ObjectId -> Order,
  note: String
}
```

---

## API Routes

| Metodo              | Rota                   | Descricao                          | Auth  |
| ------------------- | ---------------------- | ---------------------------------- | ----- |
| GET                 | /api/menu              | Menu publico (dishes + categories) | Nao   |
| GET                 | /api/categories        | Listar categorias ativas           | Nao   |
| GET                 | /api/orders            | Listar encomendas (filtros)        | Admin |
| POST                | /api/orders            | Criar encomenda                    | Nao   |
| GET                 | /api/orders/[id]       | Detalhes de encomenda              | Nao   |
| PATCH               | /api/orders/[id]       | Atualizar status/pagamento         | Admin |
| DELETE              | /api/orders/[id]       | Cancelar encomenda                 | Admin |
| GET                 | /api/stock             | Dashboard de stock                 | Admin |
| PATCH               | /api/stock             | Restock manual                     | Admin |
| GET                 | /api/stock/[dishId]    | Stock + logs de um produto         | Admin |
| GET                 | /api/schedule          | Agenda de todos os produtos        | Nao   |
| PATCH               | /api/schedule          | Atualizar agenda de um produto     | Admin |
| PUT                 | /api/schedule          | Batch update de agenda             | Admin |
| POST                | /api/checkout/whatsapp | Criar encomenda + link WhatsApp    | Nao   |
| GET/POST/PUT/DELETE | /api/dishes            | CRUD de produtos                   | Admin |
| POST                | /api/upload            | Upload de imagem Cloudinary        | Admin |
| POST                | /api/auth/login        | Login admin                        | Nao   |
| POST                | /api/auth/logout       | Logout admin                       | Nao   |
| GET                 | /api/auth/check        | Verificar sessao                   | Nao   |

---

## Paleta de Cores

| Cor      | Hex     | Utilizacao                |
| -------- | ------- | ------------------------- |
| Roxo     | #6B3A7D | Cor principal da marca    |
| Vermelho | #8B3A3A | Categoria Salgados        |
| Castanho | #6B4226 | Categoria Doces           |
| Verde    | #4A7C59 | Categoria Fitness         |
| Azul     | #4A6FA5 | Categoria Acompanhamentos |
| Creme    | #F5F0EB | Background                |

---

## Deploy

### Vercel (Producao)

O projeto esta deployado na Vercel com dominio customizado caru.pt configurado via Hostinger DNS.

Variaveis de ambiente necessarias no Vercel Dashboard:

- MONGODB_URI
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- ADMIN_USERNAME
- ADMIN_PASSWORD
- JWT_SECRET
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_WHATSAPP_NUMBER
- NEXT_PUBLIC_MBWAY_NUMBER

### Build manual

```bash
npm run build
npm start
```

---

## Fluxo de Encomenda

1. Cliente abre o menu em caru.pt
2. Navega por categorias, pesquisa ou filtra produtos
3. Ve badge de disponibilidade em cada produto (hoje, proximos dias, esgotado)
4. Adiciona produto ao carrinho (sidebar abre automaticamente)
5. No carrinho: escolhe "Hoje" ou outra data, horario, metodo de pagamento
6. Clica "Encomendar via WhatsApp"
7. Preenche nome e telefone no formulario
8. Sistema cria encomenda no MongoDB, reserva stock, gera mensagem formatada
9. WhatsApp abre com mensagem pre-formatada para o numero da Carol
10. Carol recebe e gere no admin: confirma, prepara, entrega, marca pagamento

---

## Licenca

Projeto privado. Todos os direitos reservados.

Desenvolvido por Orlando Pedrazzoli - orlandopedrazzoli.com
