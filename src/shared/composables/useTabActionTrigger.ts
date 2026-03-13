import { watch, type MaybeRefOrGetter, toValue } from 'vue';

export function useTabActionTrigger(
    action: MaybeRefOrGetter<{ action: string } | null | undefined>,
    actionName: string,
    onMatched: () => void
) {
    watch(
        () => toValue(action),
        (value) => {
            if (value?.action === actionName) {
                onMatched();
            }
        },
        { immediate: true }
    );
}

