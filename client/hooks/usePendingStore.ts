import { usePendingStore as store } from "@/store";

export const usePendingMessages = () => {
  const pending = store((state) => state.pending);

  const add = store((state) => state.add);

  const remove = store((state) => state.remove);

  const clear = store((state) => state.clear);

  const has = store((state) => state.has);

  const get = store((state) => state.get);

  const getAll = store((state) => state.getAll);

  const incrementRetry = store((state) => state.incrementRetry);

  const updateNextRetry = store((state) => state.updateNextRetry);

  return {
    pending,

    add,

    remove,

    clear,

    has,

    get,

    getAll,

    incrementRetry,

    updateNextRetry,
  };
};
