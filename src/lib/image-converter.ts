import { Canvg } from 'canvg';

/**
 * Prepares an SVG string for rendering by adding the fill color.
 * @param svgText The original SVG string.
 * @param color The fill color to be applied.
 * @returns The colored SVG string.
 */
const colorizeSvg = (svgText: string, color: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgElement = doc.documentElement;
  svgElement.setAttribute('fill', color);
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
};

/**
 * Converts an SVG string into a PNG Blob of a specific size.
 * @param svgText The SVG string (already colored).
 * @param size The width and height of the PNG image.
 * @returns A Promise that resolves to a PNG Blob.
 */
async function svgToPngBlob(svgText: string, size: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  const v = await Canvg.from(ctx, svgText);
  await v.render();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas to Blob conversion failed"));
    }, 'image/png');
  });
}

/**
 * Exported function to convert SVG to PNG, maintaining the component interface.
 * @param svgText The original SVG.
 * @param size The PNG size.
 * @param color The color to be applied.
 * @returns A Promise that resolves to a PNG Blob.
 */
export const svgToPng = async (svgText: string, size: number, color: string): Promise<Blob> => {
  const coloredSvg = colorizeSvg(svgText, color);
  return svgToPngBlob(coloredSvg, size);
};

/**
 * Converts an SVG string into an ICO Blob, manually assembling the file.
 * @param svgText The original SVG (uncolored).
 * @param color The color to be applied to all images.
 * @returns A Promise that resolves to an ICO Blob.
 */
export const svgToIco = async (svgText: string, color: string): Promise<Blob> => {
  const coloredSvg = colorizeSvg(svgText, color);
  const sizes = [16, 32, 48, 64];

  const pngBlobs = await Promise.all(
    sizes.map(size => svgToPngBlob(coloredSvg, size))
  );

  const imageEntries = [];
  let imageOffset = 6 + (sizes.length * 16);

  const imageBuffers = [];

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const blob = pngBlobs[i];
    const buffer = await blob.arrayBuffer();
    const data = new Uint8Array(buffer);

    const entry = new Uint8Array(16);
    entry[0] = size; // width
    entry[1] = size; // height
    entry[2] = 0;    // colors (0 = true color)
    entry[3] = 0;    // reserved
    entry[4] = 1;    // color planes
    entry[5] = 0;
    entry[6] = 32;   // bit depth
    entry[7] = 0;

    // size of PNG
    const dataView = new DataView(entry.buffer);
    dataView.setUint32(8, data.length, true);
    dataView.setUint32(12, imageOffset, true);

    imageOffset += data.length;

    imageEntries.push(entry);
    imageBuffers.push(data);
  }

  // ICO Header (6 bytes)
  const header = new Uint8Array(6);
  header[2] = 1; // type = ICO
  header[4] = sizes.length; // number of images

  const finalBufferParts = [header, ...imageEntries, ...imageBuffers];
  return new Blob(finalBufferParts, { type: "image/x-icon" });
};