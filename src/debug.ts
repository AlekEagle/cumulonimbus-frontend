import { Ref, ref, onMounted, onUnmounted } from 'vue';

type DebugCheckbox<T extends boolean | null = boolean | null> = {
  type: 'checkbox';
  value: Ref<T>;
  description: string;
  default?: Exclude<T, null>;
  toggle?: string;
};

type DebugSelect<T extends string | null = string | null> = {
  type: 'select';
  value: Ref<T>;
  description: string;
  default?: Exclude<T, null>;
  states: Exclude<T, null>[];
} & (
  | {
      toggleStates: Exclude<T, null>[];
      toggle: string;
    }
  | {
      toggleStates?: never;
      toggle?: string;
    }
);

type DebugText<T extends string | null = string | null> = {
  type: 'text';
  value: Ref<T>;
  description: string;
  default?: Exclude<T, null>;
};

export type DebugSetting = DebugCheckbox | DebugSelect | DebugText;

export const debugSettings: Ref<DebugSetting[]> = ref([]) as Ref<
  DebugSetting[]
>;

export function debugRef<T extends boolean | null>(
  initialValue: T,
  configuration: Omit<DebugCheckbox<T>, 'value'>,
): Ref<T>;
export function debugRef<T extends string | null>(
  initialValue: T,
  configuration: Omit<DebugSelect<T>, 'value'>,
): Ref<T>;
export function debugRef<T extends string | null>(
  initialValue: T,
  configuration: Omit<DebugText<T>, 'value'>,
): Ref<T>;
export function debugRef<T>(
  initialValue: any,
  configuration: Omit<DebugSetting, 'value'>,
): Ref<T> {
  const value = ref(initialValue) as Ref<T>;
  const data = configuration as any;
  data.value = value;

  onMounted(() => {
    if (data != null) debugSettings.value = [...debugSettings.value, data];
  });

  onUnmounted(() => {
    const indexOf = debugSettings.value.indexOf(data);
    debugSettings.value = debugSettings.value.filter(
      (_, index) => index != indexOf,
    );
  });

  return value;
}
