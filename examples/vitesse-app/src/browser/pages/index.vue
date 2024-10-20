<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div>
    Index Page
    <button @click="router.push('/')">跳转到首页</button>
    <HelloWorld />
  </div>
</template>
