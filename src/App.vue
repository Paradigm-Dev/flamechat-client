<template>
  <v-app dark>
    <!-- System toolbar -->
    <v-system-bar app window style="-webkit-app-region: drag;" :class="{ 'deep-orange darken-4': $root.user, 'background-color': !$root.user }">
      <span class="font-weight-light grey--text lighten-4">Early-access beta</span>
      <v-spacer></v-spacer>
      <div class="centralize">
        <img src="./assets/logo.png" height="18" style="position: relative; top: +2px; margin-right: 5px;">
        <span>Flamechat</span>
      </div>
      <v-spacer></v-spacer>
      <div style="-webkit-app-region: no-drag; position: relative; top: +1px;">
        <v-icon @click="minimize()" v-ripple class="toolbar-icon">mdi-minus</v-icon>
        <v-icon @click="maximized ? unmaximize() : maximize()" v-ripple class="toolbar-icon">mdi-crop-square</v-icon>
        <v-icon @click="close()" v-ripple class="toolbar-icon">mdi-close</v-icon>
      </div>
    </v-system-bar>

		<!-- Site content -->
		<v-content>
      <v-card v-if="!$root.user" max-width="550px" style="margin: auto; margin-top: 170px;">
        <v-card-title>Sign In</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field clearable autocomplete="off" type="text" name="username" v-model="$root.username" label="Username"></v-text-field>
            <v-text-field clearable autocomplete="off" type="password" name="password" v-model="password" label="Password"></v-text-field>
            <v-btn @click="signIn" color="accent" text style="margin: 0px auto 16px auto;">Sign In</v-btn>
          </v-form>
          <span>To sign up, visit the website to sign up.</span>
        </v-card-text>
      </v-card>
			<Flamechat v-if="$root.user" />
		</v-content>

    <!-- Snackbar -->
		<v-snackbar v-model="$root.snackbar" bottom right :timeout="2000">{{ $root.feedback }}</v-snackbar>
  </v-app>
</template>

<script>
const remote = require('electron').remote
import Flamechat from './components/Flamechat'
import { db, auth } from './firebase'

export default {
	name: 'app',
	components: {
	  Flamechat
	},
	data() {
		return {
			win: remote.getCurrentWindow(),
      maximized: remote.getCurrentWindow().isMaximized(),
      password: ''
		}
	},
  methods: {
    close() {
      this.win.close()
    },
    maximize() {
      this.win.maximize()
      this.maximized = remote.getCurrentWindow().isMaximized()
    },
    unmaximize() {
      this.win.unmaximize()
      this.maximized = remote.getCurrentWindow().isMaximized()
    },
    minimize() {
      this.win.minimize()
    },
    reload() {
      location.reload()
    },
    goBack() {
      this.win.webContents.goBack()
    },
    goForward() {
      this.win.webContents.goForward()
    },
    signIn() {
			if(this.$root.username && this.password) {
				auth.signInWithEmailAndPassword(this.$root.username + '@theparadigmdev.com', this.password).then(() => {
          db.collection('users').doc(this.$root.username).update({ isLoggedIn: true })
          this.$root.user = true
				}).catch(error => {
					if(error.code == 'auth/invalid-email') {
						this.$notify('Do not use spaces or characters disallowed in an email address.')
					}
					if(error.code == 'auth/wrong-password') {
						this.$notify('Please check your password.')
					}
					if(error.code == 'auth/invalid-email' || 'auth/wrong-password') {
						this.$notify(error.message)
					}
				})
			} else {
				this.$notify('Please fill in the required fields.')
			}
    }
  },
  created() {
		auth.onAuthStateChanged(firebaseUser => {
			if(firebaseUser) {
				this.$root.user = true
				this.$root.username = firebaseUser.email.substring(0, firebaseUser.email.lastIndexOf("@"))

				var usersRef = db.collection('users')
				usersRef.doc(this.$root.username).get().then(doc => {
					this.$root.accountColor = doc.data().color
					this.$root.moonrocks = doc.data().moonrocks
					this.$root.isAdmin = doc.data().isAdmin
					this.$root.isInnerCore = doc.data().isInnerCore
					this.$root.isBanned = doc.data().isBanned
					this.$root.strikes = doc.data().strikes
					this.$root.accountPic = 'https://relay.theparadigmdev.com/profile-pics/' + doc.data().pic + '.jpg'
					this.$root.my_chatrooms = doc.data().chatrooms
					if (doc.data().strikes >= 3) {
						this.$root.isBanned = true
						db.collection('users').doc(this.$root.username).update({ isBanned: true })
					} else {
						this.$root.isBanned = false
						db.collection('users').doc(this.$root.username).update({ isBanned: false })
					}
				})

				usersRef.onSnapshot(snapshot => {
					snapshot.docChanges().forEach(change => {
						if(change.type === "modified" && change.doc.id == this.$root.username) {
							let doc = change.doc
							this.$root.accountColor = doc.data().color
							this.$root.moonrocks = doc.data().moonrocks
							this.$root.isAdmin = doc.data().isAdmin
							this.$root.isInnerCore = doc.data().isInnerCore
							this.$root.isBanned = doc.data().isBanned
							this.$root.strikes = doc.data().strikes
							this.$root.my_chatrooms = doc.data().chatrooms
							this.$root.accountPic = 'https://relay.theparadigmdev.com/profile-pics/' + doc.data().pic + '.jpg'
							if (doc.data().strikes >= 3) {
								this.$root.isBanned = true
								db.collection('users').doc(this.$root.username).update({ isBanned: true })
							} else {
								this.$root.isBanned = false
								db.collection('users').doc(this.$root.username).update({ isBanned: false })
							}
						}
					})
				})
			} else {
				this.$root.user = false
				this.$root.username = ''
				this.password = ''
				this.$root.accountBio = ''
				this.$root.accountColor = '#1565C0'
				this.$root.accountPic = ''
			}
		})
	}
}
</script>

<style>
/* Scrollbar */

/* width */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  background: rgb(33, 33, 33);
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(100, 100, 100);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgb(60, 60, 60);
}

/* Corner */
::-webkit-scrollbar-corner {
  background: rgb(33, 33, 33);
}

html {
  overflow-y: auto !important;
	-webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.toolbar-icon {
  border-radius: 100px;
}

.centralize {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
	text-align: center;
}

.background-color {
  background: #303030 !important;
}
</style>
