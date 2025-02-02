<template>
  <Spin :spinning="loading">
    <div class="dance-statistics">
      <div class="dance-statistics-head">
        <div class="dance-statistics-detail" v-for="(item, index) in danceDetail" :key="index">
          <div>{{ item.title }}</div>
          <div class="dance-statistics-value-text" :style="{ color: item.color }">
            {{ item.value || 0 }}
          </div>
        </div>
      </div>
      <div class="dance-analysisPie">
        <MyChart
          v-for="item in pieData"
          :key="item.key"
          :options="item"
          height="380px"
          :style="{ display: 'inline-block', padding: '20px', width: '50%' }"
        />
      </div>
    </div>
  </Spin>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { Spin } from 'ant-design-vue';

  import { getDanceAnalyseApi } from '/@/api/dance';

  import MyChart from '/@/components/Chart/index.vue';

  interface DanceDetailItem {
    key: string;
    title: string;
    value: string | number;
    color: string;
  }

  export default defineComponent({
    name: 'UserStatistics',
    components: { Spin, MyChart },
    setup() {
      const danceDetail = ref<DanceDetailItem[]>([
        { key: 'danceCount', title: '舞曲总量', value: 0, color: '#E422EE' },
        { key: 'monthCount', title: '舞曲新增（月）', value: 0, color: '#18CAE8' },
        { key: 'userDanceCount', title: '用户跳舞次数统计', value: 0, color: '#F43E3E' },
      ]);
      const loading = ref<boolean>(false);
      const pieData = ref<any[]>([]);

      const getUserAnalyse = () => {
        loading.value = true;
        getDanceAnalyseApi()
          .then((res) => {
            const { danceCount, monthCount, userDanceCount, pie } = res || {};
            danceDetail.value = danceDetail.value.map((item) => {
              switch (item.key) {
                case 'danceCount':
                  item.value = danceCount || 0;
                  break;
                case 'monthCount':
                  item.value = monthCount || 0;
                  break;
                default:
                  item.value = userDanceCount || 0;
                  break;
              }
              return item;
            });
            pieData.value = (pie || []).map(({ name, data }) => {
              const obj: any = {};
              obj.title = { text: name, left: 'center' };
              obj.tooltip = { trigger: 'item' };
              obj.series = [
                {
                  type: 'pie',
                  radius: '50%',
                  data,
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                },
              ];
              return obj;
            });
          })
          .finally(() => {
            loading.value = false;
          });
      };

      onMounted(() => {
        getUserAnalyse();
      });

      return { danceDetail, loading, pieData };
    },
  });
</script>

<style lang="less">
  .dance-statistics {
    margin: 20px;

    .dance-statistics-head {
      height: 140px;
      display: flex;
      margin-bottom: 20px;
      background: #fff;
    }

    .dance-statistics-detail {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      color: #101010;
      line-height: 24px;
    }

    .dance-statistics-value-text {
      font-size: 36px;
      line-height: 54px;
      margin-top: 10px;
    }
  }

  .dance-analysisPie {
    background: #fff;
    padding-top: 20px;
    min-height: 380px;
  }
</style>
