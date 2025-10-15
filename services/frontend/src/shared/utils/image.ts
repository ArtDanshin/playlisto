/**
   * Обработчик загрузки и обработки изображения
   */
export function imageUploader(file?: File): Promise<string> {
  const COMPRESSED_TARGET_SIZE = 224 * 1024;

  return new Promise((resolve, reject) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('Файл слишком большой. Максимальный размер: 10MB'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        reject(new Error('Файл должен быть изображением'));
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', async (e: ProgressEvent<FileReader>) => {
        // Сначала пробуем обычное сжатие
        const initialBase64 = e.target?.result as string;
        let resizedBase64 = await resizeImage(initialBase64, 1000, 1000, COMPRESSED_TARGET_SIZE);
        let size = getBase64Size(resizedBase64);

        // Если размер все еще больше 256KB, используем принудительное сжатие
        if (size > 256 * 1024) {
          console.warn(`Изображение не удалось сжать до 256KB (текущий размер: ${Math.round(size / 1024)}KB), применяем принудительное сжатие`);
          resizedBase64 = await forceCompressImageToSize(initialBase64, COMPRESSED_TARGET_SIZE);
          size = getBase64Size(resizedBase64);
          console.log(`После принудительного сжатия размер: ${Math.round(size / 1024)}KB`);
        }

        resolve(resizedBase64);
      });
      reader.addEventListener('error', () => {
        reject(new Error('Не удалось загрузить изображение'));
      });
      reader.readAsDataURL(file);
    }
  });
};

/**
 * Ресайзит изображение до максимальных размеров с сохранением пропорций
 * TODO: Вынести эти вычисления в отдельный тред или воркер, так как при больших файлах интерфейс на долго фризится
 */
export function resizeImage(
  base64: string,
  maxWidth: number = 1000,
  maxHeight: number = 1000,
  maxSizeBytes?: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Не удалось получить контекст canvas'));
        return;
      }

      // Вычисляем новые размеры с сохранением пропорций
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Устанавливаем размеры canvas
      canvas.width = width;
      canvas.height = height;

      // Рисуем изображение с новыми размерами
      ctx.drawImage(img, 0, 0, width, height);

      // Конвертируем обратно в base64 с учетом максимального размера
      const compressImage = (quality: number): string => canvas.toDataURL('image/jpeg', quality);

      if (maxSizeBytes) {
        // Более агрессивный алгоритм сжатия
        let currentQuality = 0.9;
        let currentResult = compressImage(currentQuality);
        let currentSize = getBase64Size(currentResult);

        // Если размер все еще больше максимального, уменьшаем качество более агрессивно
        while (currentSize > maxSizeBytes && currentQuality > 0.05) {
          currentQuality -= 0.1;
          currentResult = compressImage(currentQuality);
          currentSize = getBase64Size(currentResult);
        }

        // Если все еще не помещается, уменьшаем размеры изображения
        if (currentSize > maxSizeBytes) {
          let scaleFactor = 0.9;
          while (currentSize > maxSizeBytes && scaleFactor > 0.3) {
            const newWidth = Math.round(width * scaleFactor);
            const newHeight = Math.round(height * scaleFactor);

            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            currentResult = compressImage(0.8); // Используем фиксированное качество
            currentSize = getBase64Size(currentResult);

            scaleFactor -= 0.1;
          }
        }

        resolve(currentResult);
      } else {
        // Если не указан максимальный размер, используем качество 0.9
        const resizedBase64 = compressImage(0.9);
        resolve(resizedBase64);
      }
    });

    img.addEventListener('error', () => {
      reject(new Error('Не удалось загрузить изображение'));
    });

    img.src = base64;
  });
}

/**
 * Принудительно сжимает изображение до указанного размера, используя все доступные методы
 */
export function forceCompressImageToSize(
  base64: string,
  maxSizeBytes: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Не удалось получить контекст canvas'));
        return;
      }

      let { width, height } = img;
      let currentResult: string;
      let currentSize: number;

      // Функция для сжатия с текущими параметрами
      const compressWithCurrentParams = (quality: number): string => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', quality);
      };

      // Начинаем с максимального качества
      currentResult = compressWithCurrentParams(0.9);
      currentSize = getBase64Size(currentResult);

      // Шаг 1: Уменьшаем качество до минимума
      let quality = 0.9;
      while (currentSize > maxSizeBytes && quality > 0.1) {
        quality -= 0.05;
        currentResult = compressWithCurrentParams(quality);
        currentSize = getBase64Size(currentResult);
      }

      // Шаг 2: Если все еще не помещается, уменьшаем размеры
      if (currentSize > maxSizeBytes) {
        let scaleFactor = 0.8;
        while (currentSize > maxSizeBytes && scaleFactor > 0.2) {
          width = Math.round(img.width * scaleFactor);
          height = Math.round(img.height * scaleFactor);

          currentResult = compressWithCurrentParams(0.7);
          currentSize = getBase64Size(currentResult);

          scaleFactor -= 0.1;
        }
      }

      // Шаг 3: Если все еще не помещается, используем минимальное качество
      if (currentSize > maxSizeBytes) {
        currentResult = compressWithCurrentParams(0.1);
        currentSize = getBase64Size(currentResult);
      }

      // Шаг 4: Если все еще не помещается, уменьшаем до минимальных размеров
      if (currentSize > maxSizeBytes) {
        width = 300;
        height = 300;
        currentResult = compressWithCurrentParams(0.1);
        currentSize = getBase64Size(currentResult);
      }

      resolve(currentResult);
    });

    img.addEventListener('error', () => {
      reject(new Error('Не удалось загрузить изображение'));
    });

    img.src = base64;
  });
}

/**
 * Получает размер base64 строки в байтах
 */
export function getBase64Size(base64: string): number {
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  return Math.ceil((base64Data.length * 3) / 4);
}
