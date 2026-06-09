<template>
  <div>
    <label>{{ label }}</label>
    <input
      :type="type ? type : 'text'"
      class="input"
      :value="modelValue"
      @input="updateValue"
      @keyup.enter="$emit('enter')"
      ref="textInput"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    label: String,
    modelValue: [String, Number],
    type: String,
    autofocus: Boolean,
    modelModifiers: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue", "input", "enter"],
  mounted() {
    if (!this.$props.autofocus) {
      return;
    }
    const textInput = this.$refs.textInput;
    if (textInput instanceof HTMLInputElement) {
      textInput.focus();
    }
  },
  methods: {
    updateValue(event: Event) {
      const target = event.target as HTMLInputElement;
      const value = this.modelModifiers.number
        ? Number(target.value)
        : target.value;
      this.$emit("update:modelValue", value);
      this.$emit("input", value);
    },
  },
});
</script>
