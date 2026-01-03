import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Sidebar from 'primevue/sidebar';

import 'primevue/resources/themes/lara-dark-green/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import './style.css';

import App from './App.vue';

const app = createApp(App);

app.use(PrimeVue);
app.component('Button', Button);
app.component('Card', Card);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Textarea', Textarea);
app.component('Calendar', Calendar);
app.component('Sidebar', Sidebar);

app.mount('#app');
