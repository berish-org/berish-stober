import { Storage } from './storage';

export interface IAction {
  type: string;
  [key: string]: any;
}
export type IReducer<State> = (state: State, action: IAction) => State;
export type ISubscriber<Store, State> = (store: Store, newState: State) => any;

export interface IStoreAdapter<State> {
  getState: () => State;
  dispatch: (action: IAction) => void;
  subscribe: (listener: () => void) => (() => void);
  replaceReducer: (reducer: IReducer<State>) => void;
}

export type StoreAdapterFabric<State> = (reducer: IReducer<State>, initialState?: any) => IStoreAdapter<State>;

export class Store<State = any> {
  public get state() {
    return this[this.stateSymbol];
  }

  public set state(value: State) {
    this[this.stateSymbol] = value;
  }
  protected storeAdapterFabric: StoreAdapterFabric<State> = null;
  protected storeAdapter: IStoreAdapter<State> = null;
  protected reducers: Array<IReducer<State>> = [];
  protected callbacks: Array<ISubscriber<this, State>> = [];
  protected stateSymbol: symbol = Symbol('state');
  protected storage: Storage = null;
  protected isEmittedByDispatch = false;

  constructor(storeAdapterFabric: StoreAdapterFabric<State>, reducers: Array<IReducer<State>>, initialState?: State) {
    this.dispatch = this.dispatch.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);

    this.storeAdapterFabric = storeAdapterFabric;
    this.reducers = reducers || [];
    this.storeAdapter = this.storeAdapterFabric((state: State, action: IAction) => {
      let newState = Object.assign({}, state);
      for (const reducer of this.reducers) {
        newState = reducer(newState, action);
      }
      return newState;
    }, initialState);
    this.state = Object.assign({}, initialState);
    this.storeInitialized();
  }

  public setStorage(storage: Storage) {
    this.storage = storage;
    return this;
  }

  public async dispatch<T extends IAction>(action: T) {
    try {
      await this.storeAdapter.dispatch(action);
      if (this.storage && !this.isEmittedByDispatch) {
        await this.storage.save(this.state);
      }
    } finally {
      this.isEmittedByDispatch = false;
    }
  }

  public subscribe(config: ISubscriber<this, State>) {
    const listener = this.storeAdapter.subscribe(() => {
      this.state = this.storeAdapter.getState();
      config(this, this.state);
    });
    this.callbacks.push(config);
    if (this.callbacks.length === 1) this.storeSubscribed();
    return () => {
      listener();
      this.callbacks = this.callbacks.filter(m => m !== config);
      if (this.callbacks.length === 0) this.storeUnsubscribed();
    };
  }

  public async loadState() {
    let loadedState = null;
    if (this.storage) loadedState = await this.storage.load();
    if (!loadedState) loadedState = this.state || this.storeAdapter.getState();
    this.state = loadedState;
    return loadedState;
  }

  public async clear() {
    if (this.storage) {
      await this.storage.clear();
    }
  }

  public get<Key extends keyof State>(key: Key) {
    return this.state[key];
  }

  public set<Key extends keyof State>(key: Key, value: State[Key]) {
    const state = this.state;
    state[key] = value;
    this.state = state;
  }

  protected storeInitialized() {
    // store will mount event)
  }

  protected storeSubscribed() {
    // store did mount event
  }

  protected storeUnsubscribed() {
    // store will unmount event
  }
}
