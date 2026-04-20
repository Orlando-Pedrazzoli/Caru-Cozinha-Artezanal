# Caru - Artisan Kitchen | Digital Menu and Order Management System

Digital menu with a complete ordering system, stock management, weekly scheduling, and drag-and-drop product sorting. Built with Next.js 15, React 19, MongoDB, and Tailwind CSS for Caru - Artisan Kitchen.

Production: https://www.caru.pt

---

## Features

### Digital Menu (Customer)

- Mobile-first responsive interface with dark mode
- Real-time search by name, flavor, and description
- Portion Type filters: Individual, Meal, Party, Combo
- Dietary Preferences & Restrictions filters: Fitness, Vegetarian, Vegan, Gluten Free, Dairy Free
- Distinct iconography and colors for Vegetarian (Leaf) and Vegan (Sprout)
- Dynamic category colors configurable in the admin panel
- Availability badges: "Available today", "Pre-order", "Sold out", "Last units"
- Bilingual support: Portuguese and English with toggle in the navbar
- Instagram link in the footer
- Dismissible delivery area notice inside the cart

### Order System

- Shopping cart persisted in localStorage
- Cart drawer optimized for mobile (100dvh) with sticky footer
- Date selection: "Today" button (when available) or custom calendar with valid days only
- Time slots: Morning or Afternoon
- Payment methods: Pay on delivery or MBWay
- WhatsApp checkout with pre-formatted message
- Auto-generated order number (CARU-YYYYMMDD-001)
- Automatic stock reservation on order creation
- Intersection of available days across all products in the cart

### Admin Panel

- Dashboard with quick navigation to Orders, Schedule, Stock, and QR Codes
- Order management with status filters
- Order detail modal with direct WhatsApp link to the customer
- One-click payment confirmation
- Automatic polling every 30 seconds for new orders
- Weekly schedule: visual product-by-day grid with quick toggles
- Batch schedule updates with "Mon-Fri", "All", "Clear" shortcuts
- Stock management: table with low-stock and out-of-stock alerts
- Inline restocking with per-product movement history
- Full product CRUD with image upload via Cloudinary
- Drag-and-drop to reorder products in the menu (@dnd-kit)
- Order persistence via dedicated /api/dishes/reorder endpoint
- Form with schedule (7 days), stock, portion type, and order settings fields
- QR Code system for menu and Google reviews

### Stock and Availability

- Atomic MongoDB operations to prevent overselling
- Flow: reserve on order, confirm on order confirmation, release on cancellation
- Complete audit log (StockLog) with per-order traceability
- Visual low-stock and out-of-stock alerts in both admin and customer menu

---

## Tech Stack

- Framework: Next.js 15 (App Router)
- Frontend: React 19, Tailwind CSS 3, Radix UI, Lucide Icons
- Drag-and-drop: @dnd-kit/core, @dnd-kit/sortable
- Backend: Next.js API Routes, Mongoose ODM
- Database: MongoDB Atlas
- Images: Cloudinary
- Admin authentication: JWT (jose) + bcryptjs
- i18n: next-intl (PT/EN)
- Deployment: Vercel
- Domain: Hostinger (caru.pt)

---

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

---

## Installation

1. Clone the repository

```bash
git clone https://github.com/Orlando-Pedrazzoli/Caru-Cozinha-Artezanal.git
cd Caru-Cozinha-Artezanal
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/caru-db

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password

# JWT
JWT_SECRET=random_secure_string_minimum_32_characters

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp and MBWay (Carol's number)
NEXT_PUBLIC_WHATSAPP_NUMBER=351932040087
NEXT_PUBLIC_MBWAY_NUMBER=351932040087
```

4. Seed the database

```bash
npm run seed
```

5. (Optional) Standardize category colors

```bash
node scripts/update-category-colors.js
```

6. Start the development server

```bash
npm run dev
```

7. Access the application

- Menu: http://localhost:3000/en
- Admin: http://localhost:3000/admin

---

## Project Structure

```
Caru-Cozinha-Artezanal/
|
|-- app/
|   |-- [locale]/               # Digital menu with i18n (PT/EN)
|   |   |-- page.tsx            # Main menu page
|   |   |-- layout.tsx          # Layout with next-intl provider
|   |-- admin/
|   |   |-- dashboard/          # Main dashboard
|   |   |-- orders/             # Order management
|   |   |-- schedule/           # Weekly schedule
|   |   |-- stock/              # Stock management
|   |   |-- dishes/             # Product CRUD (new/edit)
|   |   |-- qrcode/             # QR code management
|   |   |-- qrcode-review/      # QR code for Google reviews
|   |   |-- login/              # Admin login
|   |-- api/
|   |   |-- menu/               # GET public menu
|   |   |-- orders/             # Orders CRUD
|   |   |-- orders/[id]/        # Per-order operations
|   |   |-- stock/              # Stock dashboard and restock
|   |   |-- stock/[dishId]/     # Per-product stock and logs
|   |   |-- schedule/           # Weekly schedule (GET/PATCH/PUT)
|   |   |-- checkout/whatsapp/  # Create order and generate WhatsApp link
|   |   |-- dishes/             # Product CRUD (admin)
|   |   |-- dishes/reorder/     # PATCH for drag-and-drop reordering
|   |   |-- categories/         # List active categories
|   |   |-- upload/             # Cloudinary upload
|   |   |-- auth/               # Login/logout/check
|   |   |-- qrcode/             # Generate QR codes
|   |-- layout.tsx              # Root layout
|   |-- global.css              # Global styles + Caru palette
|
|-- components/
|   |-- menu/
|   |   |-- DishCard.tsx            # Product card with cart and availability
|   |   |-- DishDetailModal.tsx     # Product detail modal
|   |   |-- MenuFilters.tsx         # Portion type and dietary filters
|   |   |-- AvailabilityBadge.tsx   # Day/stock availability badge
|   |-- cart/
|   |   |-- CartProvider.tsx        # Global cart context
|   |   |-- CartIcon.tsx            # Header icon with counter badge
|   |   |-- CartDrawer.tsx          # Cart sidebar with checkout and delivery notice
|   |-- checkout/
|   |   |-- WhatsAppCheckout.tsx    # Form and WhatsApp redirection
|   |-- admin/
|   |   |-- DishForm.tsx            # Full product form (schedule/stock/portionTypes)
|   |   |-- DishTable.tsx           # Product table with drag-and-drop
|   |-- ui/                         # Base components (Button, Input, Card, Dialog, Badge, Label)
|   |-- providers/                  # ThemeProvider
|
|-- models/
|   |-- Dish.ts                 # Product (schedule, stock, portionTypes, orderSettings)
|   |-- Category.ts             # Category (color, order)
|   |-- Order.ts                # Order (items, status, payment)
|   |-- StockLog.ts             # Stock movement audit
|   |-- Table.ts                # Tables and QR codes
|
|-- lib/
|   |-- db/mongoose.ts          # MongoDB connection with cache and dead connection recovery
|   |-- i18n/config.ts          # Language configuration
|   |-- utils/
|   |   |-- cn.ts               # Tailwind merge + formatPrice
|   |   |-- auth.ts             # JWT encrypt/decrypt + session
|   |   |-- stock.ts            # Atomic stock operations
|   |   |-- whatsapp.ts         # WhatsApp message formatting
|
|-- messages/
|   |-- pt.json                 # Portuguese translations
|   |-- en.json                 # English translations
|
|-- scripts/
|   |-- seed.js                         # Seed DB with categories and products
|   |-- update-category-colors.js       # Standardize category colors
|   |-- fix-orphaned-dishes.js          # Fix products without category
|
|-- public/                     # Logos, favicons, manifest
```

---

## Data Model

### Dish (Product)

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
  portionTypes: [String],       // enum: individual, refeicao, festa, combo
  portionSizes: [{ label: { pt, en }, price, weight }],
  badges: [{ type: 'popular' | 'novo' | 'artesanal' | 'sazonal' }],
  schedule: { monday, tuesday, wednesday, thursday, friday, saturday, sunday },
  stock: { enabled, quantity, reserved, lowStockThreshold },
  orderSettings: { minQuantity, maxQuantity, leadTimeHours, acceptSameDay },
  available: Boolean,
  displayOrder: Number          // used by admin drag-and-drop
}
```

### Order

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

### Category

```javascript
{
  name: { pt, en },
  slug: String,
  color: String,                // hex color for UI
  order: Number,
  active: Boolean
}
```

### StockLog (Audit)

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

| Method              | Route                  | Description                       | Auth  |
| ------------------- | ---------------------- | --------------------------------- | ----- |
| GET                 | /api/menu              | Public menu (dishes + categories) | No    |
| GET                 | /api/categories        | List active categories            | No    |
| GET                 | /api/orders            | List orders (with filters)        | Admin |
| POST                | /api/orders            | Create order                      | No    |
| GET                 | /api/orders/[id]       | Order details                     | No    |
| PATCH               | /api/orders/[id]       | Update status/payment             | Admin |
| DELETE              | /api/orders/[id]       | Cancel order                      | Admin |
| GET                 | /api/stock             | Stock dashboard                   | Admin |
| PATCH               | /api/stock             | Manual restock                    | Admin |
| GET                 | /api/stock/[dishId]    | Stock and logs for a product      | Admin |
| GET                 | /api/schedule          | Schedule of all products          | No    |
| PATCH               | /api/schedule          | Update schedule for a product     | Admin |
| PUT                 | /api/schedule          | Batch schedule update             | Admin |
| POST                | /api/checkout/whatsapp | Create order and WhatsApp link    | No    |
| GET/POST/PUT/DELETE | /api/dishes            | Product CRUD                      | Admin |
| PATCH               | /api/dishes/reorder    | Reorder products (drag-and-drop)  | Admin |
| POST                | /api/upload            | Cloudinary image upload           | Admin |
| POST                | /api/auth/login        | Admin login                       | No    |
| POST                | /api/auth/logout       | Admin logout                      | No    |
| GET                 | /api/auth/check        | Verify session                    | No    |

---

## Color Palette

| Color  | Hex     | Usage               |
| ------ | ------- | ------------------- |
| Purple | #6B3A7D | Primary brand color |
| Red    | #8B3A3A | Savoury category    |
| Brown  | #6B4226 | Sweets category     |
| Green  | #4A7C59 | Fitness category    |
| Blue   | #4A6FA5 | Sides category      |
| Cream  | #F5F0EB | Background          |

---

## Deployment

### Vercel (Production)

The project is deployed on Vercel with a custom domain (caru.pt) configured via Hostinger DNS.

Environment variables required in the Vercel Dashboard:

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

### Manual Build

```bash
npm run build
npm start
```

---

## Order Flow

1. Customer opens the menu at caru.pt
2. Navigates through categories, searches, or applies filters (portion type + dietary restrictions)
3. Sees an availability badge on each product (today, upcoming days, sold out)
4. Adds a product to the cart (drawer opens automatically)
5. Reads the notice about delivery area and restrictions
6. Selects "Today" or another date on the calendar, a time slot, and a payment method
7. Clicks "Order via WhatsApp"
8. Fills in name and phone number in the checkout form
9. The system creates the order in MongoDB, reserves stock, and generates a formatted message
10. WhatsApp opens with a pre-formatted message addressed to Carol
11. Carol receives the order and manages it in the admin: confirms, prepares, delivers, marks as paid

---

## Admin Flow

1. Admin accesses caru.pt/admin and logs in
2. Dashboard shows statistics: total products, available, unavailable
3. Navigates between Orders, Schedule, Stock, QR Codes, and Product Management
4. In product management: drags products by the handle to reorder them in the public menu
5. Creates or edits products with weekly schedule, stock control, portion type, and images
6. Handles orders in real time via automatic polling
7. Updates the weekly schedule in batch or individually
8. Manages stock with inline restocking and full movement history

---

## License

Private project. All rights reserved.

Developed by Orlando Pedrazzoli - orlandopedrazzoli.com
