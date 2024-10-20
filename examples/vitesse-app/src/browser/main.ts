import { createApp } from 'vue';
import { App } from '@celljs/vue';
import Root from './App.vue'
import router from './router'

@App(createApp(Root).use(router))
export default class {}
