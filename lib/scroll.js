import scroll from './scroll.vue'
const scrollPlugin = {}
scrollPlugin.install = function (Vue, options) {
  Vue.component('FLYER-scroll', scroll)
}
if(typeof window !== 'undefined'&&window.Vue){
  window.Vue.use(scrollPlugin)
}
export default scrollPlugin
