import ICO from 'icojs';

const svgTextToDataUrl = (svgText: string, size: number): string => {
  // Adiciona largura e altura ao SVG para renderização correta no canvas.
  const svgWithSize = svgText.replace(
    '<svg',
    `<svg width="${size}" height="${size}"`
  );
  // A codificação btoa pode falhar com caracteres UTF-8.
  // Usamos este truque com encodeURIComponent para garantir que a string seja codificada corretamente.
  const encodedSvg = btoa(unescape(encodeURIComponent(svgWithSize)));
  return `data:image/svg+xml;base64,${encodedSvg}`;
};

export const svgToPng = (svgText: string, size: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error("Não foi possível obter o contexto do canvas"));

    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("A conversão de Canvas para Blob falhou"));
        }
      }, 'image/png');
    };
    img.onerror = (e) => {
      console.error("Erro ao carregar SVG na imagem para conversão PNG:", e);
      reject(new Error(`Falha ao carregar SVG na imagem.`));
    };
    img.src = svgTextToDataUrl(svgText, size);
  });
};

export const svgToIco = (svgText: string): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sizes = [16, 32, 48, 64];

      const imageBuffers = await Promise.all(sizes.map(size => {
        return new Promise<{ data: Uint8ClampedArray; width: number; height: number; }>((resolve, reject) => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Não foi possível obter o contexto do canvas'));

          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            const imageData = ctx.getImageData(0, 0, size, size);
            resolve({
              data: imageData.data,
              width: size,
              height: size,
            });
          };
          img.onerror = (err) => {
            console.error(`Erro ao carregar SVG na imagem para conversão ICO (tamanho ${size}):`, err);
            reject(new Error(`Falha ao carregar SVG para o tamanho ${size}.`));
          };
          img.src = svgTextToDataUrl(svgText, size);
        });
      }));

      const icoBuffer = ICO.encode(imageBuffers);
      const icoBlob = new Blob([icoBuffer], { type: 'image/x-icon' });
      resolve(icoBlob);
    } catch (error) {
      reject(error);
    }
  });
};