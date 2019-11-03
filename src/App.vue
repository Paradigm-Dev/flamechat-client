<template>
  <v-app>
    <!-- System toolbar -->
    <v-system-bar app window style="-webkit-app-region: drag;" :class="{ 'deep-orange darken-4': $root.user, 'background-color': !$root.user }">
      <div v-if="!$root.notify.is" style="display: inline-flex !important;">
        <img @click.left="reload()" src="./assets/logo.png" height="18" style="margin-right: 4px;">
        <span style="margin-right: 4px">Flamechat</span>
        <span class="font-weight-light grey--text mr-2">early-access beta</span>
      </div>
      <span v-if="$root.notify.is">{{ $root.notify.text }}</span>
			<v-spacer></v-spacer>
			<v-menu offset-y v-if="$root.user" style="-webkit-app-region: no-drag;">
				<template v-slot:activator="{ on }">
					<div class="centralize" style="-webkit-app-region: no-drag;" v-on="on">
						<v-avatar height="26" width="26" min-width="26" class="mr-2">
							<img :src="$root.accountPic">
						</v-avatar>
						<span class="text-uppercase font-weight-medium" :style="{ 'color': $root.accountColor, 'top': '+1px', 'position': 'relative' }">{{ $root.username }}</span>
					</div>
				</template>
				<v-list dense>
					<v-list-item @click="$noFunc()">
						<v-list-item-icon><v-icon class="orange--text">mdi-pencil</v-icon></v-list-item-icon>
						<v-list-item-title class="orange--text">Edit account</v-list-item-title>
					</v-list-item>
					<v-divider></v-divider>
					<v-list-item @click="signOut()">
						<v-list-item-icon><v-icon>mdi-logout-variant</v-icon></v-list-item-icon>
						<v-list-item-title>Sign out</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
      <v-spacer></v-spacer>
      <div style="-webkit-app-region: no-drag;">
        <v-icon @click="minimize()" v-ripple class="toolbar-icon">mdi-minus</v-icon>
        <v-icon @click="maximized ? unmaximize() : maximize()" v-ripple class="toolbar-icon">mdi-crop-square</v-icon>
        <v-icon @click="close()" v-ripple class="toolbar-icon">mdi-close</v-icon>
      </div>
    </v-system-bar>

		<!-- Site content -->
		<v-content>
      <v-card v-if="!$root.user" max-width="400px" style="margin: auto; margin-top: 170px;" class="elevation-0 background-color">
        <h5 class="headline text-center">Account</h5>
        <v-card-text>
          <v-form>
            <v-text-field clearable autocomplete="off" type="text" name="username" v-model="$root.username" label="Username"></v-text-field>
            <v-text-field clearable autocomplete="off" type="password" name="password" v-model="password" label="Password"></v-text-field>
						<div class="text-center">
							<v-btn @click="signIn" color="accent" :disabled="!$root.username || !password" text style="margin: 0px auto 16px auto;">Sign In</v-btn>
						</div>
          </v-form>
          <p class="text-center">To sign up, visit the website.</p>
        </v-card-text>
      </v-card>
			<Flamechat v-if="$root.user" />
		</v-content>
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
      this.win.reload()
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
		},
		signOut() {
			auth.signOut().then(() => {
				this.$notify('Signed out successfully.')
			}).catch(error => this.$notify(error.message))
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

.v-system-bar.v-system-bar--fixed.v-system-bar--window {
  padding: 0px 0px 0px 6px !important;
}

.moonrock-img {
	height: 50px;
	margin-bottom: 16px;
}

.moonrock-count {
	position: relative;
	bottom: +36px;
	padding-left: 5px;
}
</style>
