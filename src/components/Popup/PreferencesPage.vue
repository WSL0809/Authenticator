<template>
  <div class="preferences-page">
    <section class="settings-section">
      <a-select-input :label="i18n.theme" v-model="theme">
        <option value="normal">{{ i18n.theme_light }}</option>
        <option value="dark">{{ i18n.theme_dark }}</option>
        <option value="simple">{{ i18n.theme_simple }}</option>
        <option value="compact">{{ i18n.theme_compact }}</option>
        <option value="accessibility">{{ i18n.theme_high_contrast }}</option>
        <option value="flat">{{ i18n.theme_flat }}</option>
      </a-select-input>
      <a-select-input :label="i18n.scale" v-model="zoom">
        <option value="125">125%</option>
        <option value="100">100%</option>
        <option value="90">90%</option>
        <option value="80">80%</option>
        <option value="67">67%</option>
        <option value="57">57%</option>
        <option value="50">50%</option>
        <option value="40">40%</option>
        <option value="33">33%</option>
        <option value="25">25%</option>
        <option value="20">20%</option>
      </a-select-input>
    </section>

    <section class="settings-section">
      <a-toggle-input :label="i18n.use_autofill" v-model="useAutofill" />
      <a-toggle-input
        :label="i18n.browser_sync"
        v-model="browserSync"
        :disabled="storageArea"
        @change="migrateStorage()"
      />
      <a-toggle-input :label="i18n.smart_filter" v-model="smartFilter" />
      <a-toggle-input
        :label="i18n.enable_context_menu"
        v-model="enableContextMenu"
        @change="requireContextMenuPermission"
        v-if="isSupported"
      />
    </section>

    <section class="settings-section" v-show="!!defaultEncryption">
      <div class="control-group autolock-row">
        <label class="combo-label">{{ i18n.autolock }}</label>
        <div class="autolock-control">
          <input
            class="input"
            type="number"
            min="0"
            v-model="autolock"
            :disabled="Boolean(enforceAutolock)"
          />
          <span class="combo-label">{{ i18n.minutes }}</span>
        </div>
      </div>
    </section>

    <a-button @click="popOut()">{{ i18n.popout }}</a-button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { isFirefox, isSafari } from "../../browser";
import { UserSettings } from "../../models/settings";

export default defineComponent({
  computed: {
    zoom: {
      get(): number {
        return this.$store.state.menu.zoom;
      },
      set(zoom: number) {
        this.$store.commit("menu/setZoom", zoom);
      },
    },
    useAutofill: {
      get(): boolean {
        return this.$store.state.menu.useAutofill;
      },
      set(useAutofill: boolean) {
        this.$store.commit("menu/setAutofill", useAutofill);
      },
    },
    smartFilter: {
      get(): boolean {
        return this.$store.state.menu.smartFilter;
      },
      set(smartFilter: boolean) {
        this.$store.commit("menu/setSmartFilter", smartFilter);
        this.$store.commit(
          "notification/alert",
          this.i18n.activate_auto_filter
        );
      },
    },
    enableContextMenu: {
      get(): boolean {
        return this.$store.state.menu.enableContextMenu;
      },
      set(enableContextMenu: boolean) {
        this.$store.commit("menu/setEnableContextMenu", enableContextMenu);
      },
    },
    theme: {
      get(): string {
        return this.$store.state.menu.theme;
      },
      set(theme: string) {
        this.$store.commit("menu/setTheme", theme);
      },
    },
    defaultEncryption(): string {
      return this.$store.state.accounts.defaultEncryption;
    },
    enforceAutolock() {
      return this.$store.state.menu.enforceAutolock;
    },
    autolock: {
      get(): number {
        if (this.$store.state.menu.enforceAutolock) {
          return this.$store.state.menu.enforceAutolock;
        } else {
          return this.$store.state.menu.autolock;
        }
      },
      set(autolock: number) {
        this.$store.commit("menu/setAutolock", autolock);
        chrome.runtime.sendMessage({ action: "resetAutolock" });
      },
    },
    storageArea() {
      return this.$store.state.menu.storageArea;
    },
    browserSync: {
      get(): boolean {
        return this.newStorageLocation === "sync";
      },
      set(value) {
        this.newStorageLocation = value ? "sync" : "local";
      },
    },
    isSupported: {
      get(): boolean {
        return !isFirefox && !isSafari;
      },
    },
  },
  data() {
    return {
      newStorageLocation: "",
    };
  },
  created() {
    UserSettings.updateItems().then(() => {
      this.newStorageLocation =
        this.$store.state.menu.storageArea ||
        UserSettings.items.storageLocation;
    });
  },
  methods: {
    popOut() {
      let windowType;
      if (isFirefox) {
        windowType = "detached_panel";
      } else {
        windowType = "panel";
      }
      chrome.windows.create({
        url: chrome.runtime.getURL("view/popup.html?popup=true"),
        type: windowType as chrome.windows.createTypeEnum,
        height: window.innerHeight,
        width: window.innerWidth,
      });
    },
    migrateStorage() {
      this.$store.commit("currentView/changeView", "LoadingPage");
      this.$store
        .dispatch("accounts/migrateStorage", this.newStorageLocation)
        .then((m) => {
          this.$store.commit("notification/alert", this.i18n[m]);
          this.$store.commit("currentView/changeView", "PreferencesPage");
        }),
        (r: string) => {
          this.$store.commit("notification/alert", this.i18n.updateFailure + r);
          this.$store.commit("currentView/changeView", "PreferencesPage");
        };
    },
    async requireContextMenuPermission(enableContextMenu: boolean) {
      if (enableContextMenu) {
        let granted = false;
        try {
          granted = await chrome.permissions.request({
            permissions: ["contextMenus"],
          });
        } catch (error) {
          console.error("Failed to request context menu permission", error);
        }
        if (!granted) {
          this.enableContextMenu = false;
        }
      }

      // The mutation starts this write without awaiting it. Ensure the setting
      // is persisted before asking the background worker to read it.
      await UserSettings.commitItems();
      chrome.runtime.sendMessage({
        action: "updateContextMenu",
      });
    },
  },
});
</script>
