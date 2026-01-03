import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import 'primevue/resources/themes/lara-dark-green/theme.css';
import 'primeicons/primeicons.css';

import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

import App from './App.vue';
import './style.css';

const app = createApp(App);

app.use(PrimeVue);
app.use(ToastService);
app.use(ConfirmationService);

// Register PrimeVue components globally
app.component('Button', Button);
app.component('Card', Card);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Textarea', Textarea);
app.component('Calendar', Calendar);
app.component('Toast', Toast);
app.component('ConfirmDialog', ConfirmDialog);

app.mount('#app');
