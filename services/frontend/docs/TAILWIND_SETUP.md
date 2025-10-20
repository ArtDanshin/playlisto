# Настройка Tailwind CSS 4 в Next.js

## Проблема

После миграции на Next.js стили Tailwind CSS не загружались, потому что Tailwind CSS 4 требует специальной конфигурации PostCSS.

## Решение

### 1. Установлен PostCSS плагин

В `package.json` добавлена зависимость:
```json
{
  "dependencies": {
    "@tailwindcss/postcss": "4.1.11",
    "tailwindcss": "4.1.11"
  }
}
```

### 2. Создан postcss.config.js

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### 3. CSS импортируется в layout

В `src/app/layout.tsx`:
```typescript
import '../index.css';
```

## Структура стилей

### index.css

Использует новый синтаксис Tailwind CSS 4:

```css
@import "tailwindcss";
@import "tw-animate-css";

/* Custom variants */
@custom-variant dark (&:is(.dark *));

/* CSS Variables */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... */
}

/* Theme configuration */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */
}

/* Base styles */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Отличия от Vite

| Vite                      | Next.js                    |
|---------------------------|----------------------------|
| `@tailwindcss/vite` плагин| `@tailwindcss/postcss` + PostCSS |
| Автоматическая обработка  | Требуется `postcss.config.js` |
| Импорт в `main.tsx`       | Импорт в `app/layout.tsx`  |

## Поддерживаемые возможности

✅ **Все возможности Tailwind CSS 4**:
- Utility classes
- Custom variants
- CSS variables
- @layer директивы
- @theme конфигурация
- Responsive design
- Dark mode
- Custom colors (oklch)

✅ **Дополнительные плагины**:
- `tw-animate-css` - анимации
- Custom Shadcn/UI компоненты

## Проверка работы

После настройки:

1. Запустите dev сервер:
   ```bash
   rushx dev
   ```

2. Откройте приложение в браузере

3. Проверьте DevTools:
   - Должны загружаться стили из `index.css`
   - Tailwind utility классы должны работать
   - CSS переменные должны применяться

## Troubleshooting

### Стили не загружаются

1. Убедитесь, что `postcss.config.js` существует
2. Проверьте, что `@tailwindcss/postcss` установлен
3. Проверьте импорт CSS в `app/layout.tsx`
4. Перезапустите dev сервер

### Ошибка "Cannot find module '@tailwindcss/postcss'"

Запустите:
```bash
rush update
```

### Старые стили кэшируются

Очистите кэш Next.js:
```bash
rm -rf .next
rushx dev
```

## Production build

При сборке для production:
```bash
rushx build
```

Next.js автоматически:
- Обработает все Tailwind стили через PostCSS
- Минифицирует CSS
- Удалит неиспользуемые классы (tree-shaking)
- Создаст оптимизированные CSS файлы

## Ссылки

- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [Next.js CSS Documentation](https://nextjs.org/docs/app/building-your-application/styling/css)
- [PostCSS Documentation](https://postcss.org/)

