# Настройка Spotify API для Playlisto

## 1. Создание приложения в Spotify Developer Dashboard

1. Перейдите на [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Войдите в свой аккаунт Spotify
3. Нажмите "Create App"
4. Заполните форму:
   - **App name**: Playlisto (или любое другое название)
   - **App description**: Приложение для работы с плейлистами
   - **Website**: `http://localhost:5173` (для разработки)
   - **Redirect URI**: `http://localhost:5173` (для разработки)
   - **API/SDKs**: Web API
5. Примите условия использования и нажмите "Save"

## 2. Получение Client ID

После создания приложения вы получите:
- **Client ID** - скопируйте его
- **Client Secret** - для PKCE flow не нужен

## 3. Настройка Redirect URIs

В настройках вашего приложения в Spotify Dashboard:

1. Перейдите в "Edit Settings"
2. В разделе "Redirect URIs" добавьте:
   - `http://localhost:5173` (для разработки)
   - `https://yourdomain.com` (для продакшена)
3. Нажмите "Save"

## 4. Настройка переменных окружения

### Для разработки:

1. Скопируйте файл `env.example` в `.env`:
   ```bash
   cp env.example .env
   ```

2. Откройте файл `.env` и замените значение:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_actual_spotify_client_id_here
   ```

### Для продакшена:

Создайте соответствующие файлы окружения:
- `.env.production` - для продакшена
- `.env.staging` - для тестирования

## 5. Проверка работы

1. Запустите приложение: `npm run dev`
2. Откройте `http://localhost:5173`
3. Нажмите на иконку пользователя в правом верхнем углу
4. Нажмите "Войти в Spotify"
5. Авторизуйтесь в Spotify
6. После успешной авторизации вы увидите свой профиль

## 6. Scopes (Разрешения)

Приложение запрашивает следующие разрешения:
- `user-read-private` - чтение приватной информации профиля
- `user-read-email` - чтение email адреса
- `playlist-read-private` - чтение приватных плейлистов
- `playlist-read-collaborative` - чтение совместных плейлистов
- `playlist-modify-public` - создание и изменение публичных плейлистов
- `playlist-modify-private` - создание и изменение приватных плейлистов

## 7. Безопасность

- Client Secret не используется в PKCE flow (более безопасно)
- Токены хранятся в localStorage (для продакшена рекомендуется более безопасное хранение)
- Автоматическое обновление токенов при истечении
- **Client ID хранится в переменных окружения** (не в коде)

## 8. Troubleshooting

### Ошибка "Invalid redirect URI"
- Убедитесь, что Redirect URI в Spotify Dashboard точно совпадает с `REDIRECT_URI` в конфигурации
- Для разработки используйте `http://localhost:5173`

### Ошибка "Invalid client"
- Проверьте правильность Client ID в файле `.env`
- Убедитесь, что приложение создано и активно в Spotify Dashboard
- Проверьте, что переменная `VITE_SPOTIFY_CLIENT_ID` установлена

### Токен не обновляется
- Проверьте, что refresh token сохранен в localStorage
- Убедитесь, что приложение имеет необходимые scopes

### Переменная окружения не читается
- Убедитесь, что файл `.env` находится в корне проекта (`services/frontend/`)
- Перезапустите сервер разработки после изменения `.env`
- Проверьте, что переменная начинается с `VITE_`

## 9. Продакшен

Для продакшена:
1. Создайте новое приложение в Spotify Dashboard
2. Добавьте продакшен Redirect URI
3. Создайте файл `.env.production` с продакшен Client ID
4. Рассмотрите использование более безопасного хранения токенов

## 10. Структура файлов

```
services/frontend/
├── .env                    # Ваши переменные окружения (не в git)
├── env.example            # Пример переменных окружения
├── src/lib/spotify-config.ts  # Конфигурация (читает из .env)
└── ...
``` 