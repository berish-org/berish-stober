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
  private changesUnlistener: () => void = null;

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

  public async loadState() {
    const loadedState = await super.loadState();
    const action = this.create(store => {
      store.state = loadedState;
    });
    this.isEmittedByDispatch = true;
    this.dispatch(action);
    return this.state;
  }

  public changesStart() {
    if (this.storage)
      this.changesUnlistener = this.storage.changes(state => {
        const action = this.create(store => {
          store.state = state;
        });
        this.isEmittedByDispatch = true;
        this.dispatch(action);
      });
  }

  public changesStop() {
    if (this.changesUnlistener) this.changesUnlistener();
  }

  protected storeInitialized() {
    super.storeInitialized();

    this.isMethodAction = this.isMethodAction.bind(this);
    this.methodReduce = this.methodReduce.bind(this);
    this.create = this.create.bind(this);

    this.reducers = [this.methodReduce, ...this.reducers];
  }
}
