// Новая структура данных для плейлистов
export interface Playlist {
  id?: number;
  name: string; // Имя плейлиста
  order: number; // Порядок плейлиста в списке плейлистов
  tracks: Array<Track>; // Список треков плейлиста
  createdAt?: string;
  updatedAt?: string;
}

export interface Track {
  title: string; // Название трека(заполняется первым источником, в котором будет это поле)
  artist: string; // Исполнитель(заполняется первым источником, в котором будет это поле)
  album: string; // Название альбома(заполняется первым источником, в котором будет это поле)
  position: number; // Позиция трека в плейлисте
  coverKey: string; // Ключ обложки трека в базе данных covers(заполняется путем преобразования обложки в base64 и сохранением в базу данных covers из первого источника, в котором будет обложка)
  m3uData?: M3UData; // Отфильтрованные данные трека пришедшие из m3u файла. Заполняются при импорте/привязке плейлиста из m3u файла
  spotifyData?: SpotifyData; // Отфильтрованные данные трека пришедшие из Spotify API(Заполняются при импорте/привязке плейлиста трека к Spotify)
}

export interface M3UData {
  title: string; // Название трека
  artist: string; // Исполнитель
  url: string; // Путь к файлу
  duration: number; // Длительность трека
}

export interface SpotifyData {
  id: string; // ID трека в Spotify
  title: string; // Название трека
  artist: string; // Исполнитель
  album: string; // Название альбома
  coverUrl: string; // URL обложки трека(берется самая маленькая обложка из списка album.images)
}

// Полные данные трека из Spotify API для внутреннего использования
export interface SpotifyTrackData {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string; }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number; }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  uri: string;
}
