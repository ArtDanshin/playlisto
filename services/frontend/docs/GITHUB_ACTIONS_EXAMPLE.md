# Пример GitHub Actions Workflow для деплоя Next.js на GitHub Pages

Этот документ содержит пример workflow файла для автоматического деплоя Next.js приложения на GitHub Pages.

## Файл workflow

Создайте файл `.github/workflows/deploy-frontend.yml` в корне репозитория:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: ['main', 'master']
    paths:
      - 'services/frontend/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: next
      
      - name: Install Rush
        run: npm install -g @microsoft/rush
      
      - name: Install dependencies
        run: |
          rush update
      
      - name: Build Frontend
        run: |
          cd services/frontend
          rushx build
        env:
          NODE_ENV: production
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./services/frontend/out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Объяснение workflow

### Триггеры

```yaml
on:
  push:
    branches: ['main', 'master']
    paths:
      - 'services/frontend/**'
  workflow_dispatch:
```

- Запускается при push в ветки `main` или `master`
- Только если изменились файлы в `services/frontend/`
- Можно запустить вручную через GitHub UI

### Права доступа

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Необходимые права для работы с GitHub Pages.

### Job: Build

1. **Checkout** - клонирует репозиторий
2. **Setup Node.js** - устанавливает Node.js 20
3. **Setup Pages** - конфигурирует GitHub Pages для Next.js
4. **Install Rush** - устанавливает Rush для monorepo
5. **Install dependencies** - устанавливает зависимости через Rush
6. **Build Frontend** - собирает Next.js приложение
7. **Upload artifact** - загружает собранные файлы из папки `out/`

### Job: Deploy

Деплоит собранные файлы на GitHub Pages.

## Альтернативный вариант без Rush

Если проект не использует Rush monorepo:

```yaml
- name: Install dependencies
  run: |
    cd services/frontend
    npm ci

- name: Build Frontend
  run: |
    cd services/frontend
    npm run build
  env:
    NODE_ENV: production
```

## Настройка репозитория

После создания workflow файла:

1. Перейдите в `Settings` → `Pages`
2. В разделе "Source" выберите **GitHub Actions**
3. Убедитесь, что workflow permissions включены в `Settings` → `Actions` → `General`

## Проверка деплоя

После push изменений:

1. Перейдите во вкладку **Actions**
2. Найдите запущенный workflow
3. Дождитесь завершения обоих jobs (build и deploy)
4. Откройте URL приложения: `https://[username].github.io/playlisto/`

## Troubleshooting

### Workflow не запускается

- Проверьте, что файл находится в правильной директории: `.github/workflows/`
- Убедитесь, что вы push'нули в правильную ветку
- Проверьте `paths` фильтр - он должен соответствовать вашей структуре проекта

### Ошибка при build

- Проверьте логи в разделе Actions
- Убедитесь, что `next.config.js` настроен правильно
- Проверьте, что `output: 'export'` указан в конфигурации

### Приложение не загружается после деплоя

- Проверьте `basePath` в `next.config.js`
- Убедитесь, что артефакт загружается из правильной папки (`out/`)
- Проверьте console в браузере на наличие ошибок с путями

## Дополнительные возможности

### Cache dependencies

Для ускорения сборки можно кешировать node_modules:

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      **/node_modules
      ~/.rush
    key: ${{ runner.os }}-rush-${{ hashFiles('**/rush.json', '**/package.json') }}
```

### Notify on deploy

Добавить уведомления о результатах деплоя:

```yaml
- name: Notify on success
  if: success()
  run: echo "Deploy successful!"
  
- name: Notify on failure
  if: failure()
  run: echo "Deploy failed!"
```

## Ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

