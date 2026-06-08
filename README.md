# 🌍 Wijha (وجهة) - The All-in-One Travel Platform

![Wijha Banner](https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200&auto=format&fit=crop)

**Wijha** (meaning "Destination" in Arabic) is a comprehensive, all-in-one travel platform built specifically for the MENA region. It serves as a unified digital ecosystem connecting travelers with accommodations, transportation, local tourism activities, and events.

By combining the functionalities of Booking.com (accommodations), Airbnb (experiences), Skyscanner (flights/transport), and Eventbrite (events) into one seamless application, Wijha aims to digitize and elevate the tourism experience across the Maghreb and Middle East.

---

## 🏗️ Architecture & Tech Stack

Wijha is structured as a **Monorepo** consisting of a modern, SEO-optimized frontend and a robust, modular backend API.

### 🌐 Frontend (`/frontend`)
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion (for dynamic, ultra-premium animations)
- **State Management:** React Context / Zustand
- **Data Fetching:** React Query (TanStack Query)

### ⚙️ Backend (`/backend`)
- **Framework:** [Laravel 11](https://laravel.com/)
- **Architecture:** Domain-Driven Design (DDD) via `nwidart/laravel-modules`
- **Database:** PostgreSQL 16
- **Authentication:** JWT (JSON Web Tokens) via `tymon/jwt-auth`
- **Media Management:** Spatie MediaLibrary v11
- **Multilingual Support:** Spatie Translatable (Arabic, French, English)

---

## 📁 Repository Structure

```text
Wijha/
├── backend/                  # Laravel 11 API Backend
│   ├── Modules/              # Domain-Driven Modules (Auth, Core, Places, etc.)
│   ├── app/                  # Base Laravel Application
│   ├── config/               # Global Configuration (MENA focused)
│   └── tests/                # Automated Feature & Unit Tests
│
├── frontend/                 # Next.js 14 Frontend Application
│   ├── src/app/              # Next.js App Router Pages
│   └── tailwind.config.ts    # Design System Tokens
│
└── README.md                 # You are here!
```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
- PHP 8.3+
- Node.js 20+
- PostgreSQL 16
- Composer
- Git

### 1. Backend Setup (Laravel)

```bash
# Navigate to the backend directory
cd backend

# Install PHP dependencies
composer install

# Copy the environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret key
php artisan jwt:secret

# Run database migrations and seeders (populates Geography data)
php artisan migrate --seed

# Start the local development server
php artisan serve
```
*Note: Ensure you have configured your PostgreSQL credentials inside `backend/.env` before running migrations.*

### 2. Frontend Setup (Next.js)

```bash
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```
*The frontend will be accessible at `http://localhost:3000`.*

---

## 🧩 Active Modules

The backend is strictly modularized to maintain separation of concerns:

1. **Auth Module:** Handles user registration, login, JWT token rotation, and Role-Based Access Control (RBAC).
2. **Core Module:** The foundation layer. Contains shared geographic dictionaries (Countries, Regions, Cities with coordinates) and global API response traits. Fully supports `ar`, `fr`, and `en` translations.
3. *(Upcoming)* **Places Module:** Management of Points of Interest (Monuments, Medinas, Parks).
4. *(Upcoming)* **Events Module:** Ticketing and local event management.
5. *(Upcoming)* **Accommodations Module:** Hotel and riad bookings.

---

## 🧪 Testing

Wijha strictly enforces automated testing to ensure platform stability. 

```bash
# Run all backend tests
cd backend
vendor/bin/phpunit
```

---

## 🌍 MENA Focus
The platform is currently optimized for the MENA region with:
- Default Application Timezone: `Africa/Casablanca`
- Default Locale: `ar` (Arabic)
- Fallback Locale: `fr` (French)

---

*Designed and engineered for the future of travel.*
