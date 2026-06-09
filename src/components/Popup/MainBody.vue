<template>
  <div
    id="codes"
    v-bind:class="{ filter: shouldFilter && filter, search: showSearch }"
  >
    <!-- Filter -->
    <div class="under-header" id="filter" v-on:click="clearFilter()">
      {{ i18n.show_all_entries }}
    </div>
    <!-- Search -->
    <div class="under-header" id="search">
      <input
        id="searchInput"
        v-model="searchText"
        v-bind:placeholder="i18n.search"
        type="text"
        tabindex="-1"
      />
      <div id="searchHint" v-if="searchText === ''">
        <div></div>
        <div id="searchHintBorder">/</div>
        <div></div>
      </div>
    </div>
    <!-- Entries -->
    <div
      ref="entriesList"
      v-on:keydown.down="focusNextEntry()"
      v-on:keydown.right="focusNextEntry()"
      v-on:keydown.up="focusLastEntry()"
      v-on:keydown.left="focusLastEntry()"
    >
      <EntryComponent
        v-for="entry in entries"
        :key="entry.hash"
        v-bind:filtered="!entry.pinned && !isMatchedEntry(entry)"
        v-bind:notSearched="!isSearchedEntry(entry)"
        v-bind:entry="entry"
        v-bind:tabindex="getTabindex(entry)"
      />
      <div class="no-entry" v-if="entries.length === 0 && initComplete">
        <IconKey />
        <p>
          {{ i18n.no_entires }}
          <a href="#" v-on:click="openLink('https://otp.ee/quickstart')">{{
            i18n.learn_more
          }}</a>
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapGetters } from "vuex";
import dragula from "dragula";
import type { Drake } from "dragula";
import { OTPEntry } from "../../models/otp";
import { EntryStorage } from "../../models/storage";

import EntryComponent from "./EntryComponent.vue";

// import IconPlus from "../../../svg/plus.svg";
import IconKey from "../../../svg/key-solid.svg";

const computed: {
  filter: () => boolean;
  showSearch: () => boolean;
  shouldFilter: () => boolean;
  entries: () => OTPEntry[];
} = {
  ...mapState("accounts", ["filter", "showSearch", "initComplete"]),
  ...mapGetters("accounts", ["shouldFilter", "entries"]),
};

export default defineComponent({
  data: function () {
    return {
      searchText: "",
      dragStartIndex: -1,
      entryDrake: null as Drake | null,
    };
  },
  computed,
  methods: {
    openLink(url: string) {
      window.open(url, "_blank");
      return;
    },
    isMatchedEntry(entry: OTPEntry) {
      for (const hash of this.$store.getters["accounts/matchedEntries"]) {
        if (entry.hash === hash) {
          return true;
        }
      }
      return false;
    },
    isSearchedEntry(entry: OTPEntry) {
      if (this.searchText === "") {
        return true;
      }
      if (
        entry.issuer.toLowerCase().includes(this.searchText.toLowerCase()) ||
        entry.account.toLowerCase().includes(this.searchText.toLowerCase())
      ) {
        return true;
      } else {
        return false;
      }
    },
    clearFilter() {
      this.$store.dispatch("accounts/clearFilter");
    },
    isEntryVisible(entry: OTPEntry) {
      return (
        this.isSearchedEntry(entry) &&
        (entry.pinned ||
          !this.shouldFilter ||
          !this.filter ||
          this.isMatchedEntry(entry))
      );
    },
    getTabindex(entry: OTPEntry) {
      const firstEntry = this.entries.find((entry) =>
        this.isEntryVisible(entry)
      );

      return entry === firstEntry ? 0 : -1;
    },
    findNextEntryIndex(reverse: boolean) {
      if (document.activeElement?.getAttribute("data-x-role") !== "entry") {
        return -1;
      }

      const activeIndex = Array.prototype.indexOf.call(
        document.querySelectorAll(".entry"),
        document.activeElement
      );
      if (activeIndex === -1) {
        return -1;
      }

      // reverse modify origin array, and use slice() to make a clone first
      const _entries = reverse ? this.entries.slice().reverse() : this.entries;

      let nextIndex = _entries.findIndex(
        (entry, index) =>
          index >
            (reverse ? this.entries.length - 1 - activeIndex : activeIndex) &&
          this.isEntryVisible(entry)
      );

      if (nextIndex === -1) {
        nextIndex = _entries.findIndex((entry) => this.isEntryVisible(entry));
      }

      return nextIndex;
    },
    focusNextEntry() {
      const nextIndex = this.findNextEntryIndex(false);
      document
        .querySelector<HTMLLinkElement>(`.entry:nth-child(${nextIndex + 1})`)
        ?.focus();
    },
    focusLastEntry() {
      const lastIndex = this.entries.length - 1 - this.findNextEntryIndex(true);
      document
        .querySelector<HTMLLinkElement>(`.entry:nth-child(${lastIndex + 1})`)
        ?.focus();
    },
  },
  mounted() {
    const entriesList = this.$refs.entriesList as Element | undefined;
    if (!entriesList) {
      return;
    }

    this.entryDrake = dragula([entriesList], {
      invalid: () => {
        if (!this.$store.state.style.style.isEditing) {
          return true;
        } else {
          return false;
        }
      },
    });

    this.entryDrake.on("drag", (el, source) => {
      this.dragStartIndex = Array.prototype.indexOf.call(
        source.querySelectorAll(".entry"),
        el
      );
    });

    this.entryDrake.on("drop", async (el, target) => {
      if (!target || this.dragStartIndex < 0) {
        return;
      }

      const dropIndex = Array.prototype.indexOf.call(
        target.querySelectorAll(".entry"),
        el
      );
      if (dropIndex < 0 || dropIndex === this.dragStartIndex) {
        return;
      }

      this.$store.commit("accounts/moveCode", {
        from: this.dragStartIndex,
        to: dropIndex,
      });
      await EntryStorage.set(this.$store.state.accounts.entries);
      this.dragStartIndex = -1;
    });
  },
  unmounted() {
    this.entryDrake?.destroy();
  },
  components: {
    EntryComponent,
    // IconPlus,
    IconKey,
  },
});
</script>
