import * as collection from 'berish-collection';

export interface IPolyfillAdapterType {
  getItem: (key: string) => any;
  onChange: (cb: (key: string, value: any) => void) => (() => void);
  removeItem: (key: string) => void;
  setItem: (key: string, value: any) => void;
}

export type PolyfillType = (tabName: string) => IPolyfillAdapterType;

export default (): PolyfillType => {
  const data: { [key: string]: any } = {};
  const listeners = new collection.Dictionary<string, ((key: string, value: any) => void)[]>();

  return (tabName: string): IPolyfillAdapterType => {
    const adapter = {
      getItem: (key: string) => {
        return data[key];
      },
      onChange: (cb: (key: string, value: any) => void) => {
        if (!listeners.containsKey(tabName)) listeners.add(tabName, []);
        listeners.get(tabName).push(cb);
        return () => {
          const tabListeners = listeners.get(tabName);
          listeners.remove(tabName);
          listeners.add(tabName, tabListeners.filter(m => m !== cb));
        };
      },
      removeItem: (key: string) => {
        delete data[key];
      },
      setItem: (key: string, value: any) => {
        const oldValue = data[key];
        data[key] = value;
        if (oldValue !== value)
          listeners
            .toLinq()
            .where(m => m.key !== tabName)
            .selectMany(m => m.value)
            .forEach(m => setTimeout(() => m.item(key, value)));
      },
    };

    return adapter;
  };
};

test('export localStorage polyfill', done => done());
