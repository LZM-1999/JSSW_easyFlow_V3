<!--https://gitee.com/xiaoka2017/easy-flow-->
<template>
  <div v-if="easyFlowVisible">
    <el-row>
      <!-- 顶部工具菜单 -->
      <el-col :span="24">
        <div class="ef-tooltar" style="display: flex;justify-content: space-between">
          <el-button link size="large" @click="deleteElement" :disabled="!activeElement.type"><el-icon><Delete /></el-icon></el-button>
          <el-button plain round  @click="openHelp" size="default" type="info"><el-icon style="margin-right: 10px;"><Delete /></el-icon>帮助</el-button>
        </div>
      </el-col>
    </el-row>
    <div style="display: flex;height: 600px;">
      <div style="width: 230px;border-right: 1px solid #dce3e8;">
        <FlowNodeForm ref="nodeForm" @setLineLabel="setLineLabel" @repaintEverything="repaintEverything"/>
        <NodeMenu @addNode="addNode" ref="nodeMenu" :menuList="props.menuList"></NodeMenu>
      </div>
      <div id="efContainer2" ref="efContainer2" class="container" v-FlowDrag>
        <template v-for="node in data.nodeList" :key="node.id">
          <flow-node
            :id="node.id"
            :node="node"
            :activeElement="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode"
          >
          </flow-node>
        </template>
        <!-- 给画布一个默认的宽度和高度 -->
        <div style="position:absolute;top: 800px;left: 2000px;">&nbsp;</div>
      </div>
    </div>
    <!-- 流程数据详情 -->
    <FlowHelp v-if="flowHelpVisible" ref="flowHelp"></FlowHelp>
  </div>
</template>
<script setup>
import "easyflow-v3/src/components/ef/index.css";
// import draggable from '../../../../vuedraggable/src/vuedraggable'
// import { jsplumb } from 'jsplumb'
// 使用修改后的jsplumb
import "./jsplumb";
import {
  jsplumbSetting,
  jsplumbConnectOptions,
  jsplumbSourceOptions,
  jsplumbSourceOptions2,
  jsplumbTargetOptions,
} from "easyflow-v3/src/components/ef/mixins";
import flowNode from "easyflow-v3/src/components/ef/node";
import NodeMenu from "easyflow-v3/src/components/ef/node_menu";
import FlowHelp from "easyflow-v3/src/components/ef/help";
import FlowNodeForm from "./node_form";
import lodash from "lodash-es";
// import * as ProcessPath from "easyflow-v3/src/api/craft/processPath";
import { reactive, ref, watch, onMounted, getCurrentInstance, defineProps } from "vue";



const { proxy } = getCurrentInstance();

const props = defineProps({
  flowData: {
    required: true,
    type: Object,
  },
  menuList:{
    type: Array,
    default(){
      return reactive([ { "open": true, "name": "在制品", "children": [ { "id": "127", "name": "长晶", "ico": "setting", "disabled": false }, { "id": "128", "name": "送验", "ico": "setting", "disabled": false }, { "id": "129", "name": "划线", "ico": "setting", "disabled": false }, { "id": "130", "name": "截断", "ico": "setting", "disabled": false }, { "id": "131", "name": "粘圆棒", "ico": "setting", "disabled": false }, { "id": "132", "name": "开方", "ico": "setting", "disabled": false }, { "id": "133", "name": "磨削", "ico": "setting", "disabled": false }, { "id": "134", "name": "圆棒检验", "ico": "setting", "disabled": false }, { "id": "135", "name": "方棒检验", "ico": "setting", "disabled": false }, { "id": "137", "name": "打包", "ico": "setting", "disabled": false }, { "id": "138", "name": "综计WMS", "ico": "setting", "disabled": false } ] } ]) 
    }
  }
});

const flowHelp = ref(null)

// myJsPlumb 实例
let myJsPlumb = ref(null);
// 控制画布销毁
let easyFlowVisible = ref(true);
// 控制流程数据显示与隐藏
// 是否加载完毕标志位
let loadEasyFlowFinish = ref(false);
let flowHelpVisible = ref(false);
// 数据
let data = ref({
  nodeList: [],
  lineList: [],
});
// 激活的元素、可能是节点、可能是连线
let activeElement = ref({
  // 可选值 node 、line
  type: undefined,
  // 节点ID
  nodeId: undefined,
  // 连线ID
  sourceId: undefined,
  targetId: undefined,
});
let efContainer2 = ref(null)

let zoom = ref(0.5);
// let menuList = ref([{ name: "", open: true, children: [{}] }]);

defineExpose({
  data
})

watch(
  () => props.flowData,
  (val) => {
    if (!val) return;
    const nodeList = val.nodeList.map((item) => ({
      ...item,
      id: item.id.toString(),
    }));
    const lineList = val.lineList.map((item) => ({
      ...item,
      from: item.from.toString(),
      to: item.to.toString(),
    }));
    const transferData = { nodeList, lineList };
    proxy.$nextTick(() => {
      dataReload(transferData);
    });
  },
  { deep: true, immediate: true }
);

const vFlowDrag = {
  mounted: (el, binding, vnode, oldNode)=>{
    if (!binding) {
      return;
    }
    el.onmousedown = (e) => {
      if (e.button == 2) {
        // 右键不管
        return;
      }
      //  鼠标按下，计算当前原始距离可视区的高度
      let disX = e.clientX;
      let disY = e.clientY;
      el.style.cursor = "move";

      document.onmousemove = function (e) {
        // 移动时禁止默认事件
        e.preventDefault();
        const left = e.clientX - disX;
        disX = e.clientX;
        el.scrollLeft += -left;

        const top = e.clientY - disY;
        disY = e.clientY;
        el.scrollTop += -top;
      };

      document.onmouseup = function (e) {
        el.style.cursor = "auto";
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
};

onMounted(() => {
  jsplumbSetting.Container = "efContainer2";
  myJsPlumb.value = jsPlumb.getInstance();
  // p_processChoice();
});

function p_processChoice() {
  // ProcessPath.getfactoryModelTree().then((res) => {
  //   console.log('res', res.data[0].children);
  //   menuList = res.data[0].children
  //     .filter((menu) => menu.typeName === "车间" && menu.enable)
  //     .map((menu) => {
  //       const arr = menu.children
  //         .filter((subMenu) => subMenu.typeName === "工序" && subMenu.enable)
  //         .map((subMenu) => ({
  //           id: subMenu.id.toString(),
  //           name: subMenu.name,
  //           ico: "setting",
  //           // disabled: data.nodeList.some(item => item.id.toString() === subMenu.id.toString())
  //           disabled: false,
  //         }));

  //       return {
  //         open: true,
  //         name: menu.name,
  //         children: arr,
  //       };
  //     });
  //   console.log('menuList',menuList)
  //   // proxy.$forceUpdate();
  // });
  // menuList.value = [ { "open": true, "name": "在制品", "children": [ { "id": "127", "name": "长晶", "ico": "setting", "disabled": false }, { "id": "128", "name": "送验", "ico": "setting", "disabled": false }, { "id": "129", "name": "划线", "ico": "setting", "disabled": false }, { "id": "130", "name": "截断", "ico": "setting", "disabled": false }, { "id": "131", "name": "粘圆棒", "ico": "setting", "disabled": false }, { "id": "132", "name": "开方", "ico": "setting", "disabled": false }, { "id": "133", "name": "磨削", "ico": "setting", "disabled": false }, { "id": "134", "name": "圆棒检验", "ico": "setting", "disabled": false }, { "id": "135", "name": "方棒检验", "ico": "setting", "disabled": false }, { "id": "137", "name": "打包", "ico": "setting", "disabled": false }, { "id": "138", "name": "综计WMS", "ico": "setting", "disabled": false } ] } ]
}
// 返回唯一标识
function getUUID() {
  return Math.random().toString(36).substr(3, 10);
}

function jsPlumbInit() {
  myJsPlumb.value.ready(() => {
    // 导入默认配置
    myJsPlumb.value.importDefaults(jsplumbSetting);
    // 会使整个jsPlumb立即重绘。
    myJsPlumb.value.setSuspendDrawing(false, true);
    // 初始化节点
    loadEasyFlow();
    // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
    myJsPlumb.value.bind("click", (conn, originalEvent) => {
      const { strokeWidth, stroke } = conn.getPaintStyle();
      activeElement.value.type = "line";
      activeElement.value.sourceId = conn.sourceId;
      activeElement.value.targetId = conn.targetId;
      proxy.$refs.nodeForm.lineInit({
        from: conn.sourceId,
        to: conn.targetId,
        label: conn.getLabel(),
        strokeWidth,
        stroke,
      });
    });
    // 连线
    myJsPlumb.value.bind("connection", (evt) => {
      let from = evt.source.id;
      let to = evt.target.id;
      if (loadEasyFlowFinish.value) {
        data.value.lineList.push({ from: from, to: to });
      }
    });

    // 删除连线回调
    myJsPlumb.value.bind("connectionDetached", (evt) => {
      deleteLine(evt.sourceId, evt.targetId);
    });

    // 改变线的连接节点
    myJsPlumb.value.bind("connectionMoved", (evt) => {
      changeLine(evt.originalSourceId, evt.originalTargetId);
    });

    // 连线右击
    myJsPlumb.value.bind("contextmenu", (evt) => {
      // console.log('contextmenu', evt)
    });

    // 连线
    myJsPlumb.value.bind("beforeDrop", (evt) => {
      let from = evt.sourceId;
      let to = evt.targetId;
      if (from === to) {
        proxy.$message.error("节点不支持连接自己");
        return false;
      }
      if (hasLine(from, to)) {
        proxy.$message.error("该关系已存在,不允许重复创建");
        return false;
      }
      if (hashOppositeLine(from, to)) {
        // proxy.$message.error('不支持两个节点之间连线回环')
        // return false
      }
      proxy.$message.success("连接成功");
      return true;
    });

    // beforeDetach
    myJsPlumb.value.bind("beforeDetach", (evt) => {
      // console.log('beforeDetach', evt)
    });
    myJsPlumb.value.setContainer(proxy.$refs.efContainer2);
  });
}

// 加载流程图
function loadEasyFlow() {
  // 初始化节点
  for (var i = 0; i < data.value.nodeList.length; i++) {
    let node = data.value.nodeList[i];
    // 设置源点，可以拖出线连接其他节点
    myJsPlumb.value.makeSource(
      node.id,
      lodash.merge(jsplumbSourceOptions, {})
    );
    // // 设置目标点，其他源点拖出的线可以连接该节点
    myJsPlumb.value.makeTarget(node.id, jsplumbTargetOptions);
    if (!node.viewOnly) {
      myJsPlumb.value.draggable(node.id, {
        containment: "parent",
        stop: function (el) {
          // 拖拽节点结束后的对调
          // console.log('拖拽结束: ', el)
        },
      });
    }
  }
  // 初始化连线
  for (var i = 0; i < data.value.lineList.length; i++) {
    let line = data.value.lineList[i];
    var connParam = {
      source: line.from,
      target: line.to,
      label: line.label ? line.label : "",
      connector: line.connector ? line.connector : "",
      anchors: line.anchors ? line.anchors : undefined,
      paintStyle: line.paintStyle ? line.paintStyle : undefined,
    };
    myJsPlumb.value.connect(connParam, jsplumbConnectOptions);
  }
  proxy.$nextTick(function () {
    loadEasyFlowFinish.value = true;
  });
}

// 设置连线条件
function setLineLabel(from, to, label, paintStyle) {
  var conn = myJsPlumb.value.getConnections({
    source: from,
    target: to,
  })[0];
  if (!label || label === "") {
    conn.removeClass("flowLabel");
    conn.addClass("emptyFlowLabel");
  } else {
    conn.addClass("flowLabel");
  }
  conn.setLabel({
    label: label,
  });
  conn.setPaintStyle(paintStyle);
  data.value.lineList.forEach(function (line) {
    if (line.from == from && line.to == to) {
      line.label = label;
      line.paintStyle = paintStyle;
    }
  });
}

// 删除激活的元素
function deleteElement() {
  if (activeElement.value.type === "node") {
    deleteNode(activeElement.value.nodeId);
  } else if (activeElement.value.type === "line") {
    proxy.$confirm("确定删除所点击的线吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        var conn = myJsPlumb.value.getConnections({
          source: activeElement.value.sourceId,
          target: activeElement.value.targetId,
        })[0];
        myJsPlumb.value.deleteConnection(conn);
      })
      .catch(() => {});
  }
}

// 删除线
function deleteLine(from, to) {
  data.value.lineList = data.value.lineList.filter(function (line) {
    if (line.from == from && line.to == to) {
      return false;
    }
    return true;
  });
}

// 改变连线
function changeLine(oldFrom, oldTo) {
  deleteLine(oldFrom, oldTo);
}

// 改变节点的位置
function changeNodeSite(nodeData) {
  for (var i = 0; i < data.value.nodeList.length; i++) {
    let node = data.value.nodeList[i];
    if (node.id === nodeData.nodeId) {
      node.left = nodeData.left;
      node.top = nodeData.top;
    }
  }
}

/**
 * 拖拽结束后添加新的节点
 * @param evt
 * @param nodeMenu 被添加的节点对象
 * @param mousePosition 鼠标拖拽结束的坐标
 */
function addNode(evt, nodeMenu, mousePosition) {
  var screenX = evt.originalEvent.clientX,
  screenY = evt.originalEvent.clientY;
  let efContainer = proxy.$refs.efContainer2;
  var containerRect = efContainer.getBoundingClientRect();
  var left = screenX,
    top = screenY;
  // 计算是否拖入到容器中
  if (
    left < containerRect.x ||
    left > containerRect.width + containerRect.x ||
    top < containerRect.y ||
    containerRect.y > containerRect.y + containerRect.height
  ) {
    proxy.$message.error("请把节点拖入到画布中");
    return;
  }
  left = left - containerRect.x + efContainer.scrollLeft;
  top = top - containerRect.y + efContainer.scrollTop;
  // 居中
  left -= 85;
  top -= 16;
  var processId = nodeMenu.value.id;
  var uid = getUUID();
  // 动态生成名字
  var origName = nodeMenu.value.name;
  var nodeName = origName;
  var index = 1;
  // while (index < 10000) {
  //   var repeat = false
  //   for (var i = 0; i < data.value.nodeList.length; i++) {
  //     let node = data.value.nodeList[i]
  //     if (node.name === nodeName) {
  //       nodeName = origName + index
  //       repeat = true
  //     }
  //   }
  //   if (repeat) {
  //     index++
  //     continue
  //   }
  //   break
  // }
  var node = {
    id: uid,
    processId: processId,
    name: nodeName,
    type: nodeMenu.value.type,
    left: left + "px",
    top: top + "px",
    ico: nodeMenu.value.ico,
    state: "success",
  };
  /**
   * 这里可以进行业务判断、是否能够添加该节点
   */
  data.value.nodeList.push(node);
  proxy.$nextTick(function () {
    myJsPlumb.value.makeSource(uid, jsplumbSourceOptions);
    myJsPlumb.value.makeTarget(uid, jsplumbTargetOptions);
    myJsPlumb.value.draggable(uid, {
      containment: "parent",
      stop: function (el) {
        // 拖拽节点结束后的对调
        // console.log('拖拽结束: ', el)
      },
    });
  });
}

/**
 * 删除节点
 * @param nodeId 被删除节点的ID
 */

function deleteNode(nodeId) {
  proxy.$confirm("确定要删除?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    closeOnClickModal: false,
  })
    .then(() => {
      /**
       * 这里需要进行业务判断，是否可以删除
       */
      data.value.nodeList = data.value.nodeList.filter(function (node) {
        if (node.id === nodeId) {
          // 伪删除，将节点隐藏，否则会导致位置错位
          // node.show = false
          return false;
        }
        return true;
      });
      proxy.$nextTick(function () {
        myJsPlumb.value.removeAllEndpoints(nodeId);
        dataReload(lodash.cloneDeep(data.value));
      });
    })
    .catch(() => {});
  return true;
}

function clickNode(nodeId) {
  activeElement.value.type = "node";
  activeElement.value.nodeId = nodeId;
  proxy.$refs.nodeForm.nodeInit(data.value, nodeId);
}

// 是否具有该线
function hasLine(from, to) {
  for (var i = 0; i < data.value.lineList.length; i++) {
    var line = data.value.lineList[i];
    if (line.from === from && line.to === to) {
      return true;
    }
  }
  return false;
}

// 是否含有相反的线
function hashOppositeLine(from, to) {
  return hasLine(to, from);
}

function nodeRightMenu(nodeId, evt) {
  menu.show = true;
  menu.curNodeId = nodeId;
  menu.left = evt.x + "px";
  menu.top = evt.y + "px";
}
function repaintEverything() {
  myJsPlumb.value.repaint();
}

// // 加载流程图
function dataReload(reloadData) {
  easyFlowVisible.value = false;
  data.value.lineList = [];
  data.value.nodeList = [];
  proxy.$nextTick(() => {
    reloadData = lodash.cloneDeep(reloadData);
    easyFlowVisible.value = true;
    data.value = reloadData;
    proxy.$nextTick(() => {
      myJsPlumb.value = jsPlumb.getInstance();
      proxy.$nextTick(() => {
        jsPlumbInit();
      });
    });
  });
}

function openHelp() {
  flowHelpVisible.value = true;
  proxy.$nextTick(function () {
    console.log(flowHelp.value.init,'flowHelp');
    flowHelp.value.init()
  });
}
</script>
