<template>
  <div>
    <h1>Vue Demo</h1>
    <Form @change="handleChange" />
    <p>Value: {{ value }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form } from '@/index'

const value = ref('')
const handleChange = (newValue: string) => {
  value.value = newValue
}
</script> 