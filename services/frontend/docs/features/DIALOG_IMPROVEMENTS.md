# Улучшения диалогов обновления и добавления плейлистов

## Исправленные проблемы

### 1. Проблема с переносом текста в кнопках выбора источника

**Проблема**: Текст описания в кнопках выбора источника шел в одну строчку и наезжал друг на друга.

**Решение**: 
- Увеличил высоту кнопок с `h-20` до `h-24`
- Добавил `leading-relaxed` для правильного переноса строк
- Добавил `p-4` для лучшего отступа
- Добавил `whitespace-normal break-words` для принудительного переноса текста

```typescript
// Было
className='h-20 flex flex-col items-center justify-center gap-2'
<div className='text-sm text-muted-foreground'>Загрузить из .m3u или .m3u8 файла</div>

// Стало
className='h-24 flex flex-col items-center justify-center gap-2 p-4'
<div className='text-sm text-muted-foreground leading-relaxed whitespace-normal break-words'>
  Загрузить из .m3u или .m3u8 файла
</div>
```

### 2. Невозможность вернуться к выбору источника

**Проблема**: После выбора источника нельзя было вернуться к выбору другого источника.

**Решение**:
- Добавил кнопку "Назад к выбору источника"
- Реализовал функцию `handleBackToSourceSelection()` для сброса состояния
- Кнопка появляется только когда выбран источник

```typescript
const handleBackToSourceSelection = () => {
  setSelectedSource(null);
  setUploadedPlaylist(null);
  setError(null);
  setSpotifyUrl('');
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};
```

### 3. Отсутствие индикатора прогресса

**Проблема**: Пользователь не понимал, на каком этапе процесса он находится.

**Решение**:
- Добавил индикатор прогресса с шагами
- Реализовал функции `getCurrentStep()` и `getStepDescription()`
- Динамическое описание текущего шага

```typescript
const getCurrentStep = () => {
  if (!selectedSource) return 1;
  if (selectedSource && !uploadedPlaylist) return 2;
  return 3;
};
```

### 4. Потеря данных внешних сервисов при обновлении

**Проблема**: При обновлении плейлиста из внешнего сервиса (например, Spotify) терялись данные `spotifyData`.

**Решение**:
- Улучшил логику слияния плейлистов в `mergePlaylists()`
- Добавил сохранение `m3uData` при обновлении
- Реализовал правильное объединение данных из разных источников

```typescript
// Сохраняем существующие данные (Spotify, обложки и т.д.)
return {
  ...uploadedTrack,
  position: index + 1,
  spotifyData: existingTrack.spotifyData,
  coverKey: existingTrack.coverKey,
  album: existingTrack.album,
  m3uData: existingTrack.m3uData,
};
```

### 5. Неправильная логика сопоставления треков при обновлении

**Проблема**: При обновлении плейлиста из внешнего источника (например, Spotify) использовалась неправильная логика сопоставления треков, что приводило к задваиванию треков и удалению лишних.

**Причина**: Функция `createTrackKey` всегда использовала `artist-title` для сопоставления, независимо от источника. Для Spotify нужно использовать `spotifyData.id`, а для файлов - `artist-title`.

**Решение**: 
- Создал новую функцию `createTrackKeyForSource` которая выбирает правильную логику сопоставления в зависимости от источника
- Для Spotify использует `spotifyData.id` если он есть
- Для файлов использует `artist-title`
- Обновил все функции сравнения треков (`getTrackComparison`, `mergePlaylists`, `handleUpdatePlaylist`)

```typescript
// Новая функция для правильного сопоставления
const createTrackKeyForSource = (track: Track): string => {
  if (selectedSource === 'spotify' && track.spotifyData?.id) {
    // Для Spotify используем spotifyData.id если он есть
    return track.spotifyData.id;
  }
  // Для файлов и других случаев используем artist-title
  return createTrackKey(track);
};
```

### 6. Ограничение на 100 треков при импорте из Spotify

**Проблема**: Spotify API возвращает только первые 100 треков за один запрос. При импорте плейлистов с большим количеством треков (например, 223 трека) остальные треки не загружались.

**Причина**: Использовался только один запрос к API без пагинации.

**Решение**: 
- Добавил новый метод `getPlaylistTracks` в Spotify API для получения треков с поддержкой пагинации
- Создал функцию `getAllPlaylistTracks` которая автоматически получает все треки плейлиста
- Обновил оба диалога (`UniversalUpdatePlaylistDialog` и `UniversalAddPlaylistDialog`) для использования новой функции

```typescript
// Новый метод в Spotify API
async getPlaylistTracks(playlistId: string, limit: number = 50, offset: number = 0): Promise<any> {
  // Запрашиваем только необходимые поля для оптимизации размера ответа
  const fields = [
    'items(track(id,name,artists(id,name),album(id,name,images)))',
    'total',
    'limit',
    'offset',
    'next',
    'previous'
  ].join(',');
  
  return this.apiCall(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=${encodeURIComponent(fields)}`);
}

// Функция для получения всех треков с пагинацией
const getAllPlaylistTracks = async (playlistId: string): Promise<any[]> => {
  const allTracks: any[] = [];
  let offset = 0;
  const limit = 50; // Максимальное количество треков за запрос согласно Spotify API

  while (true) {
    const response = await spotifyApi.getPlaylistTracks(playlistId, limit, offset);
    
    if (!response.items || response.items.length === 0) {
      break; // Больше треков нет
    }

    allTracks.push(...response.items);
    offset += limit;

    // Если получили меньше треков чем limit, значит это последняя страница
    if (response.items.length < limit) {
      break;
    }
  }

  return allTracks;
};
```

### 7. Оптимизация запросов к Spotify API

**Проблема**: Запросы к Spotify API возвращали избыточные данные, что увеличивало размер ответов и время загрузки.

**Причина**: Не использовался параметр `fields` для ограничения возвращаемых полей.

**Решение**: 
- Обновил метод `getPlaylistTracks` для запроса только необходимых полей
- Обновил метод `getPlaylist` для получения только основной информации о плейлисте
- Исправил лимит с 100 на 50 согласно официальной документации Spotify API

```typescript
// Оптимизированный запрос треков плейлиста
async getPlaylistTracks(playlistId: string, limit: number = 50, offset: number = 0): Promise<any> {
  const fields = [
    'items(track(id,name,artists(id,name),album(id,name,images)))',
    'total',
    'limit',
    'offset',
    'next',
    'previous'
  ].join(',');
  
  return this.apiCall(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=${encodeURIComponent(fields)}`);
}

// Оптимизированный запрос информации о плейлисте
async getPlaylist(playlistId: string): Promise<any> {
  const fields = [
    'id',
    'name',
    'description',
    'images',
    'owner(id,display_name)',
    'tracks(total)'
  ].join(',');
  
  return this.apiCall(`/playlists/${playlistId}?fields=${encodeURIComponent(fields)}`);
}

### 8. Добавление длительности треков из Spotify

**Проблема**: При импорте треков из Spotify не заполнялось поле длительности, хотя эта информация доступна в API.

**Причина**: Поле `duration_ms` не запрашивалось из API и не сохранялось в данных трека.

**Решение**: 
- Добавил поле `duration` в интерфейс `SpotifyData`
- Обновил запрос к API для получения `duration_ms`
- Обновил функции конвертации для сохранения длительности
- Обновил функцию `getTrackDuration` для поддержки длительности из Spotify

```typescript
// Обновленный интерфейс SpotifyData
export interface SpotifyData {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // Длительность трека в миллисекундах
}

// Обновленная функция конвертации
const convertSpotifyTrackToTrack = async (spotifyTrack: any, position: number): Promise<Track> => {
  const track: Track = {
    title: spotifyTrack.track.name,
    artist: spotifyTrack.track.artists[0]?.name || 'Unknown Artist',
    album: spotifyTrack.track.album?.name || '',
    position,
    coverKey: '',
    spotifyData: {
      id: spotifyTrack.track.id,
      title: spotifyTrack.track.name,
      artist: spotifyTrack.track.artists[0]?.name || 'Unknown Artist',
      album: spotifyTrack.track.album?.name || '',
      coverUrl: spotifyTrack.track.album?.images?.[0]?.url || '',
      duration: spotifyTrack.track.duration_ms || 0, // Добавлена длительность
    },
  };
  // ... остальной код
};

// Обновленная функция получения длительности
export function getTrackDuration(track: Track): number | undefined {
  if (track.m3uData?.duration) {
    return track.m3uData.duration; // В секундах
  }
  // Для Spotify данных длительность в миллисекундах, конвертируем в секунды
  if (track.spotifyData?.duration) {
    return Math.round(track.spotifyData.duration / 1000);
  }
  return undefined;
}
```
```

## Новые функции

### Индикатор прогресса
- Визуальные кружки с номерами шагов
- Динамическое описание текущего шага
- Отображение "Шаг X из Y"

### Кнопка "Назад"
- Позволяет вернуться к выбору источника
- Сбрасывает все промежуточные данные
- Отключается во время загрузки

### Улучшенная логика слияния
- Сохранение данных из всех источников
- Правильное объединение `spotifyData` и `m3uData`
- Сохранение обложек и метаданных

## Изменения в компонентах

### UniversalUpdatePlaylistDialog
- Добавлен индикатор прогресса (3 шага)
- Добавлена кнопка "Назад"
- Улучшена логика слияния плейлистов
- Исправлены стили кнопок выбора источника

### UniversalAddPlaylistDialog
- Добавлен индикатор прогресса (2 шага)
- Добавлена кнопка "Назад"
- Исправлены стили кнопок выбора источника

### SortablePlaylistItem
- Удалена кнопка обновления из сайдбара
- Упрощен интерфейс

## Примеры использования

### Обновление плейлиста
1. **Шаг 1**: Выбор источника (файл или Spotify)
2. **Шаг 2**: Загрузка данных (файл или ссылка)
3. **Шаг 3**: Настройка параметров синхронизации

### Добавление плейлиста
1. **Шаг 1**: Выбор источника (файл или Spotify)
2. **Шаг 2**: Загрузка данных (файл или ссылка)

## Технические детали

### Сохранение данных источников
```typescript
// При обновлении существующего трека
const updatedTrack = {
  ...existingTrack,
  ...uploadedTrack,
  // Сохраняем данные внешних сервисов
  spotifyData: existingTrack.spotifyData || uploadedTrack.spotifyData,
  m3uData: existingTrack.m3uData || uploadedTrack.m3uData,
  coverKey: existingTrack.coverKey || uploadedTrack.coverKey,
};
```

### Динамические описания шагов
```typescript
const getStepDescription = () => {
  const step = getCurrentStep();
  switch (step) {
    case 1:
      return 'Выберите источник для обновления плейлиста';
    case 2:
      return selectedSource === 'file' 
        ? 'Загрузите файл M3U для обновления' 
        : 'Введите ссылку на плейлист Spotify';
    case 3:
      return 'Настройте параметры синхронизации';
    default:
      return '';
  }
};
```

## Результат

Все указанные проблемы были успешно исправлены:
- ✅ Текст в кнопках теперь правильно переносится
- ✅ Можно вернуться к выбору источника
- ✅ Добавлен индикатор прогресса
- ✅ Данные внешних сервисов сохраняются при обновлении
- ✅ Исправлена логика сопоставления треков для разных источников
- ✅ Добавлена поддержка пагинации для импорта всех треков из Spotify
- ✅ Оптимизированы запросы к Spotify API (лимит 50, поля fields)
- ✅ Добавлена поддержка длительности треков из Spotify

Приложение теперь предоставляет более удобный и интуитивный интерфейс для работы с плейлистами. Логика обновления плейлистов теперь корректно работает для всех источников данных, а импорт из Spotify поддерживает плейлисты любого размера с оптимизированными запросами и полной информацией о треках. 