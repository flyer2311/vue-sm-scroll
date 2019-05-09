# vue-sm-scroll
this is a plugin used in VUE and based on better-scroll
## keywords
![](https://img.shields.io/badge/betterScroll-lastest-brightgreen.svg)
![](https://img.shields.io/badge/vue-2.0+-brightgreen.svg)
![](https://img.shields.io/badge/mobile-support-brightgreen.svg) 
![](https://img.shields.io/badge/px2rem-lastest-brightgreen.svg)
![](https://img.shields.io/badge/async-support-brightgreen.svg) 

## Function
1. support native scroll
1. support pulldown and pullup
1. support async
1. support timeout and fail
1. support px2rem

## Environment
1. VUE(install CLI)
1. better-scroll 

## Basic direct
请看forexample的例子

## Inner construction
~~~javascript
<FLYER-scroll
:options='options'
@pullDownCB='pullDownCB'
@pullUpCB='pullUpCB'
@scrollHandle='scrollHandle'
:data='data'
ref='scroll'
:error='error'
>
  <template></template>
  <template slot='pullDown' slot-scope='parent'></template>
  <template slot='pullup' slot-scope='parent'></template>
</FLYER-scroll>
~~~
