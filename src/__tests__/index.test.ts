import { createStore } from 'redux';
import * as Stober from '../';
import { IAction } from '../store';

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

    store.subscribe(m => {
      expect(m).toEqual({ a: 0 });
    });
    store.dispatch({ type: 'HEY', key: 'a', value: 0 });
    expect(store.get('a')).toBe(0);
    store.set('a', 1);
    expect(store.get('a')).toBe(1);

    done();
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
      console.log('subsribe', m);
    });

    const actionTrue = store.createMethod(m => {
      m.isAdmin = true;
    });

    const actionFalse = store.createMethod(m => {
      m.isAdmin = false;
    });

    store.dispatch(actionTrue);
    store.dispatch(actionFalse);
    store.dispatch(actionTrue);

    done();
  });
});
