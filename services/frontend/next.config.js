import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Для GitHub Pages с репозиторием /playlisto
  basePath: process.env.NODE_ENV === 'production' ? '/playlisto' : '',
  // Генерируем статический экспорт для SSG (только в production)
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  // Отключаем оптимизацию изображений для статического экспорта
  images: {
    unoptimized: true,
  },
  // Настройка путей для алиасов и полифилл для import.meta.env
  webpack: (config, { webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };

    // Полифилл для import.meta.env (совместимость с Vite)
    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV),
        'import.meta.env.PROD': process.env.NODE_ENV === 'production',
        'import.meta.env.DEV': process.env.NODE_ENV === 'development',
        'import.meta.env.SSR': false,
      })
    );

    return config;
  },
};

export default nextConfig;

