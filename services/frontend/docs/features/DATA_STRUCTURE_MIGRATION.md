# Миграция структуры данных плейлистов

## Обзор изменений

Мы реорганизовали структуру данных плейлистов для улучшения производительности и расширяемости приложения.

## Новая структура данных

### Playlist
```typescript
type Playlist = {
  id?: number;
  name: string; // Имя плейлиста
  order: number; // Порядок плейлиста в списке плейлистов
  tracks: Array<Track>; // Список треков плейлиста
  createdAt?: string;
  updatedAt?: string;
};
```

### Track
```typescript
type Track = {
  title: string; // Название трека
  artist: string; // Исполнитель
  album: string; // Название альбома
  position: number; // Позиция трека в плейлисте
  coverKey: string; // Ключ обложки трека в базе данных covers
  m3uData?: M3UData; // Данные из M3U файла
  spotifyData?: SpotifyData; // Данные из Spotify API
};
```

### M3UData
```typescript
type M3UData = {
  title: string; // Название трека
  artist: string; // Исполнитель
  url: string; // Путь к файлу
  duration: number; // Длительность трека
};
```

### SpotifyData
```typescript
type SpotifyData = {
  id: string; // ID трека в Spotify
  title: string; // Название трека
  artist: string; // Исполнитель
  album: string; // Название альбома
  coverUrl: string; // URL обложки трека
};
```

## Основные изменения

### 1. Удалены поля
- `spotifyId` - заменено на `spotifyData.id`
- `duration` - перемещено в `m3uData.duration`
- `url` - перемещено в `m3uData.url`
- `isNew` - удалено (больше не используется)

### 2. Добавлены поля
- `album` - название альбома
- `position` - позиция трека в плейлисте
- `m3uData` - структурированные данные из M3U файла
- `spotifyData` - структурированные данные из Spotify API

### 3. Улучшения
- Более четкое разделение данных по источникам
- Лучшая типизация
- Упрощенная структура для отображения
- Поддержка миграции существующих данных

## Миграция данных

Приложение автоматически мигрирует существующие данные при первом запуске после обновления. Старые данные будут преобразованы в новую структуру:

- `spotifyId` → `spotifyData.id`
- `spotifyData` → структурированные `spotifyData`
- `url` и `duration` → `m3uData`
- Добавлены `position` и `album`

## Утилиты

Созданы новые утилиты для работы с данными:

- `createTrackFromM3U()` - создание трека из M3U данных
- `createTrackFromSpotify()` - создание трека из Spotify данных
- `updateTrackWithSpotify()` - обновление трека данными из Spotify
- `getTrackDuration()` - получение длительности трека
- `getSpotifyId()` - получение Spotify ID
- `isTrackLinkedToSpotify()` - проверка связи со Spotify
- `createTrackKey()` - создание ключа для сравнения треков
- `isExactMatch()` - проверка точного совпадения треков

## Обновленные компоненты

Все компоненты обновлены для работы с новой структурой:

- `TrackItem` - отображение треков
- `TrackEditDialog` - редактирование треков
- `BatchSpotifyRecognition` - пакетное распознавание
- `ExportToSpotifyDialog` - экспорт в Spotify
- `UpdatePlaylistDialog` - обновление плейлистов
- `SortableTrackItem` - сортируемые треки

## Преимущества новой структуры

1. **Чистота данных** - четкое разделение по источникам
2. **Производительность** - меньше избыточных данных
3. **Расширяемость** - легко добавлять новые источники данных
4. **Типобезопасность** - лучшая типизация TypeScript
5. **Поддержка** - проще поддерживать и развивать

## Обратная совместимость

- Существующие данные автоматически мигрируются
- Все функции продолжают работать
- Нет потери данных при миграции 