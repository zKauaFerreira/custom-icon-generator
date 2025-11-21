import { Canvg } from 'canvg';
import ICO from 'icojs';

/**
 * Prepara uma string SVG para renderização usando a API DOM, que é mais segura do que regex.
 * @param svgText A string SVG original.
 * @param options Um objeto com `size` e `color` para aplicar ao SVG.
 * @returns A string SVG modificada.
 */
const prepareSvg = (svgText: string, options: { size?: number; color?: string }): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgElement = doc.documentElement;

  // Usar setAttribute substitui qualquer atributo existente, evitando erros de "redefinição".
  if (options.color) {
    svgElement.setAttribute('fill', options.color);
  }
  if (options.size) {
    svgElement.setAttribute('width', String(options.size));
    svgElement.setAttribute('height', String(options.size));
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
};


/**
 * Converte uma string SVG em um Blob PNG usando a biblioteca canvg.
 * @param svgText A string SVG original (sem cor ou tamanho).
 * @param size A largura e altura desejadas do PNG.
 * @param color A cor de preenchimento do ícone.
 * @returns Uma Promise que resolve para um Blob PNG.
 */
export const svgToPng = async (svgText: string, size: number, color: string): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Não foi possível obter o contexto do canvas");
  }

  const finalSvg = prepareSvg(svgText, { size, color });

  const v = await Canvg.from(ctx, finalSvg);
  await v.render();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("A conversão de Canvas para Blob falhou"));
      }
    }, 'image/png');
  });
};

/**
 * Converte uma string SVG em um Blob ICO contendo vários tamanhos.
 * @param svgText A string SVG original (sem cor).
 * @param color A cor de preenchimento para todos os tamanhos de ícone.
 * @returns Uma Promise que resolve para um Blob ICO.
 */
export const svgToIco = async (svgText: string, color: string): Promise<Blob> => {
  try {
    const sizes = [16, 32, 48, 64];

    const imageDatas = await Promise.all(sizes.map(async (size) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error(`Não foi possível obter o contexto do canvas para o tamanho ${size}`);
      }

      const finalSvg = prepareSvg(svgText, { size, color });
      const v = await Canvg.from(ctx, finalSvg);
      await v.render();

      return ctx.getImageData(0, 0, size, size);
    }));

    const icoBuffer = ICO.encode(imageDatas.map(imageData => ({
      data: imageData.data,
      width: imageData.width,
      height: imageData.height,
    })));
    
    return new Blob([icoBuffer], { type: 'image/x-icon' });

  } catch (error) {
    console.error("Falha ao criar o arquivo ICO:", error);
    throw error;
  }
};