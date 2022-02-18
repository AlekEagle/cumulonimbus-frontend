<template>
  <div class="checkbox-container">
    <p
      class="label-left"
      v-if="$props.labelLeft !== null"
      v-text="$props.labelLeft"
      @click="handleLeftLabelClick"
    />
    <input
      type="checkbox"
      :id="$data.UID"
      ref="toggleSwitch"
      :checked="$data.__checked"
      :name="$props.name"
      @change.prevent="handleChange"
    />
    <label :for="$data.UID">
      <span></span>
    </label>
    <p
      class="label-right"
      v-if="$props.labelRight !== null"
      v-text="$props.labelRight"
      @click="handleRightLabelClick"
    />
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  const validCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789-_';

  function generateUID(length: number = 10): string {
    return new Array(length)
      .fill('a')
      .map(() =>
        validCharacters.charAt(
          Math.floor(Math.random() * validCharacters.length)
        )
      )
      .join('');
  }

  @Options({
    props: {
      labelLeft: {
        type: String,
        default: null
      },
      labelRight: {
        type: String,
        default: null
      },
      isChecked: {
        type: Boolean,
        default: false
      },
      labelsChangeValue: {
        type: Boolean,
        default: false
      },
      name: {
        type: String,
        default: 'toggle-switch'
      }
    },
    emits: ['change', 'leftLabelClick', 'rightLabelClick'],
    data() {
      return {
        UID: generateUID(),
        __checked: false
      };
    }
  })
  export default class ToggleSwitch extends Vue {
    declare $data: {
      UID: string;
      __checked: boolean;
    };
    declare $refs: {
      toggleSwitch: HTMLInputElement;
    };
    declare $props: {
      labelLeft: string;
      labelRight: string;
      isChecked: boolean;
      labelsChangeValue: boolean;
      name: string;
    };
    mounted() {
      this.checked = this.$props.isChecked;
    }

    handleChange() {
      this.checked = !this.checked;
      this.$emit('change', this.checked);
    }

    handleLeftLabelClick() {
      this.$emit('leftLabelClick');
      if (this.$props.labelsChangeValue) this.checked = false;
    }

    handleRightLabelClick() {
      this.$emit('rightLabelClick');
      if (this.$props.labelsChangeValue) this.checked = true;
    }

    get checked() {
      return this.$data.__checked;
    }

    set checked(value: boolean) {
      this.$data.__checked = value;
      this.$refs.toggleSwitch.checked = this.checked;
    }
  }
</script>
