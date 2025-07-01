# Фронтенд проекта Playlisto

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

📖 Подробная инструкция: [docs/SPOTIFY_SETUP.md](./docs/SPOTIFY.md)

## Создание сертификата

```bash
openssl req -x509 -newkey rsa:4096 -keyout ssl/playlisto.local-key.pem -out ssl/playlisto.local-cert.pem -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=Playlisto/OU=Development/CN=playlisto.local"
```

## Запуск команд проекта(команды смотри в `package.json`)

```bash
rushx команда
```

## Технологии

- React 19 - JS фреймворк
- Vite - Сборщик
- Shadcn - Библиотека компонетов
- Tailwindcss - CSS фреймворк
- Spotify Web API - Интеграция с Spotify

## Структура

- `src` - Исходники проекта
- `src/components` - Компоненты, в т.ч. shadcn
- `src/contexts` - React контексты (playlist, spotify)
- `src/lib` - Утилиты и конфигурация (spotify-service, spotify-config)

## Проблемы

### Нельзя установить новые компоненты с помощью Shadcn CLI

Копируем их вручную

### Spotify API не работает

1. Проверьте, что файл `.env` создан и содержит правильный `VITE_SPOTIFY_CLIENT_ID`
2. Убедитесь, что Redirect URI в Spotify Dashboard настроен правильно
3. Перезапустите сервер разработки после изменения `.env`
