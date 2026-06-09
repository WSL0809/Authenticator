<template>
  <div class="control-group">
    <label class="combo-label" style="margin: 20px 10px">{{ label }}</label>
    <select
      style="margin: 20px 10px"
      :value="modelValue"
      :disabled="disabled"
      @change="updateValue"
    >
      <slot></slot>
    </select>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    label: String,
    modelValue: [String, Number],
    disabled: Boolean,
    modelModifiers: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue", "change"],
  methods: {
    updateValue(event: Event) {
      const target = event.target as HTMLSelectElement;
      const value = this.modelModifiers.number
        ? Number(target.value)
        : target.value;
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
    },
  },
});
</script>
