// packages/shared/src/generals.ts
function isObject(val) {
  return val !== null && typeof val === "object";
}
function isFunction(val) {
  return typeof val === "function";
}
var isArray = Array.isArray;

// packages/reactivity/src/effect.ts
var activeEffect = null;
var targetMap = /* @__PURE__ */ new WeakMap();
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    // 记录 effect 中使用的属性
    this.deps = [];
    if (activeEffectScope && activeEffectScope.active) {
      activeEffectScope.effects.push(this);
    }
  }
  run() {
    try {
      if (!this.active) {
        return this.fn();
      }
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this);
    }
  }
};
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
function track(target, type, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    trackEffects(dep);
  }
}
function trackEffects(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key) || /* @__PURE__ */ new Set();
  const effects = [...dep];
  effects && effects.forEach((effect2) => {
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
  });
}
function triggerEffects(dep) {
  const effects = [...dep];
  effects && effects.forEach((effect2) => {
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
  });
}
function cleanupEffect(effect2) {
  const { deps } = effect2;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.length = 0;
}
var activeEffectScope;
var EffectScope = class {
  constructor() {
    this.active = true;
    this.effects = [];
    this.scopes = [];
  }
  run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope;
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = this.parent;
        this.parent = null;
      }
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      this.effects.forEach((effect2) => effect2.stop());
      this.scopes.forEach((scope) => scope.stop());
    }
  }
};
function effectScope(detached = false) {
  const scope = new EffectScope();
  if (!detached && activeEffectScope) {
    activeEffectScope.scopes.push(scope);
  }
  console.log(activeEffectScope);
  return scope;
}

// packages/reactivity/src/baseHandlers.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    const res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      return reactive(res);
    }
    track(target, "get", key);
    return res;
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, "set", key, value, oldValue);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__v_isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  if (!isObject(target))
    return target;
  let existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function isReactive(target) {
  return target["__v_isReactive" /* IS_REACTIVE */];
}

// packages/reactivity/src/apiWatch.ts
function watch(source, cb, options) {
  doWatch(source, cb, options);
}
function watchEffect(source, options) {
  doWatch(source, null, options);
}
function doWatch(source, cb, options) {
  let getter;
  if (isReactive(source)) {
    getter = traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldValue;
  let cleanup;
  const onCleanup = (fn) => {
    cleanup = fn;
  };
  const scheduler = () => {
    if (cleanup)
      cleanup();
    if (cb) {
      const newValue = effect2.run();
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, scheduler);
  oldValue = effect2.run();
}
function traverse(value, seen = /* @__PURE__ */ new Set()) {
  if (!isObject) {
    return value;
  }
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (let key in value) {
    traverse(value[key], seen);
  }
  return value;
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.setter = setter;
    this._dirty = true;
    this.effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
      triggerEffects(this.dep);
    });
  }
  get value() {
    if (activeEffect) {
      trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
    }
    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false;
    }
    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
};
function computed(getterOptions) {
  let getter;
  let setter;
  if (isFunction(getterOptions)) {
    getter = getterOptions;
  } else {
    getter = getterOptions.get;
    setter = getterOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}

// packages/reactivity/src/ref.ts
var RefImpl = class {
  constructor(rawValue, _shallow) {
    this.rawValue = rawValue;
    this._shallow = _shallow;
    this.__v_isRef = true;
    this._value = _shallow ? rawValue : toReactive(rawValue);
  }
  get value() {
    if (activeEffect) {
      trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
    }
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this.rawValue) {
      this._value = newVal;
      this.rawValue = this._shallow ? newVal : toReactive(newVal);
      triggerEffects(this.dep);
    }
  }
};
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
function createRef(rawValue, shallow) {
  return new RefImpl(rawValue, shallow);
}
function ref(value) {
  return createRef(value, false);
}
function shallowRef(value) {
  return createRef(value, true);
}
var ObjectReeImpl = class {
  constructor(_object, _key) {
    this._object = _object;
    this._key = _key;
    this.__v_isRef = true;
  }
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
};
function toRef(object, key) {
  return new ObjectReeImpl(object, key);
}
function toRefs(object) {
  const ref2 = isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ref2[key] = toRef(object, key);
  }
  return ref2;
}
function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      const v = Reflect.get(target, key, receiver);
      return v.__v_isRef ? v.value : v;
    },
    // 设置的时候如果是ref,则给ref.value赋值
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = value;
        return value;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  });
}
export {
  ReactiveEffect,
  ReactiveFlags,
  activeEffect,
  computed,
  doWatch,
  effect,
  effectScope,
  isReactive,
  proxyRefs,
  reactive,
  ref,
  shallowRef,
  toRef,
  toRefs,
  track,
  trackEffects,
  trigger,
  triggerEffects,
  watch,
  watchEffect
};
//# sourceMappingURL=index.js.map
