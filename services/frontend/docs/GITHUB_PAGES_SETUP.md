# Настройка деплоя на GitHub Pages

## Автоматический деплой

Проект настроен для автоматического деплоя на GitHub Pages при каждом push в ветки `main` или `master`, если изменяются файлы в папке `services/frontend/`.

## Настройка репозитория

### 1. Включение GitHub Pages

1. Перейдите в настройки репозитория: `Settings` → `Pages`
2. В разделе "Source" выберите "GitHub Actions"
3. Сохраните настройки

### 2. Настройка прав доступа

1. Перейдите в `Settings` → `Actions` → `General`
2. В разделе "Workflow permissions" выберите "Read and write permissions"
3. Включите "Allow GitHub Actions to create and approve pull requests"

## Структура деплоя

- **Workflow файл**: `.github/workflows/deploy-frontend.yml`
- **Сборка**: Используется скрипт `npm run build` с переменной `NODE_ENV=production`
- **Base path**: `/playlisto/` (настроен в `vite.config.ts`)
- **Router basename**: `/playlisto` в production (настроен в `Router.tsx`)
- **Оптимизация бандлов**: Настроено разделение vendor библиотек на отдельные чанки для лучшей производительности

## Локальная сборка для GitHub Pages

Для тестирования сборки локально:

```bash
cd services/frontend
npm run build:github
```

## URL приложения

После настройки приложение будет доступно по адресу:
`https://[username].github.io/playlisto/`

где `[username]` - имя пользователя GitHub или организации.

## Troubleshooting

### Проблема с путями

Если приложение не загружается корректно, проверьте:
1. Правильность настройки `base` в `vite.config.ts`
2. Что все ссылки в приложении используют относительные пути
3. Что роутинг настроен для работы с подпапкой

### Проблема с правами доступа

Если деплой не запускается:
1. Убедитесь, что в настройках репозитория включены GitHub Actions
2. Проверьте права доступа в `Settings` → `Actions` → `General`
3. Убедитесь, что workflow файл находится в правильной ветке

### Проблема с роутингом

Если при заходе на сайт появляется ошибка "No routes matched location":
1. Убедитесь, что в `Router.tsx` настроен правильный `basename`
2. Проверьте, что `basename` соответствует `base` в `vite.config.ts`
3. Убедитесь, что все ссылки в приложении используют относительные пути

**Важно**: `basename` в роутере должен быть `/playlisto` (без слэша в конце), а `base` в Vite должен быть `/playlisto/` (со слэшем в конце).

## Оптимизация бандлов

Проект настроен для оптимальной загрузки с разделением vendor библиотек на отдельные чанки:

- **react-vendor**: React и React DOM
- **router-vendor**: React Router DOM
- **ui-vendor**: Все компоненты Radix UI
- **dnd-vendor**: Drag and Drop библиотеки
- **utils-vendor**: Zustand, утилиты для стилей
- **icons-vendor**: Lucide React иконки
- **media-vendor**: Парсеры медиа файлов
