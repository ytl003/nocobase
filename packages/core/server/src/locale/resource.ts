import { requireModule } from '@nocobase/utils';

const arr2obj = (items: any[]) => {
  const obj = {};
  for (const item of items) {
    Object.assign(obj, item);
  }
  return obj;
};

export const getResource = (packageName: string, lang: string, isPlugin = true) => {
  const resources = [];
  const prefixes = [isPlugin ? 'dist' : 'lib'];
  if (process.env.APP_ENV !== 'production') {
    prefixes.unshift('src');
  }
  for (const prefix of prefixes) {
    try {
      const file = `${packageName}/${prefix}/locale/${lang}`;
      require.resolve(file);
      const resource = requireModule(file);
      resources.push(resource);
    } catch (error) {
      // empty
    }
    if (resources.length) {
      break;
    }
  }
  if (resources.length === 0 && lang.replace('-', '_') !== lang) {
    return getResource(packageName, lang.replace('-', '_'));
  }
  return arr2obj(resources);
};
