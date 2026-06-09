<template>
  <div class="control-group">
    <label class="combo-label">{{ label }}</label>
    <input
      class="checkbox"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="updateValue"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    label: String,
    modelValue: Boolean,
    disabled: Boolean,
  },
  emits: ["update:modelValue", "change"],
  methods: {
    updateValue(event: Event) {
      const target = event.target as HTMLInputElement;
      this.$emit("update:modelValue", target.checked);
      this.$emit("change", target.checked);
    },
  },
});
</script>
