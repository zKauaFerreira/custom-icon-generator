import packageJson from '../../package.json';

/**
 * Retorna a versão instalada do pacote simple-icons.
 */
export const getSimpleIconsVersion = (): string => {
  // O package.json é importado como um módulo JSON
  const version = packageJson.dependencies['simple-icons'];
  
  // Remove caracteres como ^ ou ~
  return version ? version.replace(/[\^~]/g, '') : 'unknown';
};