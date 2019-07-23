<template>
	<div class="flamechat">
    <v-toolbar dense color="deep-orange darken-3">
      <span v-if="ready">{{ chatroom_name }}</span>
      <v-spacer></v-spacer>
      <v-card-actions class="ma-0 pa-0">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-uppercase font-weight-medium" :style="{ 'color': $root.accountColor, 'text-align': 'right' }">{{ $root.username }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-avatar class="my-0">
            <img :src="$root.accountPic">
          </v-list-item-avatar>
        </v-list-item>
        <v-btn icon @click="signOut()"><v-icon>mdi-logout-variant</v-icon></v-btn>
      </v-card-actions>
    </v-toolbar>

		<v-toolbar dense color="deep-orange darken-2" v-if="flamechat_enable">
			<v-tooltip bottom v-if="chatroom_id && !ready" open-delay="1000">
				<template v-slot:activator="{ on }">
					<v-btn v-on="on" text icon @click="removeChatroom()"><v-icon>mdi-close</v-icon></v-btn>
				</template>
				<span>Remove</span>
			</v-tooltip>
			<v-tooltip bottom v-if="(chatroom_owner == $root.username || $root.isAdmin) && ready && chatroom_id" open-delay="1000">
				<template v-slot:activator="{ on }">
					<v-btn v-on="on" text icon @click="deleteVerifyPopup = true"><v-icon>mdi-delete</v-icon></v-btn>
				</template>
				<span>Delete</span>
			</v-tooltip>
			<v-tooltip bottom v-if="($root.isAdmin || chatroom_owner == $root.username) && ready && chatroom_id" open-delay="1000">
				<template v-slot:activator="{ on }">
					<v-btn v-on="on" text icon @click="purgeVerifyPopup = true"><v-icon>mdi-message-bulleted-off</v-icon></v-btn>
				</template>
				<span>Purge</span>
			</v-tooltip>
			<v-menu offset-y :close-on-content-click="false" v-if="ready && chatroom_id">
				<template v-slot:activator="{ on: menu }">
					<v-tooltip bottom open-delay="1000">
						<template v-slot:activator="{ on: tooltip }">
							<v-btn v-on="{ ...tooltip, ...menu }" text icon><v-icon>mdi-share-variant</v-icon></v-btn>
						</template>
						<span>Share</span>
					</v-tooltip>
				</template>
				<v-card>
					<v-card-text class="text-xs-center" style="user-select: text;">
						{{ chatroom_id }}
					</v-card-text>
				</v-card>
			</v-menu>
			<v-tooltip bottom v-if="ready && chatroom_id" open-delay="1000">
				<template v-slot:activator="{ on }">
					<v-btn v-on="on" text icon @click="leaveRoom()"><v-icon>mdi-exit-run</v-icon></v-btn>
				</template>
				<span>Leave</span>
			</v-tooltip>
		</v-toolbar>

		<v-container>
			<!-- Disabled card -->
			<v-card class="disabled-card" v-if="!flamechat_enable">
				<h1 class="display-4 red--text font-weight-bold">:(</h1><br><br>
				<p class="headline font-weight-light">Flamechat is off.<br>It will remain off indefinitely.</p>
			</v-card>

			<!-- Welcome card -->
			<div v-if="flamechat_enable">
				<v-card class="welcome-card" v-if="!ready || !chatroom_id">
					<v-card-title>Welcome to Flamechat!</v-card-title>
					<v-card-text>
						<v-layout row wrap text-center align-center justify-center class="mx-auto">
							<v-flex xs11><v-text-field v-model="new_chatroom_id" label="Chatroom ID"></v-text-field></v-flex>
							<v-flex xs1><v-btn small icon @click="saveChatroom()"><v-icon>mdi-plus</v-icon></v-btn></v-flex>
						</v-layout>
						<p>Your chatrooms:</p>
						<v-radio-group v-model="chatroom_id" column>
							<div @click="chatroom_name = room.name, chatroom_id = room.id" v-for="room in $root.my_chatrooms" :key="room.id" class="mb-2">
								<v-radio :label="room.name" :value="room.id"></v-radio>
							</div>
						</v-radio-group>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn :disabled="!chatroom_id" text @click.stop="setChatroom()" color="accent">Join</v-btn>
					</v-card-actions>
					<v-btn color="deep-purple" fab fixed bottom right @click="create_chatroom_dialog = true">
						<v-icon>mdi-book-multiple-plus</v-icon>
					</v-btn>
				</v-card>

				<!-- Chat card -->
				<v-card class="chat-card" v-if="ready && chatroom_id">
					<v-card-text>
						<ul class="messages" v-chat-scroll="{ always: false }">
							<p v-if="messages == []">There are no messages posted on this room.</p>
							<li v-for="message in messages" :key="message.id" :id="message.id">
								<v-layout row wrap>
									<v-flex xs10>
										<v-list-item style="cursor: pointer; border-radius: 12px;" v-ripple @click="openUsernamePopup(message.name)">
											<v-list-item-avatar class="my-0">
												<img :src="message.pic">
											</v-list-item-avatar>
											<v-list-item-content style="position: relative; left: -8px;">
												<v-list-item-title class="text-uppercase font-weight-medium" :style="{ 'color': message.color }">{{ message.name }}</v-list-item-title>
												<v-list-item-subtitle class="time">{{ message.timestamp }}</v-list-item-subtitle>
											</v-list-item-content>
										</v-list-item>
									</v-flex>
									<v-flex xs2 text-xs-right>
										<v-tooltip bottom open-delay="1000">
											<template v-slot:activator="{ on }">
												<v-btn v-on="on" class="admin-btn" icon small color="orange" v-if="$root.isAdmin || $root.username == message.name" @click.prevent="reportChat(message.id)"><v-icon>mdi-exclamation</v-icon></v-btn>
											</template>
											<span>Report</span>
										</v-tooltip>
										<v-tooltip bottom open-delay="1000">
											<template v-slot:activator="{ on }">
												<v-btn v-on="on" class="admin-btn" icon small color="warning" v-if="$root.isAdmin || $root.username == message.name" @click.prevent="editor = true, editing = message.id, editMessage = message.content"><v-icon>mdi-pencil</v-icon></v-btn>
											</template>
											<span>Edit</span>
										</v-tooltip>
										<v-tooltip bottom open-delay="1000">
											<template v-slot:activator="{ on }">
												<v-btn v-on="on" class="admin-btn" icon small color="error" v-if="$root.isAdmin || $root.username == message.name" @click.prevent="deleteChat(message.id)"><v-icon>mdi-delete</v-icon></v-btn>
											</template>
											<span>Delete</span>
										</v-tooltip>
									</v-flex>
									<v-flex xs12>
										<span v-if="flamechat_html_render" v-html="message.content" class="message"></span>
										<span v-if="!flamechat_html_render" class="message">{{ message.content }}</span>
									</v-flex>
								</v-layout>
							</li>
						</ul>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<form @submit.prevent="sendChat" class="new-message" v-if="!editor">
							<v-layout row text-xs-center align-center justify-center>
								<v-flex xs12><v-text-field :disabled="!flamechat_enable" class="message-box" autocomplete="off" label="Message..." v-model="newMessage"></v-text-field></v-flex>
								<v-flex xs1><v-btn :disabled="!flamechat_enable" id="submit" type="submit" small icon><v-icon>mdi-send</v-icon></v-btn></v-flex>
							</v-layout>
						</form>
						<form @submit.prevent="editChat" class="new-message" v-if="editor">
							<v-layout row text-xs-center align-center justify-center>
								<v-flex xs12><v-text-field :disabled="!flamechat_enable" class="message-box" autocomplete="off" label="Edit message..." v-model="editMessage"></v-text-field></v-flex>
								<v-flex xs1><v-btn :disabled="!flamechat_enable" id="submit" type="submit" small icon><v-icon>mdi-pencil</v-icon></v-btn></v-flex>
							</v-layout>
						</form>
					</v-card-actions>
				</v-card>

			</div>
		</v-container>

		<v-dialog v-model="profilePopupEnable" max-width="450">
			<v-card>
				<div v-if="usersDbDownloaded">
					<v-list-item two-line>
						<v-list-item-avatar class="my-0">
							<img :src="profilePopupPic">
						</v-list-item-avatar>
						<v-list-item-content style="position: relative; left: -14px;">
							<v-list-item-title class="text-uppercase font-weight-medium" :style="{ 'color': profilePopupColor }">{{ profilePopupUsername }}</v-list-item-title>
							<v-list-item-subtitle>{{ profilePopupBio }}</v-list-item-subtitle>
						</v-list-item-content>
						<v-btn icon @click="closeUsernamePopup()" class="dialog-close-btn">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</v-list-item>
					<!-- <v-card-text>
						<img src="@/assets/isAdmin.png" alt="Administrator" class="moonrock-img" v-if="profilePopupAdmin" style="height: 25px !important;">
						<img src="@/assets/asteroid.png" alt="Asteroid" class="moonrock-img" v-if="profilePopupAsteroid" style="height: 25px !important;"><br>
						<img src="@/assets/moonrocks.png" alt="Moonrocks" class="moonrock-img"><span class="moonrock-count font-weight-medium">{{ profilePopupMoonrocks }}</span>
					</v-card-text> -->
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn text @click="$noFunc()" color="accent">Message</v-btn>
					</v-card-actions>
				</div>
			</v-card>
		</v-dialog>

		<v-dialog v-model="create_chatroom_dialog" max-width="450">
			<v-card>
				<v-card-title><h3 class="headline mb-0">Create a Chatroom</h3></v-card-title>
				<v-card-text>
					<p>Chatroom ID: <span class="font-weight-light">{{ create_chatroom_id }}</span></p>
					<v-text-field v-model="create_chatroom_name" label="Chatroom Name"></v-text-field>
					<div v-if="$root.moonrocks > 50">
						<!-- <img src="@/assets/moonrocks.png" alt="Moonrocks" class="moonrock-img"><span class="moonrock-count font-weight-medium red--text">- 50</span> -->
						<p class="green--text">You have enough moonrocks to purchase a chatroom.</p>
						<p>New Balance: <span class="font-weight-light">{{ $root.moonrocks - 50 }} Moonrocks</span></p>
					</div>
					<div v-if="$root.moonrocks == 50">
						<!-- <img src="@/assets/moonrocks.png" alt="Moonrocks" class="moonrock-img"><span class="moonrock-count font-weight-medium red--text">- 50</span> -->
						<p class="orange--text">You have just enough moonrocks to purchase a chatroom.</p>
					</div>
					<div v-if="$root.moonrocks < 50">
						<!-- <img src="@/assets/moonrocks.png" alt="Moonrocks" class="moonrock-img"><span class="moonrock-count font-weight-medium red--text">- 50</span> -->
						<p class="red--text">You do <b>not</b> have enough moonrocks to purchase a chatroom.</p>
					</div>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-btn @click="createChatroom()" color="warning" text>Buy</v-btn>
					<v-btn @click="create_chatroom_dialog = false" text color="accent">Cancel</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="purgeVerifyPopup" max-width="400">
			<v-card>
				<v-card-title><h3 class="headline mb-0">Purge Chatroom</h3></v-card-title>
				<v-card-text>Are you sure you want to purge this chatroom?</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-btn @click="clearAllMessages()" color="red" text>Yes</v-btn>
					<v-spacer></v-spacer>
					<v-btn @click="purgeVerifyPopup = false" color="green" text>Cancel</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="deleteVerifyPopup" max-width="400">
			<v-card>
				<v-card-title><h3 class="headline mb-0">Delete Chatroom</h3></v-card-title>
				<v-card-text>Are you sure you want to delete this chatroom? A refund will not be issued.</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-btn @click="deleteChatroom()" color="red" text>Yes</v-btn>
					<v-spacer></v-spacer>
					<v-btn @click="deleteVerifyPopup = false" color="green" text>Cancel</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { db, app, auth } from './../firebase'
import moment from 'moment'

export default {
	name: 'Flamechat',
  data() {
    return {
			ready: false,
			messages: [],
			newMessage: '',
			editMessage: '',
			editor: false,
			editing: null,
			flamechat_enable: true,
			chatroom_id: '',
			chatroom_name: '',
			chatroom_owner: '',
			flamechat_html_render: true,
			profilePopupUsername: '',
			profilePopupEnable: false,
			profilePopupBio: '',
			profilePopupColor: '',
			profilePopupMoonrocks: '',
			profilePopupPic: '',
			usersDbDownloaded: false,
			profilePopupAdmin: false,
			profilePopupAsteroid: false,
			purgeVerifyPopup: false,
			deleteVerifyPopup: false,
			new_chatroom_id: '',
			new_chatroom_name: '',
			create_chatroom_dialog: false,
			create_chatroom_name: ''
    }
	},
	created() {
		this.chatroom_id = null
		this.chatroom_name = null

		var metaRef = db.collection('paradigm')
		metaRef.doc('config').get().then((doc) => {
			this.flamechat_enable = doc.data().flamechat_enable
			this.flamechat_html_render = doc.data().flamechat_html_render
		})

		metaRef.onSnapshot(snapshot => {
			snapshot.docChanges().forEach(change => {
				if(change.type === "modified") {
					let doc = change.doc
					this.flamechat_enable = doc.data().flamechat_enable
					this.flamechat_html_render = doc.data().flamechat_html_render
					this.newMessage = null
				}
			})
		})
	},
	methods: {
		deleteChat(id) {
			db.collection('flamechat').doc('chatrooms').collection(this.chatroom_id).doc(id).delete().then(() => {

      })
		},
		clearAllMessages() {
			var message
			for (message in this.messages) {
				db.collection('flamechat').doc('chatrooms').collection(this.chatroom_id).get().then(snapshot => {
					snapshot.forEach(doc => {
						doc.ref.delete()
          })
        })
			}
			this.purgeVerifyPopup = false
		},
		sendChat() {
			if(this.newMessage && this.$root.username != '' && this.$root.accountColor != null) {
				db.collection('flamechat').doc('chatrooms').collection(this.chatroom_id).add({
					name: this.$root.username,
					content: this.newMessage,
					color: this.$root.accountColor,
					timestamp: Date.now(),
					pic: this.$root.accountPic,
					chatroom_id: this.chatroom_id,
					chatroom: this.chatroom_name
				}).catch(error => {
					console.log(error.message)
					this.$notify('Your message did not send successfully!')
				})
				this.newMessage = null
			} else {
				this.$notify('Your message did not send sucessfully!')
			}
		},
		editChat(id) {
			db.collection('flamechat').doc('chatrooms').collection(this.chatroom_id).doc(this.editing).update({
				content: this.editMessage
			}).then(() => {
				this.editing = null
				this.editMessage = ''
				this.editor = false
			}).catch(error => {
				this.$notify(error.message)
			})
		},
		setChatroom() {
			db.collection('flamechat').doc(this.chatroom_id).get().then(doc => {
				if (doc.exists) {
					this.chatroom_name = doc.data().name
					this.chatroom_owner = doc.data().owner
					let ref = db.collection('flamechat').doc('chatrooms').collection(this.chatroom_id).orderBy('timestamp', 'asc')
					this.messages = []
					this.editing = null
					this.editMessage = ''
					this.editor = false
					ref.onSnapshot(snapshot => {
						snapshot.docChanges().forEach(change => {
							if(change.type === "added") {
								let doc = change.doc
								this.messages.splice(change.newIndex, 0, {
									id: doc.id,
									name: doc.data().name,
									content: doc.data().content,
									color: doc.data().color,
									timestamp: moment(doc.data().timestamp).format('MMMM Do YYYY, h:mm:ss a'),
									pic: doc.data().pic
								})
							}
							if(change.type === "removed") {
								let doc = change.doc
								this.messages.splice(change.oldIndex, 1)
							}
							if(change.type === "modified") {
								let doc = change.doc
								this.messages.splice(change.oldIndex, 1, {
									id: doc.id,
									name: doc.data().name,
									content: doc.data().content,
									color: doc.data().color,
									timestamp: moment(doc.data().timestamp).format('MMMM Do YYYY, h:mm:ss a'),
									pic: doc.data().pic
								})
							}
						})
					})
					this.ready = true
				} else {
					this.$notify('Chatroom does not exist')
					db.collection('users').doc(this.$root.username).update({
						chatrooms: app.firestore.FieldValue.arrayRemove({ id: this.chatroom_id })
					})
				}
			})
		},
		leaveRoom() {
			this.chatroom_id = null
			this.chatroom_name = null
			this.ready = false
		},
		openUsernamePopup(username, color) {
			this.usersDbDownloaded = false
			var usersRef = db.collection('users')
			usersRef.doc(username).get().then((doc) => {
				this.profilePopupBio = doc.data().bio,
				this.profilePopupColor = doc.data().color
				this.profilePopupMoonrocks = doc.data().moonrocks
				this.profilePopupUsername = username
				this.profilePopupAdmin = doc.data().isAdmin
				this.profilePopupAsteroid = doc.data().isAsteroid
				this.profilePopupPic = 'https://relay.theparadigmdev.com/profile-pics/' + doc.data().pic + '.jpg'
				this.usersDbDownloaded = true
			})

			usersRef.onSnapshot(snapshot => {
				snapshot.docChanges().forEach(change => {
					if(change.type === "modified") {
						let doc = change.doc
						this.profilePopupBio = doc.data().bio,
						this.profilePopupColor = doc.data().color
						this.profilePopupMoonrocks = doc.data().moonrocks
						this.profilePopupUsername = username
						this.profilePopupAdmin = doc.data().isAdmin
						this.profilePopupAsteroid = doc.data().isAsteroid
						this.profilePopupPic = 'https://relay.theparadigmdev.com/profile-pics/' + doc.data().pic + '.jpg'
						this.usersDbDownloaded = true
					}
				})
			})
			this.profilePopupEnable = true
		},
		closeUsernamePopup() {
			this.profilePopupEnable = false
			this.profilePopupUsername = ''
			this.profilePopupBio = ''
			this.profilePopupColor = ''
			this.profilePopupMoonrocks = ''
			this.profilePopupAdmin = false,
			this.profilePopupAsteroid = false
			this.profilePopupPic = ''
			this.usersDbDownloaded = false
		},
		saveChatroom() {
			db.collection('flamechat').doc(this.new_chatroom_id).get().then(doc => {
				if (doc.exists) {
					this.new_chatroom_name = doc.data().name
					db.collection('users').doc(this.$root.username).update({
						chatrooms: app.firestore.FieldValue.arrayUnion({ id: this.new_chatroom_id, name: this.new_chatroom_name })
					}).then(() => {
						this.new_chatroom_id = ''
					})
				} else {
					this.$notify('Chatroom does not exist')
				}
			})
		},
		createChatroom() {
			db.collection('flamechat').doc(this.create_chatroom_id).set({
				name: this.create_chatroom_name,
				id: this.create_chatroom_id,
				owner: this.username
			}).then(() => {
				db.collection('users').doc(this.$root.username).update({
					chatrooms: app.firestore.FieldValue.arrayUnion({ name: this.create_chatroom_name, id: this.create_chatroom_id }),
					moonrocks: app.firestore.FieldValue.increment(-50)
				}).then(() => {
					this.chatroom_id = this.create_chatroom_id
					this.setChatroom()
				})
			})
		},
		deleteChatroom() {
			if (this.chatroom_owner == this.$root.username) {
				this.clearAllMessages()
				db.collection('flamechat').doc(this.chatroom_id).delete().then(() => {
					this.leaveRoom()
				})
			}
		},
		removeChatroom() {
			db.collection('users').doc(this.$root.username).update({
				chatrooms: app.firestore.FieldValue.arrayRemove({ name: this.chatroom_name, id: this.chatroom_id })
			})
    },
    signOut() {
			auth.signOut().then(() => {
				db.collection('users').doc(this.$root.username).update({ isLoggedIn: false }).catch(error => this.$notify(error.message))
			}).catch(error => this.$notify(error.message))
		}
	},
	computed: {
		create_chatroom_id() {
			return Math.random().toString(36).substring(7)
		}
	}
}
</script>

<style scoped>
.welcome-card {
	margin: 50px auto;
	width: 100%;
	max-width: 550px;
}

.hidden {
	display: none;
}

.new-message {
	width: 100%;
	position: relative;
	bottom: -12px;
	left: +16px;
}

.v-card__text {
	height: 100%;
}

.chat-card {
	margin: auto;
	width: 100%;
	height: 100%;
	max-width: 1250px;
}

.chat-card h2 {
	font-size: 2.6em;
	margin-bottom: 40px;
}

.chat-card span {
	font-size: 1.25em;
}

.chat-card ul {
  padding-left: 12px;
}

.chat-card li {
	margin-bottom: 15px;
	list-style-type: none;
}

.chat-card .time {
	display: block;
	font-size: .85em;
}

.messages {
	height: calc(100vh - 312px);
	overflow-y: auto;
	overflow-x: hidden;
}

.chat-card .name {
	font-size: 20px;
	margin: 0px 3px 3px 0px;
}

div.v-input__slot {
	margin: 0px !important;
}

.disabled-card {
	width: 100%;
	max-width: 350px;
	text-align: center;
	padding: 8px;
	margin: 64px auto;
}
</style>