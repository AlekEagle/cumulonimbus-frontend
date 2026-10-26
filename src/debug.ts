import { Ref, ref, onMounted, onUnmounted } from 'vue';

type DebugCheckbox<T extends boolean = boolean> = {
  type: 'checkbox';
  value: Ref<boolean>;
  description: string;
  toggle?: string;
};

type DebugSelect<T extends string = string> = {
  type: 'select';
  value: Ref<T>;
  description: string;
  states: T[];
} & (
  | {
      toggleStates: string[];
      toggle: string;
    }
  | {
      toggleStates?: never;
      toggle?: string;
    }
);

type DebugSetting = DebugCheckbox | DebugSelect;

export const debugSettings: Ref<DebugSetting[]> = ref([]) as Ref<
  DebugSetting[]
>;

export function debugRef<T extends string>(
  initialValue: T,
  configuration: Omit<DebugSelect<T>, 'value'>,
): Ref<T>;
export function debugRef<T extends boolean>(
  initialValue: T,
  configuration: Omit<DebugCheckbox<T>, 'value'>,
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
    debugSettings.value = debugSettings.value.filter((value) => value == data);
  });

  return value;
}
