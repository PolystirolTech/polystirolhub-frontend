# Branch Strategy

Этот проект следует Git Flow стратегии ветвления.

## Основные ветки

### `main`

- **Production** ветка
- Всегда стабильна и готова к деплою
- Защищена от прямых коммитов
- Изменения только через PR из `dev`
- CI/CD автоматически деплоит на production

### `dev`

- **Development** ветка
- Интеграционная ветка для разработки
- Изменения из feature-веток мержатся сюда
- CI/CD автоматически деплоит на staging
- Периодически мержится в `main`

## Feature ветки

### `feat/*`

**Новые функции**

- Пример: `feat/user-authentication`, `feat/social-feed`
- Создаются из `dev`
- Мержатся обратно в `dev` через PR
- CI проверяет код при push

### `fix/*`

**Исправления багов**

- Пример: `fix/login-error`, `fix/api-timeout`
- Создаются из `dev`
- Мержатся обратно в `dev` через PR
- CI проверяет код при push

### `style/*`

**Стилизация и UI**

- Пример: `style/update-theme`, `style/responsive-layout`
- Создаются из `dev`
- Мержатся обратно в `dev` через PR
- CI проверяет код при push

## Workflow

### Создание новой фичи

```bash
# Переключиться на dev и получить последние изменения
git checkout dev
git pull origin dev

# Создать новую feature ветку
git checkout -b feat/my-feature

# Разработка...
git add .
git commit -m "feat: add my feature"

# Запушить ветку
git push origin feat/my-feature

# Создать PR в dev через GitHub
```

### Hotfix в production

Для срочных исправлений в production:

```bash
# Создать hotfix ветку из main
git checkout main
git pull origin main
git checkout -b fix/critical-bug

# Исправить баг
git add .
git commit -m "fix: critical bug"

# Создать PR в main И dev
```

## CI/CD Process

### На push в feature ветки (feat/, fix/, style/)

1. ✅ ESLint проверка
2. ✅ TypeScript type checking
3. ✅ Prettier форматирование
4. ✅ Build проверка
5. ✅ Docker build (кэширование)

### На PR в dev

1. ✅ Все проверки из feature веток
2. ✅ Build artifacts сохраняются
3. После merge: автоматический деплой на staging

### На PR в main

1. ✅ Все проверки
2. ✅ Обязательный code review
3. После merge: автоматический деплой на production

## Branch Protection Rules

### Рекомендуемые настройки для `main`:

- ✅ Require pull request reviews (минимум 1)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ❌ Disable force push
- ❌ Disable deletions

### Рекомендуемые настройки для `dev`:

- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ❌ Disable force push (опционально)

## Commit Message Convention

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types:

- `feat`: Новая функция
- `fix`: Исправление бага
- `style`: Изменения стилей (CSS, UI)
- `refactor`: Рефакторинг кода
- `docs`: Документация
- `test`: Тесты
- `chore`: Обслуживание (зависимости, конфиг)
- `perf`: Улучшение производительности

### Примеры:

```bash
feat(auth): add social login
fix(api): handle timeout errors
style(header): update navigation design
docs(readme): add deployment instructions
```

## Environments

| Environment | Branch                       | URL                           | Auto Deploy |
| ----------- | ---------------------------- | ----------------------------- | ----------- |
| Production  | `main`                       | https://polystirolhub.com     | ✅          |
| Staging     | `dev`                        | https://dev.polystirolhub.com | ✅          |
| Feature     | `feat/*`, `fix/*`, `style/*` | -                             | ❌          |

## Secrets Configuration

Необходимо настроить в GitHub Secrets:

### Production (main)

- `PROD_API_URL` - Production API URL
- `PROD_DEPLOY_KEY` - SSH ключ для деплоя (если используется)

### Staging (dev)

- `DEV_API_URL` - Staging API URL
- `DEV_DEPLOY_KEY` - SSH ключ для деплоя (если используется)
