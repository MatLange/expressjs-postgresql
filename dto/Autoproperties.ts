export class AutoProperties {
    [key: string]: any;
  
    constructor(properties: { [key: string]: any }) {
      Object.assign(this, properties);
  
      return new Proxy(this, {
        get: (target, prop: string) => {
          if (prop in target) {
            return target[prop];
          }
          if (prop.startsWith('get')) {
            const key = prop.slice(3).toLowerCase();
            return () => target[key];
          }
          if (prop.startsWith('set')) {
            const key = prop.slice(3).toLowerCase();
            return (value: any) => { target[key] = value; };
          }
          return undefined;
        },
        set: (target, prop: string, value: any) => {
          target[prop] = value;
          return true;
        }
      });
    }
  }
;