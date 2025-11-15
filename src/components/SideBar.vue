<!--
/**
 * @file SideBar.vue
 * @description This component provides the main navigation sidebar for the application.
 *              It supports both single-level and multi-level (collapsible) menu items,
 *              dynamic icons, and a logout button.
 *
 * @overview
 * The sidebar is a crucial part of the application's layout, offering a structured way
 * to navigate between different views. It is designed to be configurable via props,
 * allowing the parent component to define the navigation structure. It also handles
 * its own internal state for managing collapsible submenus.
 *
 * @props
 * - `title`: A `String` prop for the title displayed at the top of the sidebar. Defaults to 'Dashboard'.
 * - `items`: An `Array` of navigation item objects. Each object must have a `label` and a `route`.
 *   If an item has a `children` array (of similar objects), it will be rendered as a
 *   collapsible submenu. An optional `icon` property can be provided for dynamic icon rendering.
 *
 * @emits
 * - `logout`: Emitted when the user clicks the logout button at the bottom of the sidebar.
 * - `navigate`: Emitted whenever a navigation link is clicked. This is primarily used to
 *   trigger actions in the parent component, such as closing the mobile sidebar after navigation.
 *
 * @dependencies
 * - Vue Composition API: `ref` for managing the state of the currently open submenu.
 * - `vue-router`: Used for declarative navigation via the `<router-link>` component.
 *
 * @interactions
 * - **Submenu Toggle:** Clicking on a menu item that has a `children` array toggles the
 *   visibility of its submenu. The `toggleSubmenu` function manages which submenu is open.
 * - **Navigation:** Clicking on a standard navigation link or a sub-item link navigates the
 *   user to the specified route and emits the `navigate` event.
 * - **Logout:** Clicking the logout button at the bottom of the sidebar emits the `logout` event,
 *   allowing the parent component to handle the logout logic.
 *
 * @uiUx
 * - Provides a clean, hierarchical navigation structure that is easy to understand.
 * - Dynamically renders icons next to menu items for better visual guidance.
 * - Includes a smooth slide animation for opening and closing submenus, enhancing the user experience.
 * - The currently active route is highlighted to provide clear visual feedback on the user's location
 *   within the application.
 */
-->
<template>
  <aside class="w-64 h-screen bg-white border-r flex flex-col">
    
    <div class="h-16 flex items-center justify-center border-b">
      <span class="text-lg font-semibold">{{ title }}</span>
    </div>

    
    <nav class="flex-1 overflow-y-auto p-4 space-y-2">
      <div v-for="item in items" :key="item.label">
        
        <div>
          <button
            v-if="item.children"
            @click="toggleSubmenu(item.label)"
            class="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <component :is="item.icon" v-if="item.icon" class="w-5 h-5 text-gray-500" />
              <span>{{ item.label }}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-gray-400 transform transition-transform duration-200"
              :class="{ 'rotate-90': openSubmenu === item.label }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          
          <router-link
            v-else
            :to="item.route"
            class="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-2"
            active-class="bg-gray-100"
            @click="$emit('navigate')"
          >
            <component :is="item.icon" v-if="item.icon" class="w-5 h-5 text-gray-500" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>

        
        <transition name="slide">
          <div
            v-if="item.children && openSubmenu === item.label"
            class="ml-6 mt-1 space-y-1"
          >
            <router-link
              v-for="sub in item.children"
              :key="sub.label"
              :to="sub.route"
              class="block px-3 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-100"
              active-class="bg-gray-100 font-medium"
              @click="$emit('navigate')"
            >
              {{ sub.label }}
            </router-link>
          </div>
        </transition>
      </div>
    </nav>

    
    <div class="border-t p-4">
      <button
        class="w-full flex items-center justify-center px-3 py-2 rounded-md hover:bg-gray-100"
        @click="$emit('logout')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 0H5a2 2 0 00-2 2v10a2 2 0 002 2h8"
          />
        </svg>
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  items: { type: Array, default: () => [] },
})

const openSubmenu = ref(null)

function toggleSubmenu(label) {
  openSubmenu.value = openSubmenu.value === label ? null : label
}
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>