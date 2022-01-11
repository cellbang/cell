<template>
  <div>
    <img alt="malagu logo" :src="logoImage" />
    <HelloWorld :msg="message" />
  </div>
</template>

<script lang="ts">
import HelloWorld from '../components/HelloWorld.vue';
import { defineComponent } from 'vue';
import { RpcUtil } from '@malagu/rpc';
import { WelcomeServer } from '../../common/welcome-protocol';
import * as logoImage from '../images/logo.png';

const Root = defineComponent({
  components: {
    HelloWorld,
  },
  data() {
    return {
      logoImage,
      message: 'loading...',
    };
  },
  mounted() {
    this.load();
  },
  methods: {
    async load() {
      const welcomeServer = RpcUtil.get<WelcomeServer>(WelcomeServer);
      this.message = await welcomeServer.say();
    },
  },
});

export default Root;
</script>
