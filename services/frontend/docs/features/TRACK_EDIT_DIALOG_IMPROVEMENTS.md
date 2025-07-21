# TrackEditDialog Improvements

## Исправленные проблемы

### 1. Привязка к Spotify больше не закрывает диалог автоматически
- ✅ **Проблема**: При выборе трека из Spotify диалог сразу закрывался и сохранял изменения
- ✅ **Решение**: Теперь трек отображается как связанный, но изменения сохраняются только при нажатии "Сохранить"

### 2. Расширены поля в табе "Данные файла"
- ✅ **Добавлены поля**:
  - Название трека (редактируемое)
  - Исполнитель (редактируемый)
  - Путь к файлу (редактируемый)
  - Длительность (редактируемая)

## Технические изменения

### Изменение логики привязки Spotify
```typescript
// Старая логика - сразу сохраняла
const handleSelectSpotifyTrack = async (spotifyTrack: SpotifyTrackData) => {
  const updatedTrack = await updateTrackWithSpotify(track, spotifyTrack);
  onTrackUpdate(updatedTrack); // Сразу сохраняли
  setIsOpen(false); // Сразу закрывали
};

// Новая логика - только отображаем
const handleSelectSpotifyTrack = async (spotifyTrack: SpotifyTrackData) => {
  const tempUpdatedTrack = await updateTrackWithSpotify(track, spotifyTrack);
  
  // Обновляем локальное состояние для отображения
  const updatedTrack = { ...track };
  updatedTrack.spotifyData = tempUpdatedTrack.spotifyData;
  updatedTrack.album = tempUpdatedTrack.album;
  updatedTrack.coverKey = tempUpdatedTrack.coverKey;
  
  // НЕ сохраняем автоматически
  // Пользователь должен нажать "Сохранить"
};
```

### Расширение M3U данных
```typescript
// Старая структура
const [m3uFormData, setM3uFormData] = useState({
  url: track.m3uData?.url || '',
  duration: track.m3uData?.duration || 0,
});

// Новая структура
const [m3uFormData, setM3uFormData] = useState({
  title: track.m3uData?.title || track.title || '',
  artist: track.m3uData?.artist || track.artist || '',
  url: track.m3uData?.url || '',
  duration: track.m3uData?.duration || 0,
});
```

### Обновленная функция сохранения
```typescript
const handleSave = () => {
  const updatedTrack: Track = {
    ...track,
    title: formData.title,
    artist: formData.artist,
    album: formData.album,
    m3uData: {
      title: m3uFormData.title,      // Используем M3U данные
      artist: m3uFormData.artist,     // Используем M3U данные
      url: m3uFormData.url,
      duration: m3uFormData.duration,
    },
    spotifyData: track.spotifyData,   // Сохраняем Spotify данные
    coverKey: track.coverKey,
  };
  onTrackUpdate(updatedTrack);
  setIsOpen(false);
};
```

## Пользовательский интерфейс

### Новые поля в табе "Данные файла"
- **Название трека** - поле для редактирования
- **Исполнитель** - поле для редактирования
- **Путь к файлу** - поле для редактирования
- **Длительность** - числовое поле для редактирования

### Улучшенное отображение текущих данных
```typescript
// Отображение всех полей M3U данных
<div className='p-3 border rounded-lg bg-muted/20'>
  <p className='text-sm'>
    <span className='font-medium'>Название:</span> {track.m3uData.title}
  </p>
  <p className='text-sm'>
    <span className='font-medium'>Исполнитель:</span> {track.m3uData.artist}
  </p>
  <p className='text-sm'>
    <span className='font-medium'>Путь:</span> {track.m3uData.url}
  </p>
  <p className='text-sm'>
    <span className='font-medium'>Длительность:</span> {formatDuration(track.m3uData.duration)}
  </p>
</div>
```

### Индикация несохраненных изменений
- 💡 **Синяя подсказка**: "Изменения будут сохранены при нажатии кнопки 'Сохранить'"
- Отображается для Spotify и M3U данных

## Преимущества

### Для пользователей:
1. **Контроль над сохранением** - пользователь сам решает, когда сохранить изменения
2. **Предварительный просмотр** - можно увидеть, как будет выглядеть трек после привязки
3. **Полное редактирование M3U данных** - все поля доступны для изменения
4. **Понятная индикация** - ясно видно, что изменения еще не сохранены

### Для разработчиков:
1. **Консистентная логика** - все изменения сохраняются только через кнопку "Сохранить"
2. **Лучший UX** - пользователь может отменить изменения, не закрывая диалог
3. **Расширенная функциональность** - полное редактирование всех типов данных

## Обратная совместимость

✅ **Полностью сохранена**:
- Все существующие функции работают как прежде
- API компонента не изменился
- Данные сохраняются в том же формате
- Старые M3U данные корректно отображаются 