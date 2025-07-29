export interface Playlist {
  id?: number;
  name: string; // Имя плейлиста
  order: number; // Порядок плейлиста в списке плейлистов
  tracks: Array<Track>; // Список треков плейлиста
}

export interface Track {
  title: string; // Название трека(заполняется первым источником, в котором будет это поле)
  artist: string; // Исполнитель(заполняется первым источником, в котором будет это поле)
  album: string; // Название альбома(заполняется первым источником, в котором будет это поле)
  duration: number; // Длительность трека в миллисекундах
  position: number; // Позиция трека в плейлисте
  coverKey: string; // Ключ обложки трека в базе данных covers(заполняется путем преобразования обложки в base64 и сохранением в базу данных covers из первого источника, в котором будет обложка)
  m3uData?: TrackM3UData; // Отфильтрованные данные трека пришедшие из m3u файла. Заполняются при импорте/привязке плейлиста из m3u файла
  spotifyData?: SpotifyTrackData; // Отфильтрованные данные трека пришедшие из Spotify API(Заполняются при импорте/привязке плейлиста трека к Spotify)
}

export interface SpotifyTrackData {
  id: string; // ID трека в Spotify
  title: string; // Название трека
  artist: string; // Исполнитель
  album: string; // Название альбома
  coverUrl: string; // URL обложки трека(берется самая маленькая обложка из списка album.images)
  duration: number; // Длительность трека в миллисекундах
}

export interface TrackM3UData {
  title: string; // Название трека
  artist: string; // Исполнитель
  url: string; // Путь к файлу
  duration: number; // Длительность трека
}
