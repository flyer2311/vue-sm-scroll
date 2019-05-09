<template>
<div class="wrapper" ref="wrapper">
  <div class="bscroll-container" style="position:relative;">
    <!-- 刷新提示信息 -->
    <div class="top-tip" v-show="showTopTip">
      <slot name='pullDown' :pullDownState='pullDownState'>
        <span v-show="pullDownState.before">{{pullDownTxt}}</span>
        <span v-show='pullDownState.now'>{{pullDownLoading}}</span>
        <span v-show="pullDownState.after">{{pullDownSuccess}}</span>
        <span v-show='pullDownState.fail'>{{pullDownFail}}</span>
        <span v-show='pullDownState.timeout'>{{pullDownTimeout}}</span>
      </slot>
    </div>
    <!-- 内容列表 -->
    <div ref='listWrapper'>
      <slot>
        <ul>
          <li>slot默认的listValue</li>
        </ul>
      </slot>
    </div>
    <!--加载提示信息-->
    <div class="bottom-tip" v-show="showBottomTip">
      <slot name='pullUp' :pullUpState='pullUpState'>
        <span v-show='pullUpState.before'>{{pullUpTxt}}</span>
        <span v-show='pullUpState.now'>{{pullUpLoading}}</span>
        <span v-show='pullUpState.fail'>{{pullUpFail}}</span>
        <span v-show='pullUpState.timeout'>{{pullUpTimeout}}</span>
      </slot>
    </div>
  </div>
</div>
</template>

<script>
import BScroll from 'better-scroll'
//默认值区域
const DEFAULT_STOPTIME = 600 //刷新成功停留时间
const MORE = '上拉加载' //加载  有更多数据
const NOMORE = '已无更多数据'//加载  无更多数据
const LOADINGUP = '正在加载'
const FAILUP = '请求失败,请重试'
const TIMEOUTUP = '请求超时,请重试'

const REFRESHSTART = '下拉刷新'
const REFRESH = '松开刷新'
const REFRESHSUCCESS = '刷新成功'
const LOADINGDOWN = '正在刷新'
const FAILDOWN = '请求失败,请重试'
const TIMEOUTDOWN = '请求超时,请重试'

export default {
  name: 'scroll',
  data (){
    return {
      showTopTip: false,//显示下拉刷新
      showBottomTip: false,//显示上拉加载
      pullDownState: {
        before: true,//刷新中
        now: false,//刷新中
        after: false,//刷新后
        fail: false,//刷新失败
        timeout: false//刷新超时
      },
      pullUpState: {
        before: true, //加载前
        now: false, //加载中
        fail: false, //加载失败
        timeout: false //加载超时
      },
      isPullDown: false,//正在下拉
      isPullUp: false,//正在上拉
      dirty: true, //处理上拉无更多数据
      refreshDirty: true,//下拉处理
      openPullUp: false,//关闭后开启上拉
      isINERROR: false//是否进入了错误状态
    }
  },
  props: {
    options: {
      type: Object
    },
    data: {
      type: Array,
      default () {
        return []
      }
    },
    //刷新延迟时间
    refreshDelay: {
      type: Number,
      default: 20
    },
    //错误
    error: {}
  },
  methods: {
    //正在刷新
    pullDown () {
      this.isPullDown = true
      this._nowPullDown()
      //开启上拉加载功能
      this.openPullUp = false //还原开关
      //dirty 改变
      this.dirty = true
      this.$emit('pullDownCB')
    },
    //正在加载
    pullUp () {
      if(!this.openPullUp){
        this.isPullUp = true
        this._nowPullUp()
        this.$emit('pullUpCB')
      }else{
        //重置上拉
        this.scroll.finishPullUp()
      }
    },
    //滚动事件
    scrollHandle (e) {
      //默认子模式下拉判断
      this.pullDownDistance(e.y)
      //分发事件
      this.$emit('scrollHandle',e)
    },
    //停止滑动
    scrollEnd () {
      if(!this.pullDownState.now){
        this._beforePullDown()
        this._onScrollHandle()
      }
    },
    //停止触摸
    touchEnd () {
      this._offScrollHandle()
    },
    //获取数据
    forceUpdate (dirty=false) {
      //下拉刷新处理
      if(this.isPullDown){
        this.isPullDown = false
        if(this.isINERROR){
          //判断error
          if(!!this.error&&JSON.stringify(this.error)!=='{}'){
            //请求错误
            if (this.error.code === 'ECONNABORTED' && this.error.message.indexOf('timeout') !== -1) {
              this._timeoutPullDown()
            }else{
              this._failPullDown()
            }
          }else{
            this._afterPullDown()
          }
        }else{
          //没有进入错误状态
          this._afterPullDown()
        }
        //延时显示下拉标签结果内容
        setTimeout(()=>{
          this.scroll.finishPullDown()
          this.scroll.refresh()
        },this.options.pullDownRefresh.stopTime||DEFAULT_STOPTIME)
      }
      //上拉加载处理
      if(this.isPullUp){
        this.scroll.refresh()
        this.dirty = dirty
        this.isPullUp = false
        //判断请求
        if(!!this.error&&JSON.stringify(this.error)!=='{}'){
          //请求错误
          if(this.error.code === 'ECONNABORTED'&&this.error.message.indexOf('timeout')!== -1){
            this._timeoutPullUp()
          }else{
            this._failPullUp()
          }
        }else{
          this._beforePullUp()
        }
        this.scroll.finishPullUp()
        //没有数据时关闭上拉加载
        this.openPullUp = !dirty 
      }
      
    },
    //下拉距离判断
    pullDownDistance (distance) {
      if(distance > 0){
        this.refreshDirty = true
        if(distance > 50){
          this.refreshDirty = false
        }
      }
    },
    //刷新状态管理
    _beforePullDown () {
      this._handlePullDown('before')
    },
    _nowPullDown () {
      this._handlePullDown('now')
    },
    _afterPullDown () {
      this._handlePullDown('after')
    },
    _failPullDown () {
      this._handlePullDown('fail')
    },
    _timeoutPullDown () {
      this._handlePullDown('timeout')
    },
    _handlePullDown (param) {
      this.pullDownState.before = false
      this.pullDownState.now = false
      this.pullDownState.after = false
      this.pullDownState.fail = false
      this.pullDownState.timeout = false
      this.pullDownState[param] = true
    },
    //加载状态管理
    _beforePullUp () {
      this._handlePullUp('before')
    },
    _nowPullUp () {
      this._handlePullUp('now')
    },
    _failPullUp () {
      this._handlePullUp('fail')
    },
    _timeoutPullUp () {
      this._handlePullUp('timeout')
    },
    _handlePullUp (param) {
      this.pullUpState.before = false
      this.pullUpState.now = false
      this.pullUpState.fail = false
      this.pullUpState.timeout = false
      this.pullUpState[param] = true
    },
    //开启下拉刷新
    _onPullDownRefresh () {
      this.scroll.on('pullingDown',this.pullDown)
    },
    //开启上拉加载
    _onPullUpLoad () {
      this.scroll.on('pullingUp',this.pullUp)
    },
    //开启滚动
    _onScrollHandle () {
      this.scroll.on('scroll',this.scrollHandle)
    },
    //关闭滚动
    _offScrollHandle () {
      this.scroll.off('scroll',this.scrollHandle)
    },
    //开启触摸结束
    _onTouchEnd () {
      this.scroll.on('touchEnd',this.touchEnd)
    },
    //开启滚动结束
    _onScrollEnd () {
      this.scroll.on('scrollEnd',this.scrollEnd)
    },
    //内部计算最低高度
    _calculate () {
      this.$refs.listWrapper.style.minHeight = this.$refs.wrapper.offsetHeight+'px'
    }
  },
  mounted () {
    let options = {}
    //获取外部的配置
    options.pullDownRefresh = this.options&&this.options.hasOwnProperty('pullDownRefresh')&&this.options.pullDownRefresh
    options.pullUpLoad = this.options&&this.options.hasOwnProperty('pullUpLoad')&&this.options.pullUpLoad
    this.showTopTip = !!options.pullDownRefresh
    this.showBottomTip = !!options.pullUpLoad
    
    this.scroll = new BScroll(this.$refs.wrapper,options)
    //设置列表显示的最低高度
    this._calculate()
    //初始化事件
    this._onPullDownRefresh()
    this._onPullUpLoad()
    this._onScrollHandle()
    this._onScrollEnd()
    this._onTouchEnd()
    
  },
  watch: {
    data () {
      this.isINERROR = false
      setTimeout(()=>{
        this.forceUpdate(true)
      },this.refreshDelay)
    },
    error () {
      this.isINERROR = true
      setTimeout(()=>{
        this.forceUpdate(true)
      },this.refreshDelay)
    }
  },
  computed: {
    pullUpLoad () {
      return this.options&&this.options.pullUpLoad
    },
    //上拉和到底
    pullUpTxt () {
      let pullUpLoad = this.pullUpLoad
      let txt = pullUpLoad&&pullUpLoad.txt
      let More = txt&&txt.more||MORE
      let Nomore = txt&&txt.noMore||NOMORE
      return this.dirty?More:Nomore
    },
    //正在加载
    pullUpLoading () {
      let pullUpLoad = this.pullUpLoad
      let txt = pullUpLoad&&pullUpLoad.txt
      return txt&&txt.loading||LOADINGUP
    },
    //请求失败
    pullUpFail () {
      let pullUpLoad = this.pullUpLoad
      let txt = pullUpLoad&&pullUpLoad.txt
      return txt&&txt.fail||FAILUP
    },
    //请求超时
    pullUpTimeout () {
      let pullUpLoad = this.pullUpLoad
      let txt = pullUpLoad&&pullUpLoad.txt
      return txt&&txt.timeout||TIMEOUTUP
    },
    //下拉
    pullDownRefresh () {
      return this.options&&this.options.pullDownRefresh
    },
    pullDownTxt () {
      let pullDownRefresh = this.pullDownRefresh
      let txt = pullDownRefresh&&pullDownRefresh.txt
      let start = txt&&txt.start||REFRESHSTART
      let end = txt&&txt.end||REFRESH
      return this.refreshDirty?start:end
    },
    pullDownLoading () {
      let pullDownRefresh = this.pullDownRefresh
      let txt = pullDownRefresh&&pullDownRefresh.txt
      return txt&&txt.loading||LOADINGDOWN
    },
    pullDownSuccess () {
      let pullDownRefresh = this.pullDownRefresh
      let txt = pullDownRefresh&&pullDownRefresh.txt
      return txt&&txt.success||REFRESHSUCCESS
    },
    pullDownFail () {
      let pullDownRefresh = this.pullDownRefresh
      let txt = pullDownRefresh&&pullDownRefresh.txt
      return txt&&txt.fail||FAILDOWN
    },
    pullDownTimeout () {
      let pullDownRefresh = this.pullDownRefresh
      let txt = pullDownRefresh&&pullDownRefresh.txt
      return txt&&txt.timeout||TIMEOUTDOWN
    }
  }
}
</script>

<style scoped>
.wrapper{
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
ul{
  padding: 0;
  margin: 0;
}
li{
  list-style: none;
}
.top-tip{
  position: absolute;
  top: -50px;/*no*/
  width: 100%;
  height: 50px;/*no*/
  line-height: 50px;/*no*/
  text-align: center;
  color: #027be3;
  font-size: 32px;/*px*/
}
.bottom-tip{
  width: 100%;
  height: 50px;/*no*/
  line-height: 50px;/*no*/
  text-align: center;
  color: #000;
  font-size: 32px;/*px*/
}
.rotate-180{
  -webkit-transform: rotate(180deg);
  transform: rotate(180deg);
}
.transition{
  transition: .5s;
}
</style>
