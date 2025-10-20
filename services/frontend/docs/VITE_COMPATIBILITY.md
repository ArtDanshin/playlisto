# Совместимость с Vite: import.meta.env

## Проблема

При миграции с Vite на Next.js возникла проблема с `import.meta.env`, который используется в коде:

```typescript
// Vite синтаксис
const isTest = import.meta.env.MODE === 'test';
const basePath = import.meta.env.PROD ? '/playlisto' : '';
```

В Next.js `import.meta.env` не существует по умолчанию, вместо этого используется `process.env.NODE_ENV`.

## Решение

В `next.config.js` добавлен webpack DefinePlugin, который создает полифилл для `import.meta.env`:

```javascript
webpack: (config, { webpack }) => {
  // ...
  
  // Полифилл для import.meta.env (совместимость с Vite)
  config.plugins.push(
    new webpack.DefinePlugin({
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV),
      'import.meta.env.PROD': process.env.NODE_ENV === 'production',
      'import.meta.env.DEV': process.env.NODE_ENV === 'development',
      'import.meta.env.SSR': false,
    })
  );
  
  return config;
}
```

## Что это дает

Код из Vite продолжает работать без изменений:

### Определение окружения

```typescript
// Работает в обоих фреймворках
const isTest = import.meta.env.MODE === 'test';
const isDev = import.meta.env.MODE === 'development';
const isProd = import.meta.env.MODE === 'production';
```

### Булевые флаги

```typescript
// Работает в обоих фреймворках
if (import.meta.env.PROD) {
  // Production код
}

if (import.meta.env.DEV) {
  // Development код
}
```

## Где используется

В проекте `import.meta.env` используется в следующих местах:

1. **Stores** - для переключения между mock и реальными реализациями:
   - `src/domains/playlists/store/index.ts`
   - `src/domains/spotifySource/store/index.ts`

2. **Services** - для переключения между mock и реальными реализациями:
   - `src/infrastructure/services/playlisto-db/index.ts`
   - `src/infrastructure/services/spotify/index.ts`
   - `src/infrastructure/services/file/index.ts`

3. **Configs** - для определения базового пути:
   - `src/infrastructure/configs/spotify.ts`

## Маппинг значений

| Vite                     | Next.js                                | Значение в dev | Значение в prod |
|--------------------------|----------------------------------------|----------------|-----------------|
| `import.meta.env.MODE`   | `process.env.NODE_ENV`                 | 'development'  | 'production'    |
| `import.meta.env.PROD`   | `process.env.NODE_ENV === 'production'`| false          | true            |
| `import.meta.env.DEV`    | `process.env.NODE_ENV === 'development'`| true          | false           |
| `import.meta.env.SSR`    | -                                      | false          | false           |

## Примечания

- Полифилл работает только на этапе сборки (compile-time), не в runtime
- Все значения заменяются при компиляции webpack
- Для тестового режима (`MODE === 'test'`) используется та же логика - нужно запустить с `NODE_ENV=test`
- SSR всегда `false`, так как используется статический экспорт (`output: 'export'`)

## Тестирование

Для проверки работы полифилла:

1. Запустите dev сервер:
   ```bash
   rushx dev
   ```

2. Откройте приложение в браузере

3. Проверьте, что:
   - Приложение загружается без ошибок
   - Используются правильные (не mock) stores и services
   - Spotify конфиг использует правильный базовый путь

## Альтернативные подходы

Если потребуется больше гибкости, можно:

1. **Создать глобальный полифилл модуль**:
   ```typescript
   // src/env.ts
   export const env = {
     MODE: process.env.NODE_ENV,
     PROD: process.env.NODE_ENV === 'production',
     DEV: process.env.NODE_ENV === 'development',
   };
   ```

2. **Использовать Next.js переменные окружения**:
   - Создать `.env.local` с `NEXT_PUBLIC_*` переменными
   - Использовать `process.env.NEXT_PUBLIC_*` в коде

Но текущее решение через DefinePlugin оптимальное, так как не требует изменений в существующем коде.

