# Руководство по разработке

## Установка

```bash
rush install
```

## Создание сертификата (для HTTPS в dev режиме)

Проект использует custom server (`server.js`) для поддержки HTTPS в dev режиме. Для работы необходимо создать SSL сертификаты:

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/playlisto.local-key.pem -out ssl/playlisto.local-cert.pem -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=Playlisto/OU=Development/CN=playlisto.local"
```

Сертификаты создаются только один раз и действительны 365 дней.

### Настройка для WSL

Если проект работает в WSL, необходимо:

1. **В Windows** добавить в `C:\Windows\System32\drivers\etc\hosts`:
   ```
   127.0.0.1 playlisto.local
   ```

2. Dev сервер автоматически слушает на всех интерфейсах (`0.0.0.0`), поэтому будет доступен из Windows

3. Открывайте в браузере Windows: `https://playlisto.local:8443`

4. При первом запуске браузер покажет предупреждение о самоподписанном сертификате - это нормально, нажмите "Продолжить"

## Запуск команд проекта(команды смотри в `package.json`)

Проект является частью RushJS репозитория, поэтому вместо npm и pnpm команд, используются аналогичные из Rushjs:

- `rush add --package <package-name> --project <project-name>` - Установка зависимости
- `rush update` - Обновление и установка зависимостей после изменения файла `package.json`
- `rushx <npm_команда>` - Для запуска npm скриптов из файла `package.json`
- `rush build` - Сборка проекта и его зависимостей

Частые команды для разработки:

- `rushx dev` - Запуск Next.js dev сервера с HTTPS
  - В WSL: открывайте `https://playlisto.local:8443` в Windows браузере
  - Локально: `https://localhost:8443`
- `rushx dev:http` - Запуск Next.js dev сервера без HTTPS
- `rushx build` - Сборка статического экспорта для GitHub Pages
- `rushx start` - Запуск production сервера (только после build)
- `rushx lint` - Запуск проверок линтера
- `rushx lint --fix` - Запуск проверок линтера с автоматическим исправлением возможного
- `rushx storybook` - Запуск storybook сервера

## Технологический стек

Приложение использует **Next.js 15** с App Router и статическим экспортом (SSG):

- **Next.js 15** - React фреймворк с поддержкой SSG
- **React 19** - UI библиотека
- **TypeScript** - Типизация
- **Tailwind CSS 4** - Стилизация
- **Zustand** - Управление состоянием
- **IndexedDB** - Клиентская БД

### Особенности работы с Next.js

- Все страницы находятся в `src/app/` директории (App Router)
- Для навигации используется `next/navigation` (не React Router)
- Страницы генерируются статически при сборке (`output: 'export'` в next.config.js)
- basePath установлен в `/playlisto` для деплоя на GitHub Pages
- В dev режиме используется custom server (`server.js`) для поддержки HTTPS

## Настройка Spotify API

Для работы с Spotify API необходимо настроить Spotify Client ID:

1. Запустите приложение: `rushx dev`
2. Откройте `https://playlisto.local:8443/`
3. Перейдите в раздел "Настройки"
4. В секции "Spotify API" введите ваш Client ID
5. Нажмите "Сохранить Client ID"

📖 Подробная инструкция: [docs/SPOTIFY.md](./SPOTIFY.md)

## Проблемы

### Нельзя установить новые компоненты с помощью Shadcn CLI

Копируем их вручную

### Spotify API не работает

1. Проверь, что Spotify Client ID настроен в разделе "Настройки" приложения
2. Убедись, что Redirect URI в Spotify Dashboard настроен правильно
