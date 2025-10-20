import { PlaylistContent } from './PlaylistContent';

interface PlaylistPageProps {
  params: Promise<{ id: string; }>;
}

// Генерируем пустой массив, так как плейлисты хранятся в IndexedDB
// и не известны на момент сборки. Next.js создаст базовую страницу,
// а динамическая загрузка будет происходить на клиенте
export async function generateStaticParams() {
  return [];
}

async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  return <PlaylistContent id={id} />;
}

export default PlaylistPage;

