import * as uniqid from 'uniqid';
import { Storage } from './storage';
import { IAction, Store } from './store';

export type IMethodReducer<State, TStore extends DynamicStore<State>> = (
  store: TStore,
  state: State,
  action: IAction,
) => TStore | void;

export type IMethodReducerAsync<State, TStore extends DynamicStore<State>> = (
  store: TStore,
  state: State,
  action: IAction,
) => Promise<TStore> | Promise<void>;

export interface IMethodAction<State, TStore extends DynamicStore<State>> extends IAction {
  reducer: IMethodReducer<State, TStore>;
}

export class DynamicStore<State = any> extends Store<State> {
  private methodAction = uniqid('dynamicStore');

  public setStorage(storage: Storage) {
    super.setStorage(storage);
    if (this.storage)
      this.storage.onChange(state => {
        const action = this.create(store => {
          store.state = state;
        });
        this.dispatch(action);
      });
    return this;
  }

  public isMethodAction(action: IAction): action is IMethodAction<State, this> {
    if (action.type === this.methodAction) return true;
    return false;
  }

  public methodReduce(state: State, action: IAction) {
    if (this.isMethodAction(action)) {
      const self = action.reducer(this, state, action) || this;
      const newState = Object.assign({}, self.state);
      return newState;
    }
    return state;
  }

  public create(methodReducer: IMethodReducer<State, this>): IMethodAction<State, this> {
    return { type: this.methodAction, reducer: methodReducer };
  }

  protected storeInitialized() {
    super.storeInitialized();

    this.isMethodAction = this.isMethodAction.bind(this);
    this.methodReduce = this.methodReduce.bind(this);
    this.create = this.create.bind(this);

    this.reducers = [this.methodReduce, ...this.reducers];
  }
}
