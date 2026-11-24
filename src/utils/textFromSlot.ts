import { computed, useSlots, type VNode, Comment, Fragment, Text } from 'vue';

function extractTextFromVNodes(vnodes: VNode[]): string {
  return vnodes
    .map((node) => {
      if (node.type === Comment) return '';
      if (node.type === Text || typeof node.children === 'string') {
        return node.children as string;
      }
      if (Array.isArray(node.children)) {
        return extractTextFromVNodes(node.children as VNode[]);
      }
      if (node.type === Fragment && Array.isArray(node.children)) {
        return extractTextFromVNodes(node.children as VNode[]);
      }
      return '';
    })
    .join('');
}

export default function useTextFromSlot() {
  const __slots = useSlots();

  function fromNamedSlot(name: string) {
    const slot = __slots[name]?.();
    if (!slot) return null;
    return extractTextFromVNodes(slot);
  }

  const defaultSlot = computed(() => {
    return fromNamedSlot('default');
  });

  return {
    default: defaultSlot,
    fromNamedSlot,
    __slots,
  };
}
