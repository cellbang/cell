<template>
  <div>{{ message }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RpcUtil } from '@malagu/rpc';
import { WelcomeServer } from '../common/welcome-protocol';

const Root = defineComponent({

  data() {
    return {
      message: 'loading...'
    };
  },
  mounted() {
    this.load();

  },
  methods: {
    async load() {
      const welcomeServer = RpcUtil.get<WelcomeServer>(WelcomeServer);
      this.message =  await welcomeServer.say();
    }
  }
});

export default Root;
</script>