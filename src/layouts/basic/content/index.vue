<template>
  <LayoutContent
    :style="{ flex: '1 1 auto', position: 'relative', display: 'flex', flexDirection: 'column' }"
  >
    <router-view />
  </LayoutContent>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Layout } from 'ant-design-vue';

  export default defineComponent({
    name: 'BasicContent',
    components: {
      LayoutContent: Layout.Content,
    },
  });
</script>
