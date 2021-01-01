<template>
  <v-app style="overflow: hidden">
    <v-system-bar
      v-if="process.platform != 'darwin'"
      app
      window
      style="-webkit-app-region: drag; -webkit-user-select: none"
      height="38"
      :class="{ 'elevation-3': $root.user }"
      :color="$root.user ? '#164E63' : 'transparent'"
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
      :color="$root.user ? '#164E63' : 'transparent'"
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
            <p
              class="text--grey text--darken-4 font-weight-light ma-0 subtitle-2"
            >
              Or <a class="text--grey text--darken-4"> create an account</a>
            </p></v-card-title
          >
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
          <v-slide-x-transition group>
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
                    <v-list-item-icon
                      ><v-icon>mdi-home</v-icon></v-list-item-icon
                    >
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
                    <v-list-item-subtitle
                      >Click to sign out</v-list-item-subtitle
                    >
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
                  x-large
                  class="mt-8"
                  block
                  @click="buy_chatroom.open = true"
                >
                  <v-icon left>mdi-plus</v-icon>Create
                </v-btn>
                <v-btn
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
                  width: $vuetify.breakpoint.smAndDown
                    ? !drawer
                      ? '56px !important'
                      : '56px !important'
                    : !drawer
                    ? '256px !important'
                    : '56px !important',
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
              <v-list
                :style="{
                  height: 'calc(100vh - 104px)',

                  overflowY: 'auto',
                  width: $vuetify.breakpoint.smAndDown
                    ? drawer
                      ? 'calc(100vw - 312px)'
                      : 'calc(100vw - 112px)'
                    : 'calc(100vw - 312px)',
                }"
                v-if="
                  current &&
                  ($vuetify.breakpoint.smAndDown
                    ? drawer
                      ? false
                      : true
                    : true)
                "
                class="transparent"
                v-chat-scroll="{ always: false, smooth: true }"
              >
                <v-fade-transition group>
                  <!-- CHAT LIST ITEM -->
                  <v-list-item
                    v-for="(message, index) in current.messages"
                    :key="index"
                    @mouseover="current_message = message"
                    @mouseleave="current_message = false"
                  >
                    <v-list-item-avatar style="align-self: start" class="mt-4">
                      <v-img
                        :src="`https://www.theparadigmdev.com/relay/profile-pics/${message.user_id}.png`"
                      ></v-img>
                    </v-list-item-avatar>

                    <!-- TYPE="MESSAGE" CHAT -->
                    <v-list-item-content
                      style="max-width: 90%"
                      v-if="message.type == 'message'"
                    >
                      <v-list-item-title class="font-weight-medium">
                        <span :style="{ color: message.color }">{{
                          message.username
                        }}</span>
                        <span class="caption grey--text font-weight-light ml-1">
                          {{ message.timestamp }}
                        </span>
                        <span
                          class="caption grey--text font-weight-light ml-1"
                          v-if="message.edits != 0"
                          >•<span class="pl-1">
                            {{ message.edits }}
                            {{ message.edits > 1 ? "edits" : "edit" }}
                          </span>
                        </span>
                      </v-list-item-title>
                      <p
                        class="pa-0 ma-0 grey--text text--lighten-2"
                        style="word-wrap: break-word"
                        v-html="message.content"
                      ></p>
                    </v-list-item-content>

                    <!-- TYPE="FILE" CHAT -->
                    <v-list-item-content
                      style="max-width: 90%"
                      v-if="message.type == 'file'"
                    >
                      <v-list-item-title class="font-weight-medium">
                        <span :style="{ color: message.color }">{{
                          message.username
                        }}</span>
                        <span class="caption grey--text font-weight-light ml-1">
                          {{ message.timestamp }}
                        </span>
                      </v-list-item-title>
                      <v-card @click="window.open(message.url)">
                        <h5 class="text-h5">{{ message.content }}</h5>
                      </v-card>
                    </v-list-item-content>

                    <!-- TYPE="MEDIA" CHAT -->
                    <v-list-item-content
                      style="max-width: 90%"
                      v-if="message.type == 'image' || message.type == 'video'"
                    >
                      <v-list-item-title class="font-weight-medium">
                        <span :style="{ color: message.color }">{{
                          message.username
                        }}</span>
                        <span class="caption grey--text font-weight-light ml-1">
                          {{ message.timestamp }}
                        </span>
                      </v-list-item-title>
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
                    </v-list-item-content>

                    <!-- CHAT CONTROLS -->
                    <v-fade-transition
                      group
                      style="align-self: start"
                      class="mt-3"
                    >
                      <v-btn
                        key="edit"
                        v-if="
                          current_message == message
                            ? message.user_id == $root.user._id
                              ? true
                              : current.owner == $root.user._id
                              ? true
                              : $root.user.rights.admin
                              ? true
                              : false
                            : false
                        "
                        small
                        icon
                        color="grey darken-3"
                        @click="editChat(message)"
                        ><v-icon>mdi-pencil</v-icon></v-btn
                      >
                      <v-btn
                        key="delete"
                        v-if="
                          current_message == message
                            ? message.user_id == $root.user._id
                              ? true
                              : current.owner == $root.user._id
                              ? true
                              : $root.user.rights.admin
                              ? true
                              : false
                            : false
                        "
                        small
                        icon
                        color="grey darken-3"
                        @click="deleteChat(message)"
                        ><v-icon>mdi-delete</v-icon></v-btn
                      >
                    </v-fade-transition>
                  </v-list-item>
                </v-fade-transition>
              </v-list>
            </section>

            <!-- CHATROOM VIEW -->
            <section
              :style="{ 'margin-left': drawer ? '256px' : '56px' }"
              v-if="current && !current_dm_person"
              key="chatroom"
            >
              <!-- CHAT LIST -->
              <v-list
                :style="{
                  height: 'calc(100vh - 104px)',

                  overflowY: 'auto',
                }"
                class="transparent"
                v-chat-scroll="{ always: false, smooth: true }"
                v-if="
                  $vuetify.breakpoint.smAndDown ? (drawer ? false : true) : true
                "
              >
                <v-fade-transition group>
                  <!-- CHAT LIST ITEM -->
                  <v-list-item
                    v-for="(message, index) in current.messages"
                    :key="index"
                    @mouseover="current_message = message"
                    @mouseleave="current_message = false"
                  >
                    <v-list-item-avatar style="align-self: start" class="mt-4">
                      <v-img
                        :src="`https://www.theparadigmdev.com/relay/profile-pics/${message.user_id}.png`"
                      ></v-img>
                    </v-list-item-avatar>

                    <!-- TYPE="MESSAGE" CHAT -->
                    <v-list-item-content
                      class="py-2"
                      style="max-width: 90%"
                      v-if="message.type == 'message'"
                    >
                      <v-list-item-title class="font-weight-medium">
                        <span :style="{ color: message.color }">{{
                          message.username
                        }}</span>
                        <span class="caption grey--text font-weight-light ml-1">
                          {{ message.timestamp }}
                        </span>
                        <span
                          class="caption grey--text font-weight-light ml-1"
                          v-if="message.edits != 0"
                          >•<span class="pl-1">
                            {{ message.edits }}
                            {{ message.edits > 1 ? "edits" : "edit" }}
                          </span>
                        </span>
                      </v-list-item-title>
                      <p
                        class="pa-0 ma-0 grey--text text--lighten-2"
                        style="word-wrap: break-word"
                        v-html="message.content"
                      ></p>
                    </v-list-item-content>

                    <!-- TYPE="FILE" CHAT -->
                    <v-list-item-content
                      style="max-width: 90%"
                      v-if="message.type == 'file'"
                    >
                      <v-list-item-title class="font-weight-medium">
                        <span :style="{ color: message.color }">{{
                          message.username
                        }}</span>
                        <span class="caption grey--text font-weight-light ml-1">
                          {{ message.timestamp }}
                        </span>
                      </v-list-item-title>
                      <v-card @click="window.open(message.url)" max-width="350">
                        <v-card-title>{{ message.content }}</v-card-title>
                      </v-card>
                    </v-list-item-content>

                    <!-- TYPE="MEDIA" CHAT -->
                    <v-list-item-content
                      style="max-width: 90%"
                      v-if="message.type == 'image' || message.type == 'video'"
                    >
                      <v-list-item-title class="font-weight-medium">
                        <span :style="{ color: message.color }">{{
                          message.username
                        }}</span>
                        <span class="caption grey--text font-weight-light ml-1">
                          {{ message.timestamp }}
                        </span>
                      </v-list-item-title>
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
                    </v-list-item-content>

                    <!-- TYPE="LEFT" CHAT -->
                    <v-list-item-subtitle
                      class="text-center"
                      v-if="message.type === 'left'"
                      ><span :style="{ color: message.color }">{{
                        message.username
                      }}</span>
                      has left</v-list-item-subtitle
                    >

                    <!-- TYPE="JOIN" CHAT -->
                    <v-list-item-subtitle
                      class="text-center"
                      v-if="message.type === 'join'"
                      ><span :style="{ color: message.color }">{{
                        message.username
                      }}</span>
                      has joined</v-list-item-subtitle
                    >

                    <!-- CHAT CONTROLS -->
                    <v-fade-transition
                      group
                      style="align-self: start"
                      class="mt-3"
                    >
                      <v-btn
                        key="edit"
                        v-if="
                          current_message == message
                            ? message.user_id == $root.user._id
                              ? true
                              : current.owner == $root.user._id
                              ? true
                              : $root.user.rights.admin
                              ? true
                              : false
                            : false
                        "
                        small
                        icon
                        color="grey darken-3"
                        @click="editChat(message)"
                        ><v-icon>mdi-pencil</v-icon></v-btn
                      >
                      <v-btn
                        key="delete"
                        v-if="
                          current_message == message
                            ? message.user_id == $root.user._id
                              ? true
                              : current.owner == $root.user._id
                              ? true
                              : $root.user.rights.admin
                              ? true
                              : false
                            : false
                        "
                        small
                        icon
                        color="grey darken-3"
                        @click="deleteChat(message)"
                        ><v-icon>mdi-delete</v-icon></v-btn
                      >
                    </v-fade-transition>
                  </v-list-item>
                </v-fade-transition>
              </v-list>
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
              <!-- <v-fade-transition leave-absolute v-if="current_status == 'approved'"> -->
              <v-fade-transition>
                <span
                  class="mb-n2 grey--text font-italic text-body-2"
                  v-if="typers.length > 0"
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

              <v-row no-gutters align="baseline">
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
          </v-slide-x-transition>
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
              <v-btn text color="blue accent-1" @click="editChatSave()"
                >Save</v-btn
              >
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
              <v-btn @click="sendFile()" color="blue accent-1" text
                >Upload</v-btn
              >
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

        <!-- FILE UPLOAD DIALOG -->
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
              <v-btn @click="joinChatroom()" color="blue accent-1" text
                >Join</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>

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
              <!-- <p>Icon selection is not ready yet.</p> -->
              <div v-if="$root.user.moonrocks > 50">
                <img
                  src="@/assets/moonrocks.png"
                  alt="Moonrocks"
                  class="moonrock-img"
                /><span class="moonrock-count font-weight-medium red--text"
                  >- 50</span
                >
                <p class="green--text">
                  You have enough moonrocks to purchase a chatroom.
                </p>
                <p class="mb-0">
                  New Balance:
                  <span class="font-weight-light"
                    >{{ $root.user.moonrocks - 50 }} Moonrocks</span
                  >
                </p>
              </div>
              <div v-if="$root.user.moonrocks == 50">
                <img
                  src="@/assets/moonrocks.png"
                  alt="Moonrocks"
                  class="moonrock-img"
                /><span class="moonrock-count font-weight-medium red--text"
                  >- 50</span
                >
                <p class="orange--text mb-0">
                  You have just enough moonrocks to purchase a chatroom.
                </p>
              </div>
              <div v-if="$root.user.moonrocks < 50">
                <img
                  src="@/assets/moonrocks.png"
                  alt="Moonrocks"
                  class="moonrock-img"
                /><span class="moonrock-count font-weight-medium red--text"
                  >- 50</span
                >
                <p class="red--text mb-0">
                  You do <b>not</b> have enough moonrocks to purchase a
                  chatroom.
                </p>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                @click="buy_chatroom = { open: false }"
                text
                color="grey darken-1"
                >Cancel</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn @click="buyChatroom()" color="blue accent-1" text
                >Buy</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { remote } from "electron";
import io from "socket.io-client";
import moment from "moment";
import { shell } from "electron";
import Store from "./store.js";

let typingTimeout;
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
    console.log(store.get("jwt"));
    if (store.get("jwt")) {
      this.$http
        .post(
          remote.app.isPackaged
            ? "https://www.theparadigmdev.com/api/authentication/verify"
            : "/api/authentication/verify",
          { jwt: store.get("jwt") }
        )
        .then(async (response) => {
          if (response.data.valid) {
            this.$root.user = response.data.user;
            this.$root.socket.emit("login", this.$root.user.username);
          }
        });
    }
    if (this.$vuetify.breakpoint.mdAndUp) this.drawer = true;
    this.$http
      .get("https://www.theparadigmdev.com/api/users/shortlist")
      .then((response) => {
        this.all_people = response.data;
      });
    this.$root.socket.on("user", (data) => {
      if (data.strikes != this.$root.user.strikes)
        this.$notify(
          `You have ${data.strikes} strikes!`,
          "orange--text",
          "mdi-gavel",
          3000
        );
      if (this.$root.router !== "error" && this.$root.user !== data)
        this.$root.user = data;
    });
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
        .post(
          remote.app.isPackaged
            ? "https://www.theparadigmdev.com/api/authentication/signin"
            : "/api/authentication/signin",
          {
            username: this.username.toLowerCase(),
            password: this.password,
            sticky: this.sticky,
          }
        )
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
        this.$root.user = false;
        this.$http
          .post(
            remote.app.isPackaged
              ? "https://www.theparadigmdev.com/api/authentication/signout"
              : "/api/authentication/signout",
            {
              _id: this.$root.user._id,
            }
          )
          .then((response) => {
            store.set("jwt", undefined);
          });
      }
    },

    async changeChatroom(to, dm) {
      if (this.current) this.socket.disconnect();
      this.current = false;
      this.current_dm_person = false;
      if (dm) {
        this.socket = await io.connect(
          // TODO(transition to wire endpoints)
          `https://www.theparadigmdev.com/flamechat/${to.dm}`
        );
        this.current_dm_person = to.username;
      } else {
        this.socket = await io.connect(
          // TODO(transition to wire endpoints)
          `https://www.theparadigmdev.com/flamechat/${to.id}`
        );
      }
      this.socket.on("data", (data) => {
        this.current = data;
        this.current_id = dm ? data._id : data.id;
      });
      this.socket.on("send", (data) => {
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
        this.leaveChatroom(true);
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
          this.$http.get(
            `https://www.theparadigmdev.com/api/users/${this.$root.user._id}/moonrocks/-50`
          );
          this.$root.user.chatrooms.push(response.data);
          this.changeChatroom(response.data.id);
          this.buy_chatroom = {
            open: false,
          };
        })
        .catch((error) => console.error(error));
    },
    leaveChatroom(force) {
      if (this.$root.user._id != this.current.owner && !force) {
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
          "mdi-warning",
          3000
        );
    },
    async deleteChatroom() {
      if (
        this.current.owner == this.$root.user._id ||
        this.$root.user.rights.admin == true
      ) {
        this.socket.emit("kill");
        this.leaveChatroom(true);
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
}
</style>