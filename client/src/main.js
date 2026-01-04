import { createApp } from 'vue';
import { Quasar, Notify, Dialog, Loading, Dark } from 'quasar';

// Quasar 圖示和樣式
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css';
import 'quasar/src/css/index.sass';

import App from './App.vue';
import './style.css';

const app = createApp(App);

// 配置 Quasar
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading
  },
  config: {
    // 強制深色模式
    dark: true,
    // Apple Fitness 風格品牌色彩
    brand: {
      primary: '#FF2D55',      // 紅色 (Move/專注)
      secondary: '#30D158',    // 綠色 (Exercise/任務)
      accent: '#0A84FF',       // 藍色 (Stand/日記)
      dark: '#000000',
      positive: '#30D158',
      negative: '#FF3B30',
      info: '#0A84FF',
      warning: '#FF9500'
    },
    // 通知配置
    notify: {
      position: 'top',
      timeout: 3000,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }]
    },
    // 載入配置
    loading: {
      spinnerColor: '#FF2D55',
      backgroundColor: 'rgba(0, 0, 0, 0.8)'
    }
  }
});

// 確保深色模式啟用
Dark.set(true);

app.mount('#app');
