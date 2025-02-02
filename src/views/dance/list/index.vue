<template>
  <div class="dance-list">
    <div class="dance-list-sidebar">
      <div class="dance-sidebar-main">
        <div
          v-for="menu in statusList"
          :key="menu.value"
          :class="['sidebar-item', status === menu.value && 'sidebar-item--selected']"
          @click="handleSelect(menu.value)"
        >
          {{ menu.label }}
        </div>
      </div>
    </div>
    <div class="dance-list-main">
      <div class="dance-list-section">
        <SearchFilter
          ref="formRef"
          :loading="loading"
          :configs="filterConfigs"
          @onSearch="onSearch"
        />
      </div>
      <div class="dance-list-section">
        <Table
          :loading="loading"
          :dataSource="dataSource"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @change="onTableChange"
        />
      </div>

      <Modal
        v-model:visible="visible"
        title="编辑"
        :width="570"
        centered
        :confirmLoading="modalLoading"
        @cancel="handleCancel"
        @ok="handleOk"
      >
        <template #footer v-if="modalStatus === 'audit'">
          <Space>
            <Button @click="handleCancel">取消</Button>
            <Button danger @click="handleAudit('2')">不通过</Button>
            <Button type="primary" ghost @click="handleAudit('3')">通过</Button>
          </Space>
        </template>
        <videoPlay v-if="modalInfo" width="auto" :src="modalInfo.danceUrl || ''" />
        <Form
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          :style="{ marginTop: '24px' }"
          ref="modalFormRef"
          :model="modalInfo"
        >
          <FormItem name="difficulty" label="难度">
            <Rate v-model:value="modalInfo.difficulty" :disabled="modalStatus === 'audit'" />
          </FormItem>
          <FormItem name="style" label="风格" class="dance-modal-form-item">
            <!-- <RadioGroup v-model:value="modalInfo.style" :disabled="modalStatus === 'audit'">
              <RadioButton v-for="item in styleList" :key="item.value" :value="item.value">
                {{ item.label }}
              </RadioButton>
            </RadioGroup> -->
            <CheckboxGroup v-model:value="modalInfo.style" :disabled="modalStatus === 'audit'">
              <Checkbox v-for="option in styleList" :key="option.value" :value="option.value">
                {{ option.label }}
              </Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem name="calories" label="卡路里">
            <Row>
              <Col :span="12">
                <Slider
                  v-model:value="modalInfo.calories"
                  :tip-formatter="formatter"
                  :disabled="modalStatus === 'audit'"
                />
              </Col>
              <Col :span="4" style="line-height: 36px; margin-left: 8px">
                {{ `${modalInfo.calories || 0} kal` }}
              </Col>
            </Row>
          </FormItem>
        </Form>
      </Modal>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import {
    Table,
    Modal,
    Form,
    Rate,
    // Radio,
    Slider,
    Row,
    Col,
    Space,
    Button,
    Checkbox,
  } from 'ant-design-vue';

  import 'vue3-video-play/dist/style.css';
  import { videoPlay } from 'vue3-video-play';

  import { deleteDanceApi, getDanceListApi, updateDanceApi } from '/@/api/dance';
  import usePagination from '/@/hooks/usePagination';
  import { useMessage } from '/@/hooks/useMessage';
  import { difficultyEnum } from '/@/enums/dance/difficulty';
  import { styleEnum } from '/@/enums/dance/style';
  import { statusList } from '/@/enums/dance/status';
  import { createDanceListColumns } from './data';
  import { getParams } from './adaptor';

  import SearchFilter from '/@/components/SearchFilter/index.vue';

  interface DanceData {
    records?: any[];
    current: number;
    total: number;
  }

  export default defineComponent({
    name: 'DanceList',
    components: {
      Table,
      SearchFilter,
      Modal,
      videoPlay,
      Form,
      FormItem: Form.Item,
      Rate,
      // RadioGroup: Radio.Group,
      // RadioButton: Radio.Button,
      Slider,
      Row,
      Col,
      Space,
      Button,
      Checkbox,
      CheckboxGroup: Checkbox.Group,
    },
    setup() {
      const status = ref<string>('');
      const formRef = ref<any>({});
      const loading = ref<boolean>(false);
      const dataSource = ref<any[]>([]);
      const visible = ref<boolean>(false);
      const modalStatus = ref<string>('');
      const modalFormRef = ref<any>({});
      const modalInfo = ref<any>({});
      const modalLoading = ref<boolean>(false);

      const { pagination, onPageChange } = usePagination();
      const { createConfirm } = useMessage();

      const getList = () => {
        const params = getParams(pagination, formRef.value.formData, status.value);

        loading.value = true;

        getDanceListApi(params)
          .then((res: DanceData) => {
            const { current, total, records } = res || {};
            pagination.current = current;
            pagination.total = total;
            dataSource.value = records || [];
          })
          .finally(() => {
            loading.value = false;
          });
      };

      const onSearch = () => {
        pagination.current = 1;
        getList();
      };

      // 侧边栏选择
      const handleSelect = (v: string) => {
        if (status.value === v) return;
        status.value = v;
        pagination.current = 1;
        getList();
      };

      // 翻页
      const onTableChange = (pagination) => {
        onPageChange(pagination);
        getList();
      };

      // 审核
      const onAudit = (record) => {
        modalInfo.value = { ...record };
        visible.value = true;
        modalStatus.value = 'audit';
      };

      const handleAudit = (status) => {
        modalLoading.value = true;
        const { id } = modalInfo.value;
        updateDanceApi({ id, status })
          .then(() => {
            handleCancel();
            getList();
          })
          .finally(() => {
            modalLoading.value = false;
          });
      };

      // 更新舞曲状态
      const handleEditDance = (record, options) => {
        updateDanceApi({ id: record.id, ...options }).then(() => {
          getList();
        });
      };

      // 编辑操作
      const handleEdit = (record) => {
        modalInfo.value = {
          ...record,
          style: record.style ? record.style.split(',') : [],
        };
        visible.value = true;
        modalStatus.value = 'edit';
      };

      const handleCancel = () => {
        modalInfo.value = {};
        visible.value = false;
        modalStatus.value = '';
      };

      // 删除操作
      const handleDelete = (record) => {
        createConfirm({
          iconType: 'warning',
          title: '删除确认?',
          content: '删除后不能恢复，确定要删除吗',
          onOk: () => {
            deleteDanceApi({ id: record.id }).then(() => {
              getList();
            });
          },
        });
      };

      const handleOk = () => {
        const { id, difficulty, style, calories } = modalInfo.value;
        modalLoading.value = true;
        updateDanceApi({ id, difficulty, style: style.join(','), calories })
          .then(() => {
            handleCancel();
            getList();
          })
          .finally(() => {
            modalLoading.value = false;
          });
      };

      const formatter = (value: number) => {
        return `${value} kal`;
      };

      onMounted(() => {
        getList();
      });

      const columns = computed(() => {
        return createDanceListColumns({
          status,
          onAudit,
          handleEdit,
          handleDelete,
          handleEditDance,
        });
      });

      const filterConfigs = computed(() => {
        return [
          {
            name: 'difficulty',
            type: 'select',
            placeholder: '请选择舞曲难度',
            options: difficultyEnum,
            formItemProps: { style: { minWidth: '140px' } },
            props: { showSearch: true },
          },
          {
            name: 'style',
            type: 'select',
            placeholder: '请选择舞曲风格',
            options: styleEnum,
            formItemProps: { style: { minWidth: '140px' } },
            props: { showSearch: true },
          },
          {
            name: 'name',
            type: 'inputSearch',
            placeholder: '请输入歌曲名',
            formItemProps: { style: { flex: 1 } },
            props: {
              showSearch: true,
            },
          },
        ];
      });

      return {
        loading,
        dataSource,
        status,
        statusList,
        formRef,
        filterConfigs,
        columns,
        pagination,
        visible,
        modalStatus,
        modalInfo,
        modalLoading,
        handleSelect,
        onTableChange,
        handleOk,
        handleCancel,
        onSearch,
        modalFormRef,
        styleList: styleEnum.slice(1),
        formatter,
        handleAudit,
      };
    },
  });
</script>

<style lang="less">
  .dance-list {
    display: flex;
    height: 100%;

    .dance-list-sidebar {
      width: 150px;
      flex-shrink: 0;
      background: #fff;
      margin-top: 10px;

      .dance-sidebar-main {
        padding: 10px 0;
        cursor: pointer;
      }

      .sidebar-item {
        padding-left: 24px;
        padding-right: 16px;
        font-size: 14px;
        line-height: 40px;
      }

      .sidebar-item--selected {
        background: #f0f2f5;
      }
    }

    .dance-list-main {
      flex: 1;
      margin: 20px 0 0 20px;
      background: #fff;
    }

    .dance-list-section {
      margin: 20px;
    }

    .music-image {
      width: 50px;
      height: 50px;
    }
  }

  .dance-modal-form-item {
    .ant-radio-button-wrapper {
      margin: 6px;
    }
  }
</style>
