import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import VueChatScroll from "vue-chat-scroll";
import io from "socket.io-client";

let socket = io.connect("https://www.theparadigmdev.com");

Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.use(VueChatScroll);

Vue.mixin({
  methods: {
    $getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    $notify(text) {
      this.$root.notify.text = text;
      this.$root.notify.is = true;
      setTimeout(() => {
        this.$root.notify.text = "";
        this.$root.notify.is = false;
      }, 3000);
    }
  }
});

new Vue({
  vuetify,
  render: h => h(App),
  data() {
    return {
      notify: {
        is: false,
        text: ""
      },
      user: false,
      socket
    };
  },
  created() {
    // Check for service worker
    if ("serviceWorker" in navigator) {
      registerServiceWorker().catch(err => console.error(err));
    }

    let that = this;
    // Register SW, Register Push, Send Push
    async function registerServiceWorker() {
      // Register Service Worker
      console.log("Registering service worker...");
      that.$root.worker = await navigator.serviceWorker.register(
        `${process.env.BASE_URL}worker.js`,
        {
          scope: "/"
        }
      );
      console.log("Service Worker Registered...");
    }
  }
}).$mount("#app");
