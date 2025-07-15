export async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    const handleLoadEnd = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
      cleanup();
    };

    const handleError = () => {
      reject(new Error('Failed to read the image blob'));
      cleanup();
    };

    function cleanup() {
      reader.removeEventListener('loadend', handleLoadEnd);
      reader.removeEventListener('error', handleError);
    }

    reader.addEventListener('loadend', handleLoadEnd);
    reader.addEventListener('error', handleError);

    reader.readAsDataURL(blob);
  });
}
