import { create } from "zustand";

interface SelectionState {
    enabled: boolean;
    selectedIds: Set<string>;
    enter(id: string): void;
    toggle(id: string): void;
    clear(): void;
    isSelected(id: string): boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
    enabled: false,
    selectedIds: new Set<string>(),

    enter(id) {
        set({
            enabled: true,
            selectedIds: new Set([id]),
        });
    },

    toggle(id) {
        const current = get().selectedIds;
        const next = new Set(current);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }

        set({
            enabled: next.size > 0,
            selectedIds: next,
        });
    },

    clear() {
        set({
            enabled: false,
            selectedIds: new Set(),
        });
    },

    isSelected(id) {
        return get().selectedIds.has(id);
    },
}));