import ICO from 'icojs';

/**
 * Cria um Data URL robusto a partir de uma string SVG, adequado para carregar em um elemento <img
 * />. Esta função adiciona os atributos necessários e usa um método de codificação
 * confiável para evitar erros de carregamento.
 * @param svgText A string SVG bruta.
 * @param size A largura e altura desejadas para a imagem de saída.
 * @returns Uma string Data URL devidamente formatada e codificada.
 */
const svgTextToDataUrl = (svgText: string, size: number): string => {
  // 1. Sanitização: Remove quebras de linha e tabs que podem quebrar a codificação.
  const sanitizedSvg = svgText.replace(/(\r\n|\n|\r)/gm, "").replace(/>\s+</g, "><").trim();

  // 2. Adiciona os atributos de largura e altura sem remover os existentes.
  let finalSvg = sanitizedSvg.replace(
    /<svg(.*?)>/,
    `<svg width="${size}" height="${size}"$1>`
  );

  // 3. Garante que o atributo xmlns esteja presente, pois é crucial para a renderização.
  if (!finalSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    finalSvg = finalSvg.replace(
      /<svg(.*?)>/,
      `<svg xmlns="http://www.w3.org/2000/svg"$1>`
    );
  }

  // 4. Usa o padrão btoa(unescape(encodeURIComponent(...))) para uma codificação
  //    robusta de UTF-8 para Base64. Isso lida com caracteres especiais corretamente.
  const encodedSvg = btoa(unescape(encodeURIComponent(finalSvg)));

  return `data:image/svg+xml;base64,${encodedSvg}`;
};

/**
 * Converte uma string SVG em um Blob PNG.
 * @param svgText A string SVG (já colorida).
 * @param size A largura e altura desejadas do PNG.
 * @returns Uma Promise que resolve para um Blob PNG.
 */
export const svgToPng = (svgText: string, size: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error("Não foi possível obter o contexto do canvas"));
    }

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
      reject(new Error("Falha ao carregar SVG na imagem."));
    };

    // Usa a função robusta para criar o Data URL
    img.src = svgTextToDataUrl(svgText, size);
  });
};

/**
 * Converte uma string SVG em um Blob ICO contendo vários tamanhos.
 * @param svgText A string SVG (já colorida).
 * @returns Uma Promise que resolve para um Blob ICO.
 */
export const svgToIco = (svgText: string): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sizes = [16, 32, 48, 64];

      // Cria os dados da imagem para cada tamanho em paralelo
      const imageBuffers = await Promise.all(sizes.map(size => {
        return new Promise<{ data: Uint8ClampedArray; width: number; height: number; }>((resolve, reject) => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Não foi possível obter o contexto do canvas'));
          }

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

          // Usa a função robusta para criar o Data URL
          img.src = svgTextToDataUrl(svgText, size);
        });
      }));

      // Codifica os dados da imagem em um buffer ICO
      const icoBuffer = ICO.encode(imageBuffers);
      const icoBlob = new Blob([icoBuffer], { type: 'image/x-icon' });
      resolve(icoBlob);
    } catch (error) {
      reject(error);
    }
  });
};