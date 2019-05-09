<template>
  <div>
    <div class="wrap" ref='wrap'>
      <FLYER-scroll :options='options' @pullDownCB='pullDownCB' @pullUpCB='pullUpCB' :data='data' :error='error' ref='scroll'>
        <template>
          <ul class="scroll-ul">
            <li v-for="item in data" :key='item.id'>{{item.id}}</li>
          </ul>
        </template>
      </FLYER-scroll>
    </div>
  </div>
</template>

<script>
export default {
  name: 'test',
  data () {
    return {
      data: [{id: 1}, {id: 2}, {id: 3}],
      options: {
        pullDownRefresh: {
          threshold: 50,
          stop: 40,
          stopTime: 1000
        },
        pullUpLoad: {
          threshold: -50
        }
      },
      error: {}
    }
  },
  methods: {
    pullDownCB () {
      setTimeout(() => {
        this.data = [{id: 1}, {id: 2}, {id: 3}]
      }, 1000)
    },
    pullUpCB () {
      setTimeout(() => {
        this.data = [{id: 1}, {id: 2}, {id: 3}, {id: 4}]
      }, 1000)
    }
  },
  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrap{
  position: absolute;
  top: 50px;/*no*/
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: calc(100vh - 50px);/*no*/
}
.scroll-ul{
  font-size: 36px;/*px*/
}
</style>
