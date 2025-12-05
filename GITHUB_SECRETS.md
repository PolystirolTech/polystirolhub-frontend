# Настройка GitHub Secrets для автодеплоя

Инструкция по настройке секретов в GitHub для автоматического развертывания на dev сервер.

## Что такое GitHub Secrets?

GitHub Secrets - это зашифрованные переменные окружения, которые используются в GitHub Actions workflows. Они позволяют безопасно хранить чувствительную информацию (SSH ключи, пароли, API tokens) без их раскрытия в коде.

## Необходимые секреты для dev окружения

Для работы автодеплоя на dev сервер необходимо настроить следующие секреты:

| Секрет | Описание | Пример значения |
|--------|----------|-----------------|
| `DEV_SSH_HOST` | IP адрес или hostname dev сервера | `10.0.0.5` или `dev.polystirolhub.com` |
| `DEV_SSH_USER` | Username для SSH подключения | `ubuntu` или `deploy` |
| `DEV_SSH_KEY` | Приватный SSH ключ | Содержимое файла `~/.ssh/id_rsa` |
| `DEV_SSH_PORT` | Порт SSH (опционально, по умолчанию 22) | `22` или `2222` |
| `DEV_PROJECT_PATH` | Полный путь к проекту на сервере | `/home/ubuntu/polystirolhub-frontend` |
| `DEV_API_URL` | URL backend API на dev сервере | `http://10.0.0.5:8000` или `https://api-dev.polystirolhub.com` |
| `DEV_APP_URL` | URL где доступен фронтенд | `http://10.0.0.5:3000` или `https://dev.polystirolhub.com` |

## Пошаговая инструкция

### 1. Подготовка SSH ключа

#### Вариант А: Использовать существующий SSH ключ

Если у вас уже есть SSH ключ для доступа к серверу:

```bash
# На вашем локальном компьютере
# Скопируйте ПРИВАТНЫЙ ключ
cat ~/.ssh/id_rsa

# или если ключ находится в другом месте
cat /path/to/your/private_key
```

#### Вариант Б: Создать новый SSH ключ

Если нужно создать новый ключ специально для GitHub Actions:

```bash
# На вашем локальном компьютере
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# Скопируйте приватный ключ
cat ~/.ssh/github_deploy_key

# Скопируйте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/github_deploy_key.pub user@your-server
```

**Важно**: Секрет должен содержать ПРИВАТНЫЙ ключ целиком, включая строки:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### 2. Добавление секретов в GitHub

1. **Откройте репозиторий на GitHub**
   - Перейдите в ваш репозиторий `polystirolhub-frontend`

2. **Перейдите в Settings → Secrets and variables → Actions**
   - В верхнем меню нажмите **Settings**
   - В левом меню найдите **Secrets and variables**
   - Нажмите **Actions**

3. **Добавьте секреты для dev окружения**
   
   Нажмите **New repository secret** для каждого секрета:

   #### DEV_SSH_HOST
   - Name: `DEV_SSH_HOST`
   - Secret: IP адрес или hostname вашего dev сервера
   - Нажмите **Add secret**

   #### DEV_SSH_USER
   - Name: `DEV_SSH_USER`
   - Secret: username для SSH (например, `ubuntu`)
   - Нажмите **Add secret**

   #### DEV_SSH_KEY
   - Name: `DEV_SSH_KEY`
   - Secret: Вставьте ВЕСЬ приватный SSH ключ
   - Нажмите **Add secret**

   #### DEV_SSH_PORT (опционально)
   - Name: `DEV_SSH_PORT`
   - Secret: `22` (или другой порт, если используется не стандартный)
   - Нажмите **Add secret**

   #### DEV_PROJECT_PATH
   - Name: `DEV_PROJECT_PATH`
   - Secret: Полный путь, например `/home/ubuntu/polystirolhub-frontend`
   - Нажмите **Add secret**

   #### DEV_API_URL
   - Name: `DEV_API_URL`
   - Secret: URL backend API, например `http://10.0.0.5:8000`
   - Нажмите **Add secret**

   #### DEV_APP_URL
   - Name: `DEV_APP_URL`
   - Secret: URL фронтенда, например `http://10.0.0.5:3000`
   - Нажмите **Add secret**

### 3. Подготовка dev сервера

Убедитесь что на dev сервере:

1. **Установлены необходимые инструменты**:
   ```bash
   # Docker и Docker Compose
   docker --version
   docker-compose --version
   
   # Git
   git --version
   ```

2. **Проект склонирован из Git**:
   ```bash
   cd /path/where/you/want/project
   git clone <your-repo-url> polystirolhub-frontend
   cd polystirolhub-frontend
   git checkout dev
   ```

3. **Создана Docker сеть**:
   ```bash
   docker network create polystirolhub-network
   ```

4. **SSH ключ GitHub Actions добавлен в authorized_keys**:
   ```bash
   # Если используете новый ключ, созданный специально для GitHub Actions
   echo "your-public-key-content" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

### 4. Тестирование подключения

Проверьте что SSH подключение работает:

```bash
# С вашего локального компьютера
ssh -i ~/.ssh/your_key user@your-server

# Если подключение успешно, проверьте что можете выполнить команды
cd /path/to/project
git pull origin dev
docker-compose ps
```

## Проверка настроек

### Как проверить что секреты настроены

1. Перейдите в **Settings → Secrets and variables → Actions**
2. Вы должны увидеть все 7 секретов (или 6, если не указали DEV_SSH_PORT)
3. Значения секретов скрыты для безопасности

### Тестовый деплой

Чтобы протестировать автодеплой:

1. Сделайте любое небольшое изменение в коде
2. Закоммитьте и запушьте в dev ветку:
   ```bash
   git add .
   git commit -m "test: testing auto-deploy"
   git push origin dev
   ```

3. Перейдите в **Actions** на GitHub
4. Вы должны увидеть запущенный workflow "Deploy"
5. Кликните на него чтобы посмотреть логи

### Что происходит при деплое

Когда вы пушите в `dev` ветку, GitHub Actions:

1. ✅ Подключается к вашему dev серверу по SSH
2. ✅ Переходит в директорию проекта
3. ✅ Делает `git pull origin dev`
4. ✅ Создает `.env.production` с секретами
5. ✅ Останавливает старый контейнер
6. ✅ Собирает новый Docker образ
7. ✅ Запускает новый контейнер
8. ✅ Удаляет старые образы

Весь процесс занимает обычно 2-3 минуты.

## Troubleshooting

### Ошибка: "Permission denied (publickey)"

**Проблема**: SSH ключ не настроен правильно

**Решение**:
1. Убедитесь что публичный ключ добавлен в `~/.ssh/authorized_keys` на сервере
2. Проверьте права: `chmod 600 ~/.ssh/authorized_keys`
3. Убедитесь что в секрет `DEV_SSH_KEY` скопирован ПРИВАТНЫЙ ключ целиком

### Ошибка: "No such file or directory"

**Проблема**: Неправильный путь в `DEV_PROJECT_PATH`

**Решение**:
1. Проверьте что проект действительно находится по указанному пути
2. Используйте ПОЛНЫЙ путь, например `/home/ubuntu/polystirolhub-frontend`

### Ошибка: "docker: command not found"

**Проблема**: Docker не установлен или не доступен для пользователя

**Решение**:
1. Установите Docker на сервере
2. Добавьте пользователя в группу docker: `sudo usermod -aG docker $USER`
3. Перелогиньтесь или выполните: `newgrp docker`

### Workflow не запускается

**Проблема**: Возможно, workflow отключен

**Решение**:
1. Перейдите в **Actions** на GitHub
2. Найдите "Deploy" workflow
3. Убедитесь что он включен (Enable workflow)

## Безопасность

> [!CAUTION]
> **Важные правила безопасности**

1. ❌ **Никогда** не коммитьте приватные SSH ключи в Git
2. ❌ **Никогда** не показывайте содержимое GitHub Secrets
3. ✅ **Всегда** используйте отдельный SSH ключ для CI/CD
4. ✅ **Регулярно** ротируйте SSH ключи
5. ✅ **Ограничьте** права доступа для deploy пользователя

## Дополнительная настройка (опционально)

### Настройка для production

Когда будете готовы настроить production деплой, добавьте аналогичные секреты с префиксом `PROD_`:

- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY`
- `PROD_SSH_PORT`
- `PROD_PROJECT_PATH`
- `PROD_API_URL`
- `PROD_APP_URL`

### Notifications

Можно добавить уведомления в Telegram/Discord при успешном/неуспешном деплое. Смотрите Actions Marketplace для соответствующих actions.

## Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
