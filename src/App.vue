<template>
  <v-app style="overflow: hidden">
    <v-system-bar
      v-if="process.platform != 'darwin'"
      app
      window
      style="-webkit-app-region: drag; -webkit-user-select: none"
      height="38"
      :class="{ 'elevation-3': $root.user }"
      :color="$root.user ? '#0C4A6E' : 'transparent'"
      class="pr-0"
    >
      <v-fade-transition group leave-absolute>
        <div
          key="logo"
          v-if="!$root.notify.is"
          style="display: inline-flex !important; margin-left: 2px; z-index: 10"
        >
          <img
            src="./assets/logo.png"
            style="margin-right: 4px; margin-top: 3px; height: 18px"
          />
          <span style="margin-top: 2px" class="mr-2">Wire</span>
          <v-icon
            style="-webkit-app-region: no-drag"
            class="toolbar-icon grey--text text--lighten-1"
            @click="leaveChatroom()"
            v-if="
              current && !current_dm_person && current.owner != $root.user._id
            "
            v-ripple
            >mdi-arrow-expand-left</v-icon
          >
          <v-icon
            style="-webkit-app-region: no-drag"
            class="toolbar-icon grey--text text--lighten-1"
            @click="deleteChatroom()"
            v-if="current && !current_dm_person"
            v-ripple
            >mdi-delete</v-icon
          >
        </div>
        <span
          key="notification"
          v-if="$root.notify.is"
          v-html="$root.notify.text"
        ></span>
      </v-fade-transition>

      <v-spacer></v-spacer>
      <div style="-webkit-app-region: no-drag; margin-bottom: 1px">
        <v-icon @click="minimize()" v-ripple class="toolbar-icon"
          >mdi-minus</v-icon
        >
        <v-icon
          @click="maximized ? unmaximize() : maximize()"
          v-ripple
          class="toolbar-icon"
          >mdi-crop-square</v-icon
        >
        <v-icon @click="close()" v-ripple class="toolbar-icon"
          >mdi-close</v-icon
        >
      </div>
    </v-system-bar>

    <v-system-bar
      v-if="process.platform == 'darwin'"
      app
      window
      style="-webkit-app-region: drag"
      height="38"
      :class="{ 'elevation-3': $root.user }"
      :color="$root.user ? '#0C4A6E' : 'transparent'"
    >
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="close()"
        class="red lighten-1 mx-1"
      ></div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="minimize()"
        class="yellow darken-2 mx-1"
      ></div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="maximized ? unmaximize() : maximize()"
        class="green mx-1"
      ></div>
      <v-fade-transition group leave-absolute style="margin: 4px 4px 0px 10px">
        <div
          key="logo"
          v-if="!$root.notify.is"
          style="display: inline-flex !important"
        >
          <img
            src="./assets/logo.png"
            style="height: 24px; margin-right: 4px; margin-top: 1px"
          />
          <span style="margin-right: 4px; margin-top: 3px">Wire</span>
        </div>
        <p
          key="notification"
          v-if="$root.notify.is"
          class="mb-1"
          v-html="$root.notify.text"
        ></p>
      </v-fade-transition>

      <v-spacer></v-spacer>

      <v-btn
        color="grey lighten-1"
        small
        icon
        @click="leaveChatroom()"
        v-if="current && !current_dm_person && current.owner != $root.user._id"
        ><v-icon class="mr-0">mdi-arrow-expand-left</v-icon></v-btn
      >
      <v-btn
        color="grey lighten-1"
        small
        icon
        @click="deleteChatroom()"
        v-if="current && !current_dm_person"
        ><v-icon class="mr-0">mdi-delete</v-icon></v-btn
      >
    </v-system-bar>

    <v-main v-if="!$root.user" key="login">
      <div
        style="max-width: 28rem; padding-top: 5rem"
        class="mx-auto text-center"
      >
        <img style="height: 8rem; margin: auto" src="./assets/paradigm.png" />

        <v-card
          class="mt-10"
          color="#333333"
          style="border: none !important; width: 100%"
        >
          <v-card-title>
            <h1 class="text-h4 grey--text text--lighten-1">
              Sign in to your account
            </h1>
          </v-card-title>
          <v-card-text>
            <v-text-field
              hide-details
              label="Username"
              class="mb-3"
              v-model="username"
            ></v-text-field>
            <v-text-field
              hide-details
              label="Password"
              class="mb-6"
              type="password"
              @keypress.enter="signIn()"
              v-model="password"
            ></v-text-field>
            <v-checkbox label="Stay signed in" v-model="sticky"></v-checkbox>

            <v-btn
              elevation="2"
              block
              color="deep-purple darken-4"
              @click="signIn()"
              :disabled="!username || !password"
              >Sign in</v-btn
            >
          </v-card-text>

          <v-card-actions class="grey darken-4 pa-7">
            <p
              class="ma-auto subtitle-2 text-center font-weight-light text--grey text--darken-4"
            >
              Don't have an account?
              <a
                class="text--grey text--darken-4"
                @click="shell.openExternal('https://www.theparadigmdev.com')"
              >
                Create one online</a
              >
            </p>
          </v-card-actions>
        </v-card>
      </div>
    </v-main>

    <v-main v-else style="overflow: hidden">
      <div
        :style="{
          height: 'calc(100vh - 38px)',
        }"
        style="overflow: hidden"
      >
        <main>
          <!-- DRAWER -->
          <v-navigation-drawer
            :style="{
              width: drawer ? '256px !important' : '56px !important',
              height: 'calc(100vh - 38px)',
            }"
            class="grey darken-4"
            absolute
            permanent
            :mini-variant="!drawer"
            v-model="drawer"
            key="root_drawer"
          >
            <v-list>
              <v-list-item-group mandatory v-model="current_id">
                <v-list-item
                  value="home"
                  @click="
                    current_id = 'home';
                    current = null;
                    current_dm_person = false;
                  "
                >
                  <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
                  <v-list-item-title>Home</v-list-item-title>
                </v-list-item>

                <v-list-item
                  :value="current_dm_person ? current_id : 'dm'"
                  @click="
                    current_id = 'dm';
                    current = null;
                  "
                >
                  <v-list-item-icon
                    ><v-icon>mdi-account-lock</v-icon></v-list-item-icon
                  >
                  <v-list-item-title>Direct Messages</v-list-item-title>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item
                  v-for="(chatroom, index) in $root.user.chatrooms"
                  :key="index"
                  :value="chatroom.id"
                  @click="changeChatroom(chatroom, false)"
                >
                  <v-list-item-icon
                    ><v-icon>{{ chatroom.icon }}</v-icon></v-list-item-icon
                  >
                  <v-list-item-title>{{ chatroom.name }}</v-list-item-title>
                </v-list-item>
              </v-list-item-group>

              <v-list-item
                @click="signOut()"
                v-if="drawer"
                style="position: absolute; bottom: 8px; width: 256px"
              >
                <v-list-item-avatar
                  ><v-img
                    :src="`https://www.theparadigmdev.com/relay/profile-pics/${$root.user._id}.png`"
                  ></v-img
                ></v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title
                    class="text-left font-weight-medium"
                    :style="{ color: $root.user.color }"
                    >{{ $root.user.username }}</v-list-item-title
                  >
                  <v-list-item-subtitle>Click to sign out</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon @click="drawer = !drawer"
                    ><v-icon>{{
                      drawer ? "mdi-chevron-left" : "mdi-chevron-right"
                    }}</v-icon></v-btn
                  >
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <v-btn
              v-if="!drawer"
              fab
              fixed
              bottom
              right
              small
              class="elevation-0"
              :style="{ left: drawer ? '' : '8px' }"
              color="transparent"
              @click="drawer = !drawer"
              ><v-icon>{{
                drawer ? "mdi-chevron-left" : "mdi-chevron-right"
              }}</v-icon></v-btn
            >
          </v-navigation-drawer>

          <!-- HOME -->
          <section
            class="text-center mt-12 px-4"
            key="home"
            :style="{ 'margin-left': drawer ? '256px' : '56px' }"
            v-if="
              current_id == 'home' &&
              ($vuetify.breakpoint.smAndDown ? (drawer ? false : true) : true)
            "
          >
            <h3 class="text-h3 font-weight-light">Welcome to Wire!</h3>
            <p class="mt-3">
              Wire is a secure and freedom-oriented chatting app.
            </p>
            <div style="max-width: 150px; margin: auto">
              <v-btn
                color="#0C4A6E"
                x-large
                class="mt-8"
                block
                @click="buy_chatroom.open = true"
              >
                <v-icon left>mdi-plus</v-icon>Create
              </v-btn>
              <v-btn
                color="#0C4A6E"
                x-large
                block
                class="mt-2"
                @click="add_chatroom.open = true"
                ><v-icon left>mdi-forum</v-icon>Join</v-btn
              >
            </div>
          </section>

          <!-- DM -->
          <section
            :style="{ 'margin-left': drawer ? '256px' : '56px' }"
            v-if="current_id == 'dm' || current_dm_person"
            key="dm"
            class="d-flex"
          >
            <v-navigation-drawer
              :style="{
                width: !drawer ? '256px !important' : '56px !important',
                height: 'calc(100vh - 38px)',
              }"
              permanent
              :mini-variant="drawer"
              class="grey darken-4"
            >
              <v-list>
                <v-list-item-group v-model="current_dm_person">
                  <v-list-item
                    @click="changeChatroom(friend, true)"
                    :value="friend.username"
                    v-for="(friend, index) in approved_friends"
                    :key="index"
                  >
                    <v-badge
                      style="position: relative; left: -15px"
                      bordered
                      bottom
                      dot
                      :offset-x="!drawer ? 25 : 16"
                      offset-y="17"
                      color="green"
                      :value="friend.in"
                    >
                      <v-list-item-avatar
                        :class="{
                          'ma-2': $vuetify.breakpoint.xsOnly
                            ? drawer
                              ? true
                              : true
                            : drawer
                            ? true
                            : false,
                        }"
                        ><v-img
                          loading="lazy"
                          :src="`https://www.theparadigmdev.com/relay/profile-pics/${friend._id}.png`"
                        ></v-img
                      ></v-list-item-avatar>
                    </v-badge>
                    <v-list-item-title
                      class="font-weight-medium"
                      :style="{ color: friend.color }"
                      >{{ friend.username }}</v-list-item-title
                    >
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-navigation-drawer>

            <!-- CHAT LIST -->
            <div
              v-if="current"
              v-chat-scroll="{
                always: false,
                smooth: true,
                notSmoothOnInit: true,
              }"
              style="
                height: calc(100vh - 136px);
                width: calc(100vw - 312px) !important;
                overflow: auto;
                padding: 16px 16px 0px 16px;
              "
            >
              <p
                class="text-center grey--text font-italic font-weight-light mt-6"
                v-if="current.messages.length < 1"
              >
                There are no messages posted here.
              </p>

              <div
                v-for="(message, index) in current.messages"
                :key="message._id"
                @mouseover="current_message = index"
                @mouseleave="current_message = -1"
                class="d-flex"
                style="position: relative"
              >
                <img
                  style="border-radius: 40px"
                  class="mt-1"
                  height="40"
                  width="40"
                  :src="`https://www.theparadigmdev.com/relay/profile-pics/${message.user_id}.png`"
                />
                <div
                  class="ml-3"
                  style="flex-grow: 1; width: calc(100% - 125px)"
                >
                  <p class="mb-0">
                    <span
                      class="font-weight-medium"
                      :style="{ color: message.color }"
                    >
                      {{ message.username }}
                    </span>
                    <span class="caption grey--text font-weight-light ml-1">
                      {{ message.timestamp }}
                    </span>
                    <span
                      class="caption grey--text font-weight-light ml-1"
                      v-if="message.edits != 0 && message.type == 'message'"
                      >•<span class="pl-1">
                        {{ message.edits }}
                        {{ message.edits > 1 ? "edits" : "edit" }}
                      </span>
                    </span>
                  </p>
                  <p
                    v-if="message.type == 'message'"
                    v-html="message.content"
                  ></p>
                  <v-card
                    v-if="message.type == 'file'"
                    @click="window.open(message.url)"
                    max-width="350"
                  >
                    <v-card-title>{{ message.content }}</v-card-title>
                  </v-card>
                  <img
                    v-if="message.type == 'image'"
                    :src="message.url"
                    style="max-width: 40vw"
                  />
                  <video
                    v-if="message.type == 'video'"
                    controls
                    :src="message.url"
                  ></video>
                </div>
                <div
                  style="position: absolute; top: 0px; right: 0px"
                  v-if="
                    current_message == index
                      ? message.user_id == $root.user._id
                        ? true
                        : current.owner == $root.user._id
                        ? true
                        : $root.user.rights.admin
                        ? true
                        : false
                      : false
                  "
                >
                  <v-btn
                    small
                    icon
                    color="grey darken-2"
                    v-if="message.type == 'message'"
                    @click="editChat(message)"
                    ><v-icon>mdi-pencil</v-icon></v-btn
                  >
                  <v-btn
                    small
                    icon
                    color="grey darken-2"
                    @click="deleteChat(message)"
                    ><v-icon>mdi-delete</v-icon></v-btn
                  >
                </div>
              </div>
            </div>
          </section>

          <!-- CHATROOM VIEW -->
          <section
            :style="{ 'margin-left': drawer ? '256px' : '56px' }"
            v-if="current && !current_dm_person"
            key="chatroom"
          >
            <!-- CHAT LIST -->
            <div
              v-if="current"
              v-chat-scroll="{
                always: false,
                smooth: true,
                notSmoothOnInit: true,
              }"
              style="
                height: calc(100vh - 136px);
                overflow: auto;
                padding: 16px 16px 0px 16px;
              "
            >
              <p
                class="text-center grey--text font-italic font-weight-light mt-6"
                v-if="current.messages.length < 1"
              >
                There are no messages posted here.
              </p>

              <div
                v-for="(message, index) in current.messages"
                :key="message._id"
                @mouseover="current_message = index"
                @mouseleave="current_message = -1"
                class="d-flex"
                style="position: relative"
              >
                <img
                  style="border-radius: 40px"
                  class="mt-1"
                  height="40"
                  width="40"
                  :src="`https://www.theparadigmdev.com/relay/profile-pics/${message.user_id}.png`"
                />
                <div
                  class="ml-3"
                  style="flex-grow: 1; width: calc(100% - 125px)"
                >
                  <p class="mb-0">
                    <span
                      class="font-weight-medium"
                      :style="{ color: message.color }"
                    >
                      {{ message.username }}
                    </span>
                    <span class="caption grey--text font-weight-light ml-1">
                      {{ message.timestamp }}
                    </span>
                    <span
                      class="caption grey--text font-weight-light ml-1"
                      v-if="message.edits != 0 && message.type == 'message'"
                      >•<span class="pl-1">
                        {{ message.edits }}
                        {{ message.edits > 1 ? "edits" : "edit" }}
                      </span>
                    </span>
                  </p>
                  <p
                    v-if="message.type == 'message'"
                    v-html="message.content"
                  ></p>
                  <v-card
                    v-if="message.type == 'file'"
                    @click="window.open(message.url)"
                    max-width="350"
                  >
                    <v-card-title>{{ message.content }}</v-card-title>
                  </v-card>
                  <img
                    v-if="message.type == 'image'"
                    :src="message.url"
                    style="max-width: 40vw"
                  />
                  <video
                    v-if="message.type == 'video'"
                    controls
                    :src="message.url"
                  ></video>
                </div>
                <div
                  style="position: absolute; top: 0px; right: 0px"
                  v-if="
                    current_message == index
                      ? message.user_id == $root.user._id
                        ? true
                        : current.owner == $root.user._id
                        ? true
                        : $root.user.rights.admin
                        ? true
                        : false
                      : false
                  "
                >
                  <v-btn
                    small
                    icon
                    color="grey darken-2"
                    v-if="message.type == 'message'"
                    @click="editChat(message)"
                    ><v-icon>mdi-pencil</v-icon></v-btn
                  >
                  <v-btn
                    small
                    icon
                    color="grey darken-2"
                    @click="deleteChat(message)"
                    ><v-icon>mdi-delete</v-icon></v-btn
                  >
                </div>
              </div>
            </div>
          </section>

          <!-- NEW CHAT FOOTER -->
          <footer
            :style="{
              'margin-left': $vuetify.breakpoint.smAndDown
                ? current_dm_person || current_id == 'dm'
                  ? drawer
                    ? '312px'
                    : '112px'
                  : drawer
                  ? '256px'
                  : '56px'
                : current_dm_person || current_id == 'dm'
                ? drawer
                  ? '312px'
                  : '312px'
                : drawer
                ? '256px'
                : '56px',
              width: $vuetify.breakpoint.smAndDown
                ? current_dm_person || current_id == 'dm'
                  ? drawer
                    ? 'calc(100vw - 312px)'
                    : 'calc(100vw - 112px)'
                  : drawer
                  ? 'calc(100vw - 256px)'
                  : 'calc(100vw - 56px)'
                : current_dm_person || current_id == 'dm'
                ? drawer
                  ? 'calc(100vw - 312px)'
                  : 'calc(100vw - 312px)'
                : drawer
                ? 'calc(100vw - 256px)'
                : 'calc(100vw - 56px)',
            }"
            v-if="
              current &&
              ($vuetify.breakpoint.smAndDown ? (drawer ? false : true) : true)
            "
            key="footer"
          >
            <v-fade-transition hide-on-leave v-if="typers.length > 0">
              <span class="mb-n2 grey--text font-italic text-body-2"
                ><span
                  v-for="(user, index) in typers"
                  :key="index"
                  :style="{ color: user.color }"
                  >{{ user.user
                  }}<span v-if="typers.length - 1 != index">, </span>
                </span>
                is typing...</span
              >
            </v-fade-transition>

            <v-row
              no-gutters
              align="baseline"
              :style="{
                'margin-top': typers.length > 0 ? '0px' : '24px',
              }"
            >
              <v-col cols="10">
                <v-text-field
                  style="width: 100%"
                  hide-details
                  v-model="new_message"
                  label="New message..."
                  @keyup="startTyping()"
                  @keyup.enter="sendMessage()"
                ></v-text-field>
              </v-col>

              <v-col cols="2" class="pl-4">
                <v-btn
                  v-if="$vuetify.breakpoint.smAndUp"
                  icon
                  @click="sendMessage()"
                  ><v-icon>mdi-send</v-icon></v-btn
                >
                <v-btn
                  icon
                  @click="upload.open = true"
                  :class="{ 'mb-3': $vuetify.breakpoint.xsOnly }"
                  ><v-icon>mdi-paperclip</v-icon></v-btn
                >
              </v-col>
            </v-row>
          </footer>
        </main>

        <!-- EDIT DIALOG -->
        <v-dialog
          v-model="edit.open"
          max-width="350"
          @click:outside="edit = { open: false }"
        >
          <v-card style="text-align: center">
            <v-card-title class="text-h5 font-weight-medium"
              >EDIT CHAT</v-card-title
            >
            <v-card-text>
              <v-text-field
                hide-details="auto"
                @keypress.enter="editChatSave()"
                v-model="edit.content"
                label="Message content"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="red"
                @click="deleteChat(edit), (edit.open = false)"
                >Delete</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn text color="#0369A1" @click="editChatSave()">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- FILE UPLOAD DIALOG -->
        <v-dialog v-model="upload.open" max-width="350">
          <v-card>
            <v-card-title class="text-h5 font-weight-medium"
              >UPLOAD FILE</v-card-title
            >
            <v-card-text
              ><v-file-input
                prepend-icon=""
                id="file"
                ref="file"
                v-model="upload.file"
                multiple
                label="Upload..."
              ></v-file-input
            ></v-card-text>
            <v-card-actions>
              <v-btn
                @click="upload = { open: false }"
                color="grey darken-1"
                text
                >Cancel</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn @click="sendFile()" color="#0369A1" text>Upload</v-btn>
            </v-card-actions>
            <v-progress-linear
              :active="upload.loading"
              :indeterminate="true"
              absolute
              bottom
              color="deep-purple accent-4"
            ></v-progress-linear>
          </v-card>
        </v-dialog>

        <!-- JOIN DIALOG -->
        <v-dialog v-model="add_chatroom.open" max-width="350">
          <v-card>
            <v-card-title class="text-h5 font-weight-medium"
              >JOIN CHATROOM</v-card-title
            >
            <v-card-text
              ><v-text-field
                hide-details
                v-model="add_chatroom.code"
                label="Code..."
              ></v-text-field
            ></v-card-text>
            <v-card-actions>
              <v-btn
                @click="add_chatroom = { open: false, code: '' }"
                color="grey darken-1"
                text
                >Cancel</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn @click="joinChatroom()" color="#0369A1" text>Join</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- NOTIFY DIALOG -->
        <!-- <v-dialog v-model="notify_allow.open" max-width="350">
          <v-card>
            <v-card-title class="text-h5 font-weight-medium"
              >NOTIFICATIONS?</v-card-title
            >
            <v-card-text>Wire would like to send you notifications</v-card-text>
            <v-card-actions>
              <v-btn
                @click="notify_allow = { open: false, accept: false }"
                color="grey darken-1"
                text
                >Decline</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn
                @click="
                  $subscribe(), (notify_allow = { open: false, accept: true })
                "
                color="#0369A1"
                text
                >Accept</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog> -->

        <!-- BUY DIALOG -->
        <v-dialog
          @click:outside="buy_chatroom = { open: false }"
          v-model="buy_chatroom.open"
          max-width="450"
          style="z-index: 1001"
        >
          <v-card>
            <v-card-title class="text-h5 font-weight-medium"
              >BUY A CHATROOM</v-card-title
            >

            <v-card-text>
              <v-text-field
                hide-details="auto"
                class="mb-4"
                v-model="buy_chatroom.name"
                label="Chatroom Name"
              ></v-text-field>
              <p>Chatroom Color</p>
              <v-color-picker
                mode="hexa"
                hide-mode-switch
                class="mt-3 mb-3 elevation-0"
                v-model="buy_chatroom.theme"
              ></v-color-picker>
            </v-card-text>

            <v-card-actions>
              <v-btn
                @click="buy_chatroom = { open: false }"
                text
                color="grey darken-1"
                >Cancel</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn @click="buyChatroom()" color="#0369A1" text>Buy</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-main>
    <audio src="@/assets/audio/sent.wav" id="sent_sound"></audio>
    <audio src="@/assets/audio/msg.wav" id="msg_sound"></audio>
  </v-app>
</template>

<script>
import { remote } from "electron";
import { io } from "socket.io-client";
import moment from "moment";
import { shell } from "electron";
import Store from "./store.js";

let typingTimeout;
let msg_sound;
let sent_sound;

const store = new Store();

export default {
  name: "App",
  data: () => ({
    win: remote.getCurrentWindow(),
    maximized: remote.getCurrentWindow().isMaximized(),
    process,
    username: "",
    password: "",
    sticky: true,
    notify_allow: {
      open: false,
      accept: false,
    },

    drawer: false,
    current: false,
    current_index: -1,
    current_message: false,
    current_id: "home",
    current_dm_person: false,
    socket: null,
    new_message: "",
    typers: [],
    edit: {
      open: false,
    },
    upload: {
      open: false,
      loading: false,
    },
    buy_chatroom: {
      open: false,
    },
    add_chatroom: {
      open: false,
      code: "",
    },
    all_people: [],

    window,
    shell,
  }),
  computed: {
    approved_friends() {
      var friends = [];
      this.$root.user.people.approved.forEach(async (person) => {
        const index = this.all_people.findIndex((p) => {
          return p._id == person._id;
        });
        person.in = this.all_people[index].in;
        friends.push(person);
      });
      return friends;
    },
  },

  async created() {
    if (store.get("jwt")) {
      const jwt = store.get("jwt");
      this.$http
        .post("https://www.theparadigmdev.com/api/authentication/verify", {
          jwt,
        })
        .then(async (response) => {
          console.log(response);
          if (response.data.valid) {
            this.$root.user = response.data.user;
            this.$root.socket.emit("login", this.$root.user.username);
            this.$subscribe();
          }
        });
    }
    if (this.$vuetify.breakpoint.mdAndUp) this.drawer = true;
    this.$http
      .get("https://www.theparadigmdev.com/api/users/shortlist")
      .then((response) => {
        this.all_people = response.data;
        sent_sound = document.getElementById("sent_sound");
        msg_sound = document.getElementById("msg_sound");
      });
    this.$root.socket.on("user", (data) => {
      if (this.$root.user !== data) this.$root.user = data;
    });
    if (store.get("notification_id"))
      this.notify_allow = { open: false, accept: false };
  },
  methods: {
    close() {
      this.win.close();
    },
    maximize() {
      this.win.maximize();
      this.maximized = remote.getCurrentWindow().isMaximized();
    },
    unmaximize() {
      this.win.unmaximize();
      this.maximized = remote.getCurrentWindow().isMaximized();
    },
    minimize() {
      this.win.minimize();
    },

    signIn() {
      this.$http
        .post("https://www.theparadigmdev.com/api/authentication/signin", {
          username: this.username.toLowerCase(),
          password: this.password,
          sticky: this.sticky,
        })
        .then(async (response) => {
          if (!response.data.errors) {
            this.$root.user = response.data.user;
            this.username = "";
            this.password = "";
            store.set("jwt", response.data.jwt);
            this.$root.socket.emit("login", this.$root.user.username);
          } else {
            this.$notify(`<span class="red--text">${response.data.msg}</span>`);
          }
        })
        .catch((error) => console.error(JSON.stringify(error)));
    },
    signOut() {
      if (this.$root.user) {
        this.$http
          .post("https://www.theparadigmdev.com/api/authentication/signout", {
            _id: this.$root.user._id,
          })
          .then((response) => {
            this.$root.socket.disconnect();
            this.$root.socket = io.connect("https://www.theparadigmdev.com");
            store.set("jwt", false);
            this.$root.user = false;
          });
      }
    },

    async changeChatroom(to, dm) {
      if (this.socket) {
        this.socket.off("data");
        this.socket.off("send");
        this.socket.off("delete");
        this.socket.off("edit");
        this.socket.off("kill");
        this.socket.off("typing");
        this.socket.off("people");
        this.socket.off("purge");
        await this.socket.disconnect();
      }
      this.current = false;
      this.current_dm_person = false;
      if (dm) {
        this.socket = await io.connect(
          `https://www.theparadigmdev.com/wire/${to.dm}`
        );
        this.current_dm_person = to.username;
      } else {
        this.socket = await io.connect(
          `https://www.theparadigmdev.com/wire/${to.id}`
        );
      }
      this.socket.on("data", (data) => {
        this.current = data;
        this.current_id = dm ? data._id : data.id;
      });
      this.socket.on("send", (data) => {
        if (data.user_id !== this.$root.user._id) msg_sound.play();
        this.current.messages.push(data);
      });
      this.socket.on("delete", async (id) => {
        var index = await this.current.messages.findIndex((message) => {
          return message._id == id;
        });
        await this.current.messages.splice(index, 1);
      });
      this.socket.on("edit", async (data) => {
        var index = await this.current.messages.findIndex((message) => {
          return message._id == data.oldID;
        });
        this.current.messages[index] = data;
      });
      this.socket.on("kill", async () => {
        this.leaveChatroom();
      });
      this.socket.on("typing", (data) => {
        let filteredData = data;
        let exists = false;
        filteredData.forEach((user) => {
          if (user.user == this.$root.user.username) exists = true;
        });
        if (exists) {
          const index = filteredData.findIndex((user) => {
            return this.$root.user.username == user.user;
          });
          filteredData.splice(index, 1);
        }
        this.typers = filteredData;
      });
      this.socket.on("people", (data) => (this.current.people = data));
      this.socket.on("purge", () => (this.current.messages = []));
    },
    async sendMessage() {
      if (this.new_message.length > 0) {
        sent_sound.play();
        clearTimeout(typingTimeout);
        this.socket.emit("typing", {
          user: this.$root.user.username,
          is: false,
          color: this.$root.user.color,
        });
        const data = {
          color: this.$root.user.color,
          username: this.$root.user.username,
          user_id: this.$root.user._id,
          content: this.new_message,
          timestamp: moment().format("MM/DD/YYYY [at] h:mm a"),
          edits: 0,
          type: "message",
        };
        this.socket.emit("send", data);
        this.new_message = "";
      }
    },
    sendFile() {
      this.upload.loading = true;
      let formData = new FormData();
      formData.append("file", this.upload.file[0]);
      this.$http
        .post(
          this.current_dm_person
            ? `https://www.theparadigmdev.com/api/wire/dm/${this.current_id}/file`
            : `https://www.theparadigmdev.com/api/wire/chatroom/${this.current_id}/file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          let data = {
            color: this.$root.user.color,
            username: this.$root.user.username,
            user_id: this.$root.user._id,
            timestamp: moment().format("MM/DD/YYYY [at] h:mm a"),
            content: this.upload.file[0].name,
            url: this.current_dm_person
              ? `https://www.theparadigmdev.com/relay/wire/dm/${this.current_id}/${this.upload.file[0].name}`
              : `https://www.theparadigmdev.com/relay/wire/chatroom/${this.current_id}/${this.upload.file[0].name}`,
            type: "",
          };
          if (this.upload.file[0].type.includes("image")) data.type = "image";
          else if (this.upload.file[0].type.includes("video"))
            data.type = "video";
          else data.type = "file";
          this.socket.emit("send", data);
          this.upload = { open: false };
        })
        .catch((error) => {
          console.log("Upload: failed", error);
          this.upload = { open: false, loading: false };
        });
    },
    startTyping() {
      clearTimeout(typingTimeout);
      this.socket.emit("typing", {
        user: this.$root.user.username,
        is: true,
        color: this.$root.user.color,
      });
      typingTimeout = setTimeout(
        () =>
          this.socket.emit("typing", {
            user: this.$root.user.username,
            is: false,
          }),
        3000
      );
    },
    deleteChat(chat) {
      this.socket.emit("delete", chat._id);
    },
    editChat(chat) {
      this.edit = chat;
      this.edit.open = true;
    },
    editChatSave() {
      this.socket.emit("edit", this.edit);
      this.edit = { open: false };
    },
    joinChatroom() {
      this.$http
        .get(
          `https://www.theparadigmdev.com/api/users/${this.$root.user._id}/chatroom/${this.add_chatroom.code}/request`
        )
        .then((response) => {
          if (!response.data.error) {
            this.$root.user = response.data;
            this.add_chatroom = {
              open: false,
              code: "",
            };
          } else
            this.$notify(
              "You cannot join this chatroom",
              "red--text",
              "mdi-cancel",
              3000
            );
        })
        .catch((error) => console.error(error));
    },
    buyChatroom() {
      this.$http
        .post("https://www.theparadigmdev.com/api/wire/chatroom/new", {
          icon: "mdi-forum",
          name: this.buy_chatroom.name,
          owner: this.$root.user._id,
          theme: this.buy_chatroom.theme.hex,
        })
        .then((response) => {
          this.$root.socket.emit("new_chatroom");
          this.$root.user.chatrooms.push(response.data);
          this.changeChatroom(response.data.id);
          this.buy_chatroom = {
            open: false,
          };
        })
        .catch((error) => console.error(error));
    },
    leaveChatroom() {
      if (this.$root.user._id != this.current.owner) {
        this.$http
          .get(
            `https://www.theparadigmdev.com/api/users/${this.$root.user._id}/chatroom/${this.current.id}/leave`
          )
          .then((response) => {
            this.$root.user = response.data;
            this.socket.emit("send", {
              color: this.$root.user.color,
              username: this.$root.user.username,
              user_id: this.$root.user._id,
              timestamp: moment().format("MM/DD/YYYY [at] h:mm a"),
              type: "left",
            });
            this.socket.disconnect();
            this.current_id = "home";
            this.current = false;
          });
      } else
        this.$notify(
          "You can't leave this chatroom, you own it!",
          "orange--text",
          "mdi-alert",
          3000
        );
    },
    async deleteChatroom() {
      if (
        this.current.owner == this.$root.user._id ||
        this.$root.user.rights.admin == true
      ) {
        this.socket.emit("kill");
        this.leaveChatroom();
        this.$notify("Chatroom deleted", "whit--text", "mdi-delete", 3000);
        this.delete_verify_popup = false;
        await this.$http.get(
          `https://www.theparadigmdev.com/api/wire/chatroom/${this.current.id}/delete`
        );
        this.socket.disconnect();
        this.current = false;
        this.current_dm_person = false;
        this.current_id = "home";
      }
    },
  },
};
</script>

<style>
html {
  overflow: hidden !important;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: rgb(33, 33, 33);
}
::-webkit-scrollbar-thumb {
  background: rgb(100, 100, 100);
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(60, 60, 60);
}
::-webkit-scrollbar-corner {
  background: rgb(33, 33, 33);
}
footer {
  position: absolute;
  bottom: 0px;
  padding: 0px 16px 16px 16px;
  height: 91px !important;
}
</style>