import Clipboard from 'clipboard';
import store from '@/store';
import { compareAuth, DEFAULT_PLACEHOLDER } from '.';

/**
 * 指令合集
 */
export default {
  // 权限指令
  auth: {
    bind(el, binding, vnode) {
      const { authBtn } = store.state.user;
      vnode.elm.hidden = !compareAuth(binding.value, authBtn);
    },
  },
  focus: {
    inserted(el) {
      el.querySelector('input').focus();
    },
  },
  drag: {
    bind(el, binding, vnode, oldVnode) {
      if (!binding.value) return;
      const dialogHeaderEl = el.querySelector('.el-dialog__header');
      const dragDom = el.querySelector('.el-dialog');
      dialogHeaderEl.style.cursor = 'move';

      // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
      const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);

      dialogHeaderEl.onmousedown = (e) => {
        // 鼠标按下，计算当前元素距离可视区的距离
        const disX = e.clientX - dialogHeaderEl.offsetLeft;
        const disY = e.clientY - dialogHeaderEl.offsetTop;

        // 获取到的值带px 正则匹配替换
        let styL,
          styT;

        // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
        if (sty.left.includes('%')) {
          styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100);
          styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100);
        } else {
          styL = +sty.left.replace(/\px/g, '');
          styT = +sty.top.replace(/\px/g, '');
        }

        document.onmousemove = function (e) {
          // 通过事件委托，计算移动的距离
          const l = e.clientX - disX;
          const t = e.clientY - disY;
          if (e.clientY > 0) {
            dragDom.style.top = `${t + styT}px`;
          }

          // 移动当前元素
          dragDom.style.left = `${l + styL}px`;


          // 将此时的位置传出去
          // binding.value({x:e.pageX,y:e.pageY})
        };

        document.onmouseup = function (e) {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    },
  },

  // 拷贝指令 点击拷贝标签内文字到剪切板
  // TODO 目前只做了table中使用时的样式
  clipboard: {
    bind(el, bingind, vnode) {
      const innerText = el.innerText;

      if (innerText !== '' && innerText !== DEFAULT_PLACEHOLDER) {
        vnode.context.$nextTick(() => {
          el.classList.add('v-clipboard');
          // 插入图标替换原节点
          el.innerHTML = `<span class="v-clipboard-target">${innerText}</span><span class="v-icon v-icon-font v-icon-copy-icon" title="点击复制"></span>`;

          const clip = new Clipboard(el);
          el.dataset.clipboardText = el.innerText;

          clip.on('success', e => {
            console.info('Text:', e.text);

            vnode.context.$message({
              type: 'success',
              message: '已复制到剪切板',
            });
          });
          clip.on('error', e => {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
          });
        });
      }
    },
    update(el, bingind, vnode) {
      console.info('Text:', e.text);
      el.dataset.clipboardText = el.innerText;
    },
  },
};
