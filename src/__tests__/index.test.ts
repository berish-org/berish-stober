import guid from 'berish-guid';
import { createStore } from 'redux';
import * as Stober from '../';
import { IStorageAdapter } from '../storage';
import { IAction } from '../store';
import ls, { IPolyfillAdapterType, PolyfillType } from './localStorageClone';

let store: PolyfillType = null;

beforeEach(() => {
  store = ls();
});

const getStorageAdapter = (raw: IPolyfillAdapterType) => {
  const storageAdapter: IStorageAdapter = {
    getItem: (key: string) => Promise.resolve(raw.getItem(key)),
    onChange: (cb: (key: string, value: any) => void) => raw.onChange(cb),
    removeItem: (key: string) => Promise.resolve().then(() => raw.removeItem(key)),
    setItem: (key: string, value: any) => Promise.resolve().then(() => raw.setItem(key, value)),
  };
  return storageAdapter;
};

describe('тестирование основного модуля', () => {
  test('создание стора', done => {
    const reducer = (state: any, action: IAction) => {
      if (action.type === 'HEY')
        return {
          [action.key]: action.value,
        };
      return state;
    };

    const store = new Stober.Store(createStore, [reducer]);
    expect(store).toBeDefined();

    store.subscribe((store, state) => {
      expect(store.get('a')).toEqual(0);
      expect(state).toEqual({ a: 0 });
      done();
    });
    store.dispatch({ type: 'HEY', key: 'a', value: 0 });
    expect(store.get('a')).toBe(0);
  });

  test('Создание динамического стора', done => {
    interface IStore {
      isAdmin: boolean;
    }

    class PanelStore extends Stober.DynamicStore<IStore> {
      get isAdmin() {
        return this.get('isAdmin');
      }

      set isAdmin(value: boolean) {
        this.set('isAdmin', value);
      }
    }

    const store = new PanelStore(createStore, []);

    store.subscribe(m => {
      // console.log('subsribe', m);
    });

    const actionTrue = store.create(m => {
      m.isAdmin = true;
    });

    const actionFalse = store.create(m => {
      m.isAdmin = false;
    });

    store.dispatch(actionTrue);
    store.dispatch(actionFalse);
    store.dispatch(actionTrue);

    done();
  });

  test('проверка фиктивной передачи данных между вкладками как localstorage', done => {
    const adapter1 = store('adapter1');
    const adapter2 = store('adapter2');

    const name = guid.generateId();

    adapter1.onChange((key, value) => {
      expect(key).toBe('name');
      expect(value).toBe(name);
      done();
    });

    adapter2.setItem('name', name);
  });

  test('проверка фиктивной передачи данных между вкладками как адаптер для stober вокруг localstorage', done => {
    const tab1 = store('tab1');
    const tab2 = store('tab2');

    const adapterTab1 = getStorageAdapter(tab1);
    const adapterTab2 = getStorageAdapter(tab2);

    const name = guid.generateId();
    adapterTab1.onChange((key, value) => {
      expect(key).toBe('name');
      expect(value).toBe(name);
      done();
    });
    adapterTab2.setItem('name', name);
  });

  test('проверка фиктивной передачи данных между вкладками через storage stober', async done => {
    const tab1 = store('tab1');
    const tab2 = store('tab2');

    const adapterTab1 = getStorageAdapter(tab1);
    const adapterTab2 = getStorageAdapter(tab2);

    const storageAdapter1 = new Stober.Storage(adapterTab1).setStorageName('localStorage');
    const storageAdapter2 = new Stober.Storage(adapterTab2).setStorageName('localStorage');

    const testState = {
      name: guid.generateId(),
    };

    await storageAdapter1.changes(state => {
      expect(state).toEqual(testState);
      done();
    });
    await storageAdapter2.save(testState);
  });

  test('проверка фиктивной передачи данных между вкладками через store stober subscribe', async done => {
    const tab1 = store('tab1');
    const tab2 = store('tab2');

    const adapterTab1 = getStorageAdapter(tab1);
    const adapterTab2 = getStorageAdapter(tab2);

    const storageAdapter1 = new Stober.Storage(adapterTab1).setStorageName('localStorage');
    const storageAdapter2 = new Stober.Storage(adapterTab2).setStorageName('localStorage');

    const store1 = new Stober.DynamicStore<any>(createStore, []).setStorage(storageAdapter1);
    const store2 = new Stober.DynamicStore<any>(createStore, []).setStorage(storageAdapter2);

    store1.changesStart();

    const name = guid.generateId();

    await store1.subscribe(store => {
      expect(store.get('name')).toBe(name);
      done();
    });
    store2.dispatch(
      store2.create(store => {
        store.set('name', name);
      }),
    );
  });

  test('проверка фиктивной передачи данных между вкладками через store stober state', async done => {
    const tab1 = store('tab1');
    const tab2 = store('tab2');

    const adapterTab1 = getStorageAdapter(tab1);
    const adapterTab2 = getStorageAdapter(tab2);

    const storageAdapter1 = new Stober.Storage(adapterTab1).setStorageName('localStorage');
    const storageAdapter2 = new Stober.Storage(adapterTab2).setStorageName('localStorage');

    const store1 = new Stober.DynamicStore<any>(createStore, []).setStorage(storageAdapter1);
    const store2 = new Stober.DynamicStore<any>(createStore, []).setStorage(storageAdapter2);

    store1.changesStart();

    const name = guid.generateId();

    await store2.dispatch(
      store2.create(store => {
        store.set('name', name);
      }),
    );

    setTimeout(() => {
      expect(store1.get('name')).toBe(name);
      done();
    }, 10);
  });
});
