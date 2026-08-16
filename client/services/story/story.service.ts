import { api } from "@/services/api/api";
import { Story } from "@/types";
import { useStoryStore } from "@/store";

interface GetStoriesResponse {

    success: boolean;

    stories: Story[];

}

class StoryService {

    private retryTimer?: ReturnType<typeof setTimeout>;

    async fetch() {

        const store = useStoryStore.getState();

        if (store.loading) return;

        store.setLoading(true);

        try {

            const { data } =
                await api.get<GetStoriesResponse>(
                    "/api/stories"
                );

            if (data.success) {

                store.setStories(
                    data.stories
                );

            }

        } finally {

            store.setLoading(false);

        }

    }

    async refresh() {

        const store = useStoryStore.getState();

        store.setRefreshing(true);

        try {

            const { data } =
                await api.get<GetStoriesResponse>(
                    "/api/stories"
                );

            if (data.success) {

                store.setStories(
                    data.stories
                );

            }

        } finally {

            store.setRefreshing(false);

        }

    }

    scheduleRetry(delay = 1500) {

        this.stopRetry();

        this.retryTimer = setTimeout(() => {

            this.fetch();

        }, delay);

    }

    stopRetry() {

        if (!this.retryTimer) return;

        clearTimeout(this.retryTimer);

        this.retryTimer = undefined;

    }

}

export const storyService =
new StoryService();