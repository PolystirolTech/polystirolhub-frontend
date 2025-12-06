# PolystirolHub Frontend

Современный фронтенд для социальной площадки PolystirolHub, построенный на Next.js 14 с использованием современного стека технологий.

## 🚀 Технологический стек

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **API Integration**: OpenAPI/Swagger с автогенерацией клиента
- **Code Quality**: ESLint, Prettier
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## 📋 Требования

- Node.js 18+ или 20+
- npm
- Docker и Docker Compose (для production-сборки)

## 🛠️ Установка и запуск

### Локальная разработка

1. **Клонируйте репозиторий**:

   ```bash
   git clone <repository-url>
   cd polystirolhub-frontend
   ```

2. **Установите зависимости**:

   ```bash
   npm install
   ```

3. **Настройте переменные окружения**:

   ```bash
   cp .env.example .env.local
   ```

   Отредактируйте `.env.local` при необходимости.

4. **Запустите dev-сервер**:
   ```bash
   npm run dev
   ```
   Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

### Production сборка с Docker

1. **Убедитесь, что сеть создана** (для связи с backend):

   ```bash
   docker network create polystirolhub-network
   ```

2. **Соберите и запустите контейнер**:

   ```bash
   docker-compose up -d --build
   ```

3. **Остановите контейнер**:
   ```bash
   docker-compose down
   ```

## 📦 Доступные команды

### Разработка

- `npm run dev` - Запуск development сервера
- `npm run build` - Production сборка
- `npm run start` - Запуск production сервера

### Качество кода

- `npm run lint` - Проверка ESLint
- `npm run type-check` - Проверка TypeScript типов
- `npm run format` - Форматирование кода с Prettier
- `npm run format:check` - Проверка форматирования без изменений

### API

- `npm run generate:api` - Генерация API клиента из Swagger спецификации

## 🔌 Интеграция с Backend API

Проект использует автоматическую генерацию клиента API из OpenAPI/Swagger спецификации FastAPI backend.

### Генерация API клиента

1. **Убедитесь, что backend запущен** на `http://localhost:8000`

2. **Сгенерируйте клиент**:
   ```bash
   npm run generate:api
   ```

Сгенерированные файлы будут находиться в `src/lib/api/generated/`.

### Использование API клиента

```typescript
import { Configuration, DefaultApi } from '@/lib/api/generated';

const config = new Configuration({
	basePath: process.env.NEXT_PUBLIC_API_URL,
});

const api = new DefaultApi(config);

// Пример использования
const data = await api.someEndpoint();
```

## 🌍 Переменные окружения

Создайте файл `.env.local` на основе `.env.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_PATH=/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=PolystirolHub
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Важно**: Переменные с префиксом `NEXT_PUBLIC_` доступны в браузере.

## 🏗️ Структура проекта

```
polystirolhub-frontend/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
├── public/                  # Статические файлы
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React компоненты
│   └── lib/
│       └── api/
│           └── generated/   # Автогенерированный API клиент
├── .dockerignore
├── .env.example
├── .env.local              # Локальные переменные (не в git)
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── openapitools.json       # Конфигурация OpenAPI генератора
├── package.json
└── tsconfig.json
```

## 🔄 CI/CD и Стратегия веток

Проект использует **Git Flow** стратегию с автоматическими проверками и деплоем.

### Структура веток

- **`main`** - Production ветка (автодеплой на production)
- **`dev`** - Development ветка (автодеплой на staging)
- **`feat/*`** - Новые функции
- **`fix/*`** - Исправления багов
- **`style/*`** - Стилизация и UI

Подробная документация: [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)

### CI Pipeline (`.github/workflows/ci.yml`)

Запускается при:

- Push в `main`, `dev`, `feat/*`, `fix/*`, `style/*`
- Pull Request в `main` или `dev`

**Jobs:**

1. **Lint & Type Check** (Node.js 18 и 20)
   - ✅ ESLint
   - ✅ TypeScript type checking
   - ✅ Prettier форматирование

2. **Build Application**
   - ✅ Production build
   - ✅ Сохранение build artifacts

3. **Docker Build** (только для `main` и `dev`)
   - ✅ Multi-stage Docker build
   - ✅ Кэширование слоев

### Deploy Pipeline (`.github/workflows/deploy.yml`)

Запускается при push в `main` или `dev`:

- **main** → Production deployment
- **dev** → Staging deployment

### Workflow для разработки

```bash
# Создать feature ветку
git checkout dev
git pull origin dev
git checkout -b feat/my-feature

# Разработка и коммиты
git add .
git commit -m "feat: add new feature"

# Push и создание PR
git push origin feat/my-feature
# Создайте PR в dev через GitHub
```

### Настройка GitHub Secrets

Для деплоя настройте secrets в repository settings:

**Production (`main`):**

- `PROD_API_URL` - URL production API
- `PROD_DEPLOY_KEY` - SSH ключ (опционально)

**Staging (`dev`):**

- `DEV_API_URL` - URL staging API
- `DEV_DEPLOY_KEY` - SSH ключ (опционально)

## 🐳 Docker

### Multi-stage сборка

Dockerfile использует multi-stage build для оптимизации размера образа:

1. **deps**: Установка production зависимостей
2. **builder**: Сборка приложения
3. **runner**: Финальный минимальный образ

### Безопасность

- Использование Alpine Linux (минимальный размер)
- Non-root пользователь
- Только production зависимости в финальном образе

## 📝 Рекомендации по разработке

### Code Style

Проект использует Prettier для автоматического форматирования кода. Перед коммитом запустите:

```bash
npm run format
```

### Типизация

Используйте строгую типизацию TypeScript. Избегайте `any`.

### Компоненты

- Создавайте переиспользуемые компоненты в `src/components/`
- Используйте TypeScript типы/интерфейсы
- Документируйте сложные компоненты

## 🚦 Готово к deployment

После завершения разработки:

1. **Проверьте все тесты**:

   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

2. **Соберите Docker образ**:

   ```bash
   docker build -t polystirolhub-frontend .
   ```

3. **Запустите на production сервере** через docker-compose

## 🤝 Contributing

Мы используем Git Flow для управления ветками. Пожалуйста, ознакомьтесь с [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md).

**Быстрый старт:**

1. Fork репозитория
2. Создайте feature branch из `dev`:
   ```bash
   git checkout dev
   git checkout -b feat/amazing-feature
   ```
3. Делайте коммиты следуя [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. Push в ваш fork:
   ```bash
   git push origin feat/amazing-feature
   ```
5. Откройте Pull Request в `dev` ветку

**CI проверит:**

- ESLint
- TypeScript
- Prettier
- Build

После одобрения, ваш PR будет смержен в `dev`.

## 📄 License

[Укажите лицензию]

## 📞 Контакты

[Укажите контактную информацию]
