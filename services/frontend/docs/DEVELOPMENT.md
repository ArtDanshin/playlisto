# Руководство по разработке

## Установка

```bash
rush install
```

## Создание сертификата

```bash
openssl req -x509 -newkey rsa:4096 -keyout ssl/playlisto.local-key.pem -out ssl/playlisto.local-cert.pem -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=Playlisto/OU=Development/CN=playlisto.local"
```

## Запуск команд проекта(команды смотри в `package.json`)

Проект является частью RushJS репозитория, поэтому вместо npm и pnpm команд, используются аналогичные из Rushjs:

- `rush add --package <package-name> --project <project-name>` - Установка зависимости
- `rush update` - Обновление и установка зависимостей после изменения файла `package.json`
- `rushx <npm_команда>` - Для запуска npm скриптов из файла `package.json`
- `rush build` - Сборка проекта и его зависимостей

Частые команды для разработки:

- `rushx dev` - Запуск dev сервера
- `rushx lint` - Запуск проверок линтера
- `rushx lint --fix` - Запуск проверок линтера с автоматическим исправлением возможного
- `rushx storybook` - Запуск storybook сервера

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
