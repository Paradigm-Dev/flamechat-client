import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'
import VueChatScroll from 'vue-chat-scroll'

Vue.use(VueChatScroll)

const opts = {
  icons: {
    iconfont: 'mdi'
  },
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      }
    }
  }
}

Vue.config.productionTip = false

Vue.use(Vuetify)

Vue.mixin({
  methods: {
    $notify(text) {
      this.$root.feedback = text
      this.$root.snackbar = true
    }
  }
})

new Vue({
  render: function(h) { return h(App) },
  vuetify: new Vuetify(opts),
  data() {
    return {
      snackbar: false,
      feedback: '',
      user: false,
      username: '',
      accountColor: '',
      moonrocks: null,
      isAdmin: false,
      isInnerCore: false,
      isBanned: false,
      strikes: null,
      my_chatrooms: [],
      accountPic: ''
    }
  }
}).$mount('div#app')    
