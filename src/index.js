import Panel from "easyflow-v3/src/components/ef/panel.vue";
import ShowFlow from "easyflow-v3/src/components/ef/show_flow.vue";

import { vDialogDrag, vDialogDragWidth } from "easyflow-v3/src/plugins/directives.js";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'





let easyflowV3={
    install : function (Vue, options) {
        // 1. 添加全局方法或 property
        // Vue.myGlobalMethod = function () {
        //     console.log('myGlobalMethod');
        // }
        // 2. 添加全局资源
        // Vue.directive('myDirective', {
        //     bind(el, binding, vnode, oldVnode) {
        //         console.log('myDirective');
        //     }
        // })
        Vue.directive('DialogDrag', vDialogDrag)
        Vue.directive('DialogDragWidth', vDialogDragWidth)
        // 3. 注入组件选项
        // Vue.mixin(mixinsSpc)
        // 4. 添加实例方法
        // Vue.prototype.$myMethod = function (methodOptions) {
        //     // 逻辑...
        //     console.log('$myMethod');
        // }
        // 4. 注册全局组件
        Vue.component('M-FlowPanel', Panel)
        Vue.component('M-ShowFlow', ShowFlow)
        for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
          Vue.component(key, component)
        }
    }
}

export default easyflowV3