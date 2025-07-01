# Domain-Driven Architecture with Zustand

## Обзор архитектуры

Проект использует Domain-Driven Design (DDD) подход с Zustand для управления состоянием. Архитектура разделена на четкие слои и домены для лучшей масштабируемости и поддерживаемости.

## Структура проекта

```
src/
├── domains/                    # Функциональные домены
│   ├── playlists/             # Управление плейлистами
│   │   ├── components/        # UI компоненты домена
│   │   ├── store/            # Zustand store
│   │   └── types/            # Типы домена (опционально)
│   └── spotify/              # Интеграция со Spotify
│       ├── components/       # UI компоненты домена
│       ├── store/           # Zustand store
│       └── types/           # Типы домена (опционально)
├── shared/                   # Общие ресурсы
│   ├── components/          # Переиспользуемые UI компоненты
│   ├── types/              # Общие типы
│   └── utils/              # Утилиты
├── infrastructure/          # Инфраструктурный слой
│   ├── storage/            # Работа с хранилищем
│   ├── api/               # API клиенты
│   └── config/            # Конфигурация
└── app/                    # Корневой уровень приложения
    ├── App.tsx
    ├── providers.tsx       # Провайдеры для инициализации
    └── main.tsx
```

## Домены

### Playlists Domain

Управление плейлистами и треками.

**Store:** `domains/playlists/store/playlist-store.ts`
- `currentPlaylist` - текущий выбранный плейлист
- `playlists` - список всех плейлистов
- `isLoading` - состояние загрузки
- `error` - ошибки
- `addPlaylist()` - добавление плейлиста
- `removePlaylist()` - удаление плейлиста
- `updatePlaylist()` - обновление плейлиста
- `loadPlaylists()` - загрузка плейлистов

**Компоненты:**
- `AppSidebar` - боковая панель с плейлистами
- `TrackList` - список треков

### Spotify Domain

Интеграция со Spotify API.

**Store:** `domains/spotify/store/spotify-store.ts`
- `authStatus` - статус авторизации
- `isLoading` - состояние загрузки
- `error` - ошибки
- `login()` - авторизация
- `logout()` - выход
- `refreshUserProfile()` - обновление профиля
- `initializeSpotify()` - инициализация
- `handleSpotifyCallback()` - обработка callback

## Инфраструктурный слой

### Storage

Абстракция для работы с хранилищем данных.

**Файл:** `infrastructure/storage/indexed-db.ts`
- `IndexedDBStorage` - реализация для IndexedDB
- `StorageService` - интерфейс для хранилища

### API

API клиенты для внешних сервисов.

**Файл:** `infrastructure/api/spotify-api.ts`
- `SpotifyApi` - клиент для Spotify API
- `SpotifyApiClient` - интерфейс API клиента

## Использование

### В компонентах

```tsx
import { usePlaylistStore } from '@/domains/playlists/store/playlist-store'
import { useSpotifyStore } from '@/domains/spotify/store/spotify-store'

function MyComponent() {
  const { currentPlaylist, addPlaylist } = usePlaylistStore()
  const { authStatus, login } = useSpotifyStore()
  
  // Использование состояния и методов
}
```

### Инициализация

```tsx
import { Providers } from '@/app/providers'

function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  )
}
```

## Преимущества новой архитектуры

1. **Четкое разделение ответственности** - каждый домен отвечает за свою область
2. **Масштабируемость** - легко добавлять новые домены и функциональность
3. **Тестируемость** - изолированные домены легче тестировать
4. **Переиспользование** - общие компоненты и утилиты в shared
5. **Производительность** - Zustand обеспечивает эффективное обновление компонентов
6. **Типобезопасность** - строгая типизация TypeScript

## Миграция с контекстов

Старые React Context были заменены на Zustand stores:

- `PlaylistContext` → `usePlaylistStore`
- `SpotifyContext` → `useSpotifyStore`

Это обеспечивает:
- Лучшую производительность
- Меньше boilerplate кода
- Более простое тестирование
- Лучшую интеграцию с DevTools

## Следующие шаги

1. Добавить обработку ошибок и уведомления
2. Реализовать кэширование данных
3. Добавить unit тесты для stores
4. Оптимизировать производительность (React.memo, useMemo)
5. Добавить документацию API 