# Миграция с Vite + React Router на Next.js + SSG

Этот документ описывает миграцию проекта с Vite и React Router на Next.js с Static Site Generation (SSG).

## Причины миграции

**Проблема**: При деплое на GitHub Pages становилась невозможной прямая навигация по URL'ам отличным от корневого (CSR проблема).

**Решение**: Переход на Next.js с SSG позволяет генерировать статические HTML файлы для всех маршрутов, что решает проблему навигации на GitHub Pages.

## Основные изменения

### 1. Структура проекта

**До** (Vite):
```
src/
├── pages/               # Компоненты страниц
│   ├── HomePage.tsx
│   ├── PlaylistPage.tsx
│   └── SettingsPage.tsx
├── Router.tsx          # Конфигурация React Router
├── App.tsx             # Корневой компонент
└── main.tsx            # Точка входа
```

**После** (Next.js):
```
src/
├── app/                # Next.js App Router
│   ├── layout.tsx      # Корневой layout
│   ├── page.tsx        # Главная страница
│   ├── playlist/[id]/page.tsx  # Динамический маршрут
│   └── settings/page.tsx       # Страница настроек
└── ... (остальная структура без изменений)
```

### 2. Зависимости

**Удалено**:
- `vite` и `@vitejs/plugin-react-swc`
- `react-router-dom`
- `@tailwindcss/vite`

**Добавлено**:
- `next` - фреймворк для React с SSG

**Сохранено**:
- `react`, `react-dom` - React библиотеки
- `tailwindcss` - стилизация
- `zustand` - управление состоянием
- Все остальные UI библиотеки

### 3. Конфигурация

#### Tailwind CSS 4 + PostCSS

Для работы Tailwind CSS 4 в Next.js создан `postcss.config.js`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

И добавлена зависимость `@tailwindcss/postcss` в `package.json`.

#### vite.config.ts → next.config.js

**До**:
```typescript
export default {
  base: process.env.NODE_ENV === 'production' ? '/playlisto/' : '/',
  plugins: [react(), tailwindcss()],
  // ...
}
```

**После**:
```javascript
module.exports = {
  basePath: process.env.NODE_ENV === 'production' ? '/playlisto' : '',
  output: 'export',
  images: { unoptimized: true },
  // ...
}
```

**Полифилл для Vite совместимости**:

В `next.config.js` добавлен webpack DefinePlugin для совместимости с кодом Vite:
```javascript
webpack.DefinePlugin({
  'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV),
  'import.meta.env.PROD': process.env.NODE_ENV === 'production',
  'import.meta.env.DEV': process.env.NODE_ENV === 'development',
  'import.meta.env.SSR': false,
})
```

Это позволяет коду с `import.meta.env` работать в Next.js без изменений.

#### tsconfig.json

Обновлен для Next.js:
- Добавлен плагин `next`
- Обновлены `include` и `exclude`
- Настроен `jsx: "preserve"`

### 4. Навигация

#### React Router → Next.js Navigation

**До**:
```tsx
import { useNavigate, useParams, Link } from 'react-router-dom';

const navigate = useNavigate();
navigate('/playlist/123');

const { id } = useParams();
```

**После**:
```tsx
import { useRouter } from 'next/navigation';
import { use } from 'react';

const router = useRouter();
router.push('/playlist/123');

// В компоненте страницы
function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
}
```

### 5. Страницы

Все страницы переписаны под Next.js App Router:

#### Главная страница
- **До**: `src/pages/HomePage.tsx`
- **После**: `src/app/page.tsx`

#### Детальная страница плейлиста
- **До**: `src/pages/PlaylistPage.tsx` (использует `useParams`)
- **После**: `src/app/playlist/[id]/page.tsx` (использует props `params`)

#### Страница настроек
- **До**: `src/pages/SettingsPage.tsx`
- **После**: `src/app/settings/page.tsx`

### 6. Layout

**До**: Использовался `Root.tsx` с `<Outlet />` из React Router

**После**: Используется `app/layout.tsx` с Next.js layout pattern:
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <SidebarProvider>
            <Sidebar />
            <SidebarInset>
              <Header />
              <main>{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
```

### 7. Скрипты

**package.json**:
```json
{
  "scripts": {
    "dev": "next dev --hostname playlisto.local --port 8443",
    "build": "next build",
    "start": "next start"
  }
}
```

## Преимущества миграции

1. **Решена проблема с навигацией на GitHub Pages** - все маршруты генерируются статически
2. **SSG (Static Site Generation)** - страницы генерируются при сборке, улучшая производительность
3. **Автоматическая оптимизация** - Next.js автоматически оптимизирует бандлы и код
4. **Лучшая производительность** - автоматический code splitting по маршрутам
5. **SEO улучшения** - статический HTML для всех страниц

## Совместимость

### Что осталось без изменений

1. **Структура доменов** - вся бизнес-логика в `domains/` не изменилась
2. **Stores** - Zustand stores работают без изменений
3. **Infrastructure слой** - все API, services, storage работают как прежде
4. **UI компоненты** - все компоненты в `shared/components/` остались без изменений
5. **IndexedDB** - хранение данных работает так же

### Что требует внимания

1. **Клиентские компоненты** - компоненты с хуками или состоянием должны быть помечены `'use client'`
2. **Навигация** - использовать `useRouter` из `next/navigation` вместо React Router
3. **Динамические параметры** - использовать `params` props вместо `useParams`

## Тестирование после миграции

1. Установить зависимости: `rush update`
2. Запустить dev сервер: `rushx dev`
3. Проверить все маршруты:
   - `/` - главная
   - `/playlist/[id]` - детальная плейлиста
   - `/settings` - настройки
4. Собрать для production: `rushx build`
5. Проверить папку `out/` на наличие статических файлов

## GitHub Actions

При деплое на GitHub Pages workflow должен быть обновлен:

```yaml
- name: Build
  run: |
    cd services/frontend
    rush update
    rushx build
  
- name: Upload artifact
  uses: actions/upload-pages-artifact@v2
  with:
    path: services/frontend/out
```

## Дополнительные ресурсы

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Deploying to GitHub Pages](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports#github-pages)

