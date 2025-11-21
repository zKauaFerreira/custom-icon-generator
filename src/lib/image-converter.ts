import { Canvg } from 'canvg';
import ICO from 'icojs';

/**
 * Converte uma string SVG em um Blob PNG usando a biblioteca canvg.
 * Esta abordagem é mais robusta do que usar new Image() e evita erros de carregamento.
 * @param svgText A string SVG (já colorida).
 * @param size A largura e altura desejadas do PNG.
 * @returns Uma Promise que resolve para um Blob PNG.
 */
export const svgToPng = async (svgText: string, size: number): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Não foi possível obter o contexto do canvas");
  }

  // Garante que o SVG tenha um tamanho definido, preservando os atributos existentes.
  const sizedSvg = svgText.replace(/<svg(.*?)>/, `<svg width="${size}" height="${size}"$1>`);

  const v = await Canvg.from(ctx, sizedSvg);
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
 * Usa canvg para renderizar cada tamanho e icojs para compilar o arquivo .ico.
 * @param svgText A string SVG (já colorida).
 * @returns Uma Promise que resolve para um Blob ICO.
 */
export const svgToIco = async (svgText: string): Promise<Blob> => {
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

      const sizedSvg = svgText.replace(/<svg(.*?)>/, `<svg width="${size}" height="${size}"$1>`);
      const v = await Canvg.from(ctx, sizedSvg);
      await v.render();

      return ctx.getImageData(0, 0, size, size);
    }));

    // O icojs espera um array de objetos com data, width, e height.
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