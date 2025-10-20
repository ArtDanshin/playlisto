# Резюме миграции на Next.js

## Что было сделано

✅ **Полная миграция с Vite + React Router на Next.js 15 с SSG**

### Основные изменения

1. **Обновлен package.json**
   - Добавлен `next@15.1.6`
   - Добавлен `@tailwindcss/postcss@4.1.11` для работы Tailwind CSS 4 в Next.js
   - Удалены `vite`, `react-router-dom`, `@vitejs/plugin-react-swc`, `@tailwindcss/vite`
   - Обновлены скрипты: `dev`, `build`, `start`

2. **Создана структура Next.js App Router**
   - `src/app/layout.tsx` - корневой layout
   - `src/app/page.tsx` - главная страница
   - `src/app/playlist/[id]/page.tsx` - динамическая страница плейлиста
   - `src/app/settings/page.tsx` - страница настроек

3. **Создан next.config.js**
   - Настроен `basePath: '/playlisto'` для GitHub Pages
   - Включен `output: 'export'` для статического экспорта
   - Отключена оптимизация изображений для статического экспорта
   - Добавлен webpack DefinePlugin для полифилла `import.meta.env` (совместимость с Vite)

4. **Создан server.js** - custom server с поддержкой HTTPS
   - Использует SSL сертификаты из папки `ssl/`
   - Запускает Next.js на https://playlisto.local:8443
   - Автоматически проверяет наличие сертификатов

5. **Обновлен tsconfig.json**
   - Добавлена конфигурация для Next.js
   - Добавлен плагин `next`

6. **Обновлена навигация**
   - `Button.tsx` теперь использует `useRouter` из `next/navigation`
   - Удален старый `Router.tsx` с React Router конфигурацией

7. **Удалены устаревшие файлы**
   - `src/Router.tsx`
   - `src/App.tsx`
   - `src/main.tsx`
   - `index.html`
   - `vite.config.ts`
   - `vite.config.test.ts`
   - Старые файлы в `src/pages/`
   - `src/layout/Root/`

8. **Обновлена документация**
   - `ARCHITECTURE.md` - обновлена структура проекта
   - `DEVELOPMENT.md` - обновлены команды и стек
   - `TASKS.md` - отмечена выполненная задача
   - `GITHUB_PAGES_SETUP.md` - обновлены инструкции для Next.js
   - `README.md` - обновлен список технологий
   - Создан `MIGRATION_NEXTJS.md` - детальное руководство по миграции
   - Создан `GITHUB_ACTIONS_EXAMPLE.md` - пример workflow

9. **Создан postcss.config.js**
   - Добавлена конфигурация PostCSS для Tailwind CSS 4
   - Используется плагин `@tailwindcss/postcss`

10. **Обновлен .gitignore**
   - Добавлены Next.js специфичные записи (`.next/`, `out/`, `next-env.d.ts`)

11. **Создана public директория**
   - Добавлен `.nojekyll` для GitHub Pages

## Что осталось без изменений

✨ **Вся бизнес-логика осталась нетронутой**:
- Все домены (`domains/`)
- Все stores (Zustand)
- Вся инфраструктура (`infrastructure/`)
- Все UI компоненты (`shared/components/`)
- Все layout компоненты
- IndexedDB интеграция
- Spotify API интеграция
- Storybook конфигурация

## Следующие шаги

### 1. Тестирование локально

```bash
cd services/frontend
rushx dev
```

Проверьте все страницы:
- http://playlisto.local:8443/
- http://playlisto.local:8443/playlist/[any-id]
- http://playlisto.local:8443/settings

### 2. Сборка для production

```bash
rushx build
```

Проверьте папку `out/` - там должны быть статические файлы.

### 3. Обновите GitHub Actions workflow

Используйте пример из `docs/GITHUB_ACTIONS_EXAMPLE.md` для создания/обновления `.github/workflows/deploy-frontend.yml`.

Основные изменения:
- Путь к артефакту: `services/frontend/out` (вместо `dist`)
- Команда сборки: `rushx build` (без переменных окружения)

### 4. Проверьте деплой на GitHub Pages

После push изменений проверьте:
1. Workflow запустился успешно
2. Приложение доступно по `https://[username].github.io/playlisto/`
3. Навигация работает корректно
4. Прямые переходы по URL работают

## Преимущества миграции

✅ **Решена проблема навигации на GitHub Pages** - все маршруты теперь статические  
✅ **Улучшена производительность** - SSG и автоматическая оптимизация  
✅ **Лучший SEO** - статический HTML для всех страниц  
✅ **Автоматический code splitting** - по маршрутам  
✅ **Современный стек** - Next.js 15 + React 19  

## Возможные проблемы

### HTTPS в dev режиме

✅ **Решено**: Создан custom server (`server.js`) с поддержкой HTTPS.

Проект автоматически использует SSL сертификаты из папки `ssl/`:
- `rushx dev` - запускает с HTTPS (https://playlisto.local:8443)
- `rushx dev:http` - запускает без HTTPS (если нужно)

Если сертификаты отсутствуют, создайте их:
```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/playlisto.local-key.pem -out ssl/playlisto.local-cert.pem -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=Playlisto/OU=Development/CN=playlisto.local"
```

### Storybook warnings

Storybook требует vite как peer dependency. Это нормально и не влияет на работу основного приложения. Storybook продолжит работать с собственной конфигурацией Vite.

## Дополнительные ресурсы

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Deploying Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [MIGRATION_NEXTJS.md](./docs/MIGRATION_NEXTJS.md) - детальное руководство

---

**Статус**: ✅ Миграция завершена  
**Дата**: 2025-10-19  
**Версия Next.js**: 15.1.6  
**Версия React**: 19.1.1

