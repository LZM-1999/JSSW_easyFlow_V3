<template>
  <div class="flow-menu" ref="tool">
    <span class="ef-node-pmenu">选择工序</span>
    <div v-for="(menu, index) in menuList" :key="menu.id">
      <span class="ef-node-pmenu" @click="setOpen(index)">
        <el-icon>
          <CaretBottom v-if="menu.open" />
          <CaretRight v-else />
        </el-icon>
        <el-icon
          color="red"
          :class="{
            ArrowUp: menu.open,
            ArrowRight: !menu.open,
          }"
        />&nbsp;{{ menu.name }}</span
      >
      <ul v-show="menu.open" class="ef-node-menu-ul">
        <draggable
          v-model="menu.children"
          @end="end"
          @start="move"
          item-key="id"
          :preventOnFilter="false"
          :sort="true"
          :disabled="false"
          :forceFallback="true"
          ghostClass="tt"
          draggable=".draggable"
        >
          <template #item="{ element }">
            <li
              :class="{ 'ef-node-menu-li': true, draggable: !element.disabled }"
              :key="element.id"
              :type="element.type"
              :data-id="element.id"
            >
              <el-icon><Setting/></el-icon> {{ element.name }}
            </li>
          </template>
        </draggable>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { onBeforeMount, reactive, ref, getCurrentInstance, watch } from "vue";
import draggable from '../../../../vuedraggable/src/vuedraggable.js'

const { proxy } = getCurrentInstance();

const props = defineProps({
  menuList: {
    required: true,
    type: Array,
    default() {
      return [];
    },
  },
});


const mousePosition = reactive({
  left: -1,
  top: -1,
});

let drag = ref(false);
let activeNames = ref("1");
// draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
const draggableOptions = reactive({
  preventOnFilter: false,
  sort: false,
  disabled: false,
  ghostClass: "tt",
  // 不使用H5原生的配置
  forceFallback: true,
  // 拖拽的时候样式
  // fallbackClass: 'flow-node-draggable'
});

// 默认打开的左侧菜单的id
const defaultOpeneds = reactive(["1", "2"]);
// 默认打开的左侧菜单的id
let nodeMenu = reactive({});

onBeforeMount(() => {
  /**
   * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
   * @param event
   */
  if (isFirefox()) {
    document.body.ondrop = function (event) {
      // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
      mousePosition.left = event.layerX;
      mousePosition.top = event.clientY - 50;
      event.preventDefault();
      event.stopPropagation();
    };
  }
});

function setOpen(index) {
  console.log(props.menuList[index].open, "props.menuList[index].open");
  props.menuList[index].open = !props.menuList[index].open;
}
function getMenuById(id) {
  // return menuList.find(item => item.id == id)
  for (let i = 0; i < props.menuList.length; i++) {
    const menu = props.menuList[i].children;
    for (let j = 0; j < menu.length; j++) {
      const subMenu = menu[j];
      if (subMenu.id == id) {
        return subMenu;
      }
    }
  }
}

// 拖拽开始时触发
function move(evt, a, b, c) {
  var id = evt.item.attributes["data-id"].nodeValue;
  nodeMenu.value = getMenuById(id);
}

// 拖拽结束时触发
function end(evt, e) {
  proxy.$emit("addNode", evt, nodeMenu, mousePosition);
}
// 是否是火狐浏览器
function isFirefox() {
  var userAgent = navigator.userAgent;
  if (userAgent.indexOf("Firefox") > -1) {
    return true;
  }
  return false;
}
</script>

<style>
.ef-node-pmenu {
  user-select: none;
}
.ef-node-menu-li:not(.draggable) {
  color: #e0e3e7;
  cursor: not-allowed;
}
.flow-menu {
  overflow-y: auto;
  height: calc(100vh - 300px);
  /* border: 1px solid #d3d4d6; */
}
</style>
