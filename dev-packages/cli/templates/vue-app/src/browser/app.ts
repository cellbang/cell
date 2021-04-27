import { createApp } from 'vue';
import { App } from '@malagu/vue';
import  router from './rouer'
import Root from './App.vue';

@App(createApp(Root).use(router))
export default class { }
