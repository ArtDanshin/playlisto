# Руководство по разработке

## Установка

```bash
rush install
```

## Настройка Spotify API

Для работы с Spotify API необходимо настроить переменные окружения:

1. Скопируйте файл с примером переменных:
   ```bash
   cp env.example .env
   ```

2. Получите Client ID в [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

3. Откройте `.env` и замените значение:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_actual_spotify_client_id_here
   ```

📖 Подробная инструкция: [docs/SPOTIFY.md](./SPOTIFY.md)

## Создание сертификата

```bash
openssl req -x509 -newkey rsa:4096 -keyout ssl/playlisto.local-key.pem -out ssl/playlisto.local-cert.pem -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=Playlisto/OU=Development/CN=playlisto.local"
```

## Запуск команд проекта(команды смотри в `package.json`)

```bash
rushx команда
```

## Проблемы

### Нельзя установить новые компоненты с помощью Shadcn CLI

Копируем их вручную

### Spotify API не работает

1. Проверь, что файл `.env` создан и содержит правильный `VITE_SPOTIFY_CLIENT_ID`
2. Убедись, что Redirect URI в Spotify Dashboard настроен правильно
3. Перезапусти сервер разработки после изменения `.env`
