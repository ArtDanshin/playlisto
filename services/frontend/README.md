# Фронтенд проекта Playlisto

## Установка

```bash
rush install
```

## Настройка Spotify API

Для работы с Spotify API необходимо настроить переменные окружения:

### Быстрая настройка

```bash
./setup-spotify.sh
```

### Ручная настройка

1. Скопируйте файл с примером переменных:
   ```bash
   cp env.example .env
   ```

2. Получите Client ID в [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

3. Откройте `.env` и замените значение:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_actual_spotify_client_id_here
   ```

📖 Подробная инструкция: [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md)

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

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
