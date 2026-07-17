import { isSafari } from "../browser";
import { UserSettings } from "../models/settings";
import { ManagedStorage } from "../models/storage";

export class Menu implements Module {
  async getModule() {
    await UserSettings.updateItems();
    const [
      backupDisabled,
      exportDisabled,
      enforcePassword,
      enforceAutolock,
      storageArea,
      feedbackURL,
      passwordPolicy,
      passwordPolicyHint,
      contextMenuPermission,
    ] = await Promise.all([
      ManagedStorage.get("disableBackup", false),
      ManagedStorage.get("disableExport", false),
      ManagedStorage.get("enforcePassword", false),
      ManagedStorage.get("enforceAutolock", false),
      ManagedStorage.get<"sync" | "local">("storageArea"),
      ManagedStorage.get<string>("feedbackURL"),
      ManagedStorage.get<string>("passwordPolicy"),
      ManagedStorage.get<string>("passwordPolicyHint"),
      chrome.permissions
        .contains({
          permissions: ["contextMenus"],
        })
        .catch(() => false),
    ]);

    const menuState = {
      state: {
        version: chrome.runtime.getManifest()?.version || "0.0.0",
        zoom: Number(UserSettings.items.zoom) || 100,
        useAutofill: UserSettings.items.autofill === true,
        smartFilter: UserSettings.items.smartFilter === true,
        enableContextMenu:
          UserSettings.items.enableContextMenu === true &&
          contextMenuPermission === true,
        theme: UserSettings.items.theme || (isSafari ? "flat" : "normal"),
        autolock: Number(UserSettings.items.autolock) || 30,
        backupDisabled,
        exportDisabled,
        enforcePassword,
        enforceAutolock,
        storageArea,
        feedbackURL,
        passwordPolicy,
        passwordPolicyHint,
      },
      mutations: {
        setZoom: (state: MenuState, zoom: number) => {
          state.zoom = zoom;
          UserSettings.items.zoom = zoom;
          UserSettings.commitItems();
          this.resize(zoom);
        },
        setAutofill(state: MenuState, useAutofill: boolean) {
          state.useAutofill = useAutofill;
          UserSettings.items.autofill = useAutofill;
          UserSettings.commitItems();
        },
        setSmartFilter(state: MenuState, smartFilter: boolean) {
          state.smartFilter = smartFilter;
          UserSettings.items.smartFilter = smartFilter;
          UserSettings.commitItems();
        },
        setEnableContextMenu(state: MenuState, enableContextMenu: boolean) {
          state.enableContextMenu = enableContextMenu;
          UserSettings.items.enableContextMenu = enableContextMenu;
          UserSettings.commitItems();
        },
        setTheme(state: MenuState, theme: string) {
          state.theme = theme;
          UserSettings.items.theme = theme;
          UserSettings.commitItems();
        },
        setAutolock(state: MenuState, autolock: number) {
          state.autolock = autolock;
          UserSettings.items.autolock = autolock;
          UserSettings.commitItems();
        },
      },
      namespaced: true,
    };

    this.resize(menuState.state.zoom);

    return menuState;
  }

  private resize(zoom: number) {
    if (zoom !== 100) {
      document.body.style.marginBottom = 480 * (zoom / 100 - 1) + "px";
      document.body.style.marginRight = 320 * (zoom / 100 - 1) + "px";
      document.body.style.transform = "scale(" + zoom / 100 + ")";
    }
  }
}
