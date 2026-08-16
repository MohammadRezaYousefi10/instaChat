import { create } from "zustand";
import { Story } from "@/types";

interface StoryState {

    stories: Story[];

    loading: boolean;

    refreshing: boolean;

    setStories(stories: Story[]): void;

    addStory(story: Story): void;

    updateStory(id: string, data: Partial<Story>): void;

    removeStory(id: string): void;

    clear(): void;

    setLoading(value: boolean): void;

    setRefreshing(value: boolean): void;

}

export const useStoryStore =
create<StoryState>((set) => ({

    stories: [],

    loading: false,

    refreshing: false,

    setStories(stories) {

        set({ stories });

    },

    addStory(story) {

        set(state => ({
            stories: [story, ...state.stories],
        }));

    },

    updateStory(id, data) {

        set(state => ({

            stories: state.stories.map(story =>

                story._id === id

                    ? {
                          ...story,
                          ...data,
                      }

                    : story

            ),

        }));

    },

    removeStory(id) {

        set(state => ({

            stories: state.stories.filter(

                story => story._id !== id

            ),

        }));

    },

    clear() {

        set({

            stories: [],

        });

    },

    setLoading(value) {

        set({

            loading: value,

        });

    },

    setRefreshing(value) {

        set({

            refreshing: value,

        });

    },

}));