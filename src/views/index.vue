<template>
  <div class="indexPage">
    <!-- 绘制视口 -->
    <div class="view">
      <canvas id="settingView"></canvas>
    </div>
    <!-- 按钮 -->
    <div class="options">
      <!-- <div class="btn" ><i class="el-icon-circle-plus-outline"></i></div> -->
      <div class="btn" v-if="optionBtnControl.color">
        <img src="../images/colorIcon.svg">
        <el-color-picker size="small" v-model="setColor" id="textColorSetting" @change="options('color')"></el-color-picker>
      </div>
      <div class="btn" v-if="optionBtnControl.remove" @click="options('remove')"><i class="el-icon-delete"></i></div>
    </div>
    <div class="saveBtn">
      <ul>
        <li @click="options('add')">
          <div class="icon"><i class="el-icon-s-grid"></i></div>
          <span>编辑</span>
        </li>
        <li @click="saveImage">
          <div class="icon"><i class="el-icon-check"></i></div>
          <span>完成</span>
        </li>
      </ul>
      <!-- <el-button type="primary" round >保存</el-button> -->
    </div>
    <van-popup
      v-model="addPopup.show"
      position="bottom"
      get-container="#app"
      overlay-class="addComponentPopup"
    >
      <div class="addPopupMain">
        <div class="tit">添加组件</div>
        <div class="body">
          <div class="type">
            <ul>
              <li :class="{active: addPopup.type==1}" @click="addPopup.type=1">文字</li>
              <li :class="{active: addPopup.type==2}" @click="addPopup.type=2">贴花</li>
            </ul>
          </div>
          <div class="content">
            <div class="textInput" v-if="addPopup.type==1">
              <div class="group">
                <div class="label">颜色</div>
                <div class="setInput">
                  <el-color-picker size="small" v-model="addPopup.textColor"></el-color-picker>
                </div>
              </div>
              <div class="group">
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="请输入内容"
                  v-model="addPopup.text">
                </el-input>
              </div>
            </div>
            <div class="imgList" v-if="addPopup.type==2">
              <div class="listView">
                <div class="list" :style="{width: images.length*6.5-0.5+'rem'}">
                  <div class="item" 
                    v-for="img in images" 
                    :key="img.id" 
                    :class="{active: img.id==addPopup.selImgId}"
                    @click="selAddImg(img)"
                    >
                    <div class="img"><img :src="img.thumb"></div>
                    <span>{{img.name}}</span>
                  </div>
                </div>
              </div>
              <div class="specs">
                <div class="group">
                  <div class="label">规格</div>
                  <div class="setInput">
                    <el-radio-group v-model="addPopup.imgSize" >
                      <el-radio label="1" :disabled="addPopup.imgSpecs.indexOf('1')==-1">大</el-radio>
                      <el-radio label="2" :disabled="addPopup.imgSpecs.indexOf('2')==-1">中</el-radio>
                      <el-radio label="3" :disabled="addPopup.imgSpecs.indexOf('3')==-1">小</el-radio>
                    </el-radio-group>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pupup-btns">
          <el-button round @click="submitAddComponent('false')">取消</el-button>
          <el-button type="primary" round @click="submitAddComponent('true')">添加</el-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script>
// Fabric.js
import { fabric } from 'fabric';
import { Notify } from 'vant';

export default {
  name: "indexPageModule",
  data: function(){
    return {
      // fabric句柄
      fabricHandle: null,
      // 添加组件数据
      components: [],
      // 激活组件
      activeComponent: null,
      // 组件配置信息
      viewW: 0,
      viewH: 0,
      // 配置视口区域
      configView: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        textZIdx: 100
      },
      // 设置颜色
      setColor: '',
      // 浮动按钮控制
      optionBtnControl: {
        color: false,
        remove: false,
      },

      // 贴花
      images: [],


      // 添加弹窗控制
      addPopup: {
        show: false,
        // 类型  1 文字  2 贴花
        type: 1,
        // 文字
        text: "",
        textColor: "#333333",
        // 选中图片
        selImgId: "",
        // 贴花可选尺寸
        imgSpecs: [] ,
        // 选取尺寸
        imgSize: "",
      }

    }
  },
  component: {
    [Notify.Component.name]: Notify.Component,
  },
  methods: {
    // 获取贴花列表
    getImgList: function(){
      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
      });

      this.$axios.post("art/getPaintList").then(res => {
        this.$toast.clear();
        if(res.data.result == 0){
          var data = res.data.reData.map(one => {
            return {
              ...one
            }
          });
          this.images = data;
        }else{

        }
      }).catch(err => {
        this.$toast.clear();
      });
    },
    // 获取单一贴花base64
    getImgBase64: function({url, type}){
      var that = this;
      return new Promise(function(resolve, reject){
        if(type == 1){
          window.Axios.get(that.$serverConfig.serverHost +url).then(res => {
            var img = new Image();
            img.src = res.data;
            // 设置跨域
            img.crossOrigin = 'anonymous';
            img.onload=function(e){
              resolve({
                base64: res.data,
                width: e.target.width,
                height: e.target.height
              });
            }
          }).catch(err => {
            reject(err)
          });
        }else{
          var img = new Image();
          img.src = url;
          img.onload=function(e){
            img.width = e.target.width;
            img.height = e.target.height;
            var imgBase64 = that.image2Base64(img);
            resolve({
              base64: imgBase64,
              width: e.target.width,
              height: e.target.height
            });
          }
        }
      });
    },
    // 插件初始化
    initFabric: function(){
      var viewWidth,viewHeight;
      viewWidth = this.$el.querySelector(".view").clientWidth;
      viewHeight = this.$el.querySelector(".view").clientHeight;

      this.$el.querySelector("#settingView").width = viewWidth;
      this.$el.querySelector("#settingView").height = viewHeight;

      this.viewW = viewWidth;
      this.viewH = viewHeight;

      // 初始化
      this.fabricHandle =new fabric.Canvas('settingView');

      var rectW = viewWidth*0.8|0;
      var rectL = (viewWidth - rectW) / 2|0;
      var rectT = (viewHeight - rectW) / 2|0;
      
      this.configView.x = rectL;
      this.configView.y = rectT;
      this.configView.w = rectW;
      this.configView.h = rectW;

      this.addComponent({
        type: 'rect', 
        top: rectT-10, 
        left: rectL, 
        width: rectW, 
        height: rectW, 
      });
    },
    // 获取图片base64
    // getImgBase64: function(url){
    //   var that = this;
    //   var base64="";
    //   return new Promise(function(resolve){
    //     var img = new Image();
    //     img.src = url;
    //     img.onload=function(e){
    //       base64 = that.image2Base64(img);
    //       resolve({
    //         base64: base64,
    //         width: e.target.width,
    //         height: e.target.height
    //       });
    //     }
    //   });
    // },
    // 图片转base64
    image2Base64: function(img) {  
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      var dataURL = canvas.toDataURL("image/png");
      return dataURL;
    },
   
    // 添加组件
    addComponent: function({type: type, top: top, left: left, width:width, height:height, content: content, imgData: imgData}){
      // 添加项
      var addComponent = null;
      switch(type){
        case 'rect':
          addComponent = new fabric.Rect({
            id: this.rndId(),
            componentType: type,
            top: top,
            left: left,
            width: width,
            height: height,
            fill: "rgba(255,255,255,1)",
            stroke: "red",
            strokeWidth: 5,
            // // 锁定缩放
            // lockScalingX: true,
            // lockScalingY: true,
            // // 锁定移动
            // lockMovementX: true,
            // lockMovementY: true,
            selectable: false,
          });
          break;
        case 'text':
          // 文本
          addComponent = new fabric.Textbox(content.text, {
            id: this.rndId(),
            componentType: type,
            top: top,
            left: left,
            fill: content.color,
            zIndex: this.configView.textZIdx,
          });
          break;
        case 'image':
          // 图片
          var imgElement = new Image();
          imgElement.src = content.base64;
          imgElement.style.width = width;
          imgElement.style.height = height;

          addComponent = new fabric.Image(imgElement, {  //设置图片位置和样子
            id: this.rndId(),
            componentType: type,
            top: top,
            left: left,
            width: width,
            height: height,
            // 图像XY轴方向缩放比例  连框带内容一起放大
            scaleX: content.scale,
            scaleY: content.scale,
            // 锁定缩放
            lockScalingX: true,
            lockScalingY: true,
            // 设置元素不能操作
            // selectable: false,
          });
          break;
      }

      if(addComponent){
        // 绑定添加组件选中/取消选中事件
        var that = this;
        addComponent.on("selected", (function(data){
          return function(e){
            // console.log("selected",e,data);
            // 除红框外，其他可删除  文本可设置颜色
            var componentType = data.componentType;
            if(componentType != 'rect'){
              that.optionBtnControl.remove = true;
              if(componentType == 'text'){
                that.optionBtnControl.color = true;
                that.setColor = data.fill;
              }else{
                that.optionBtnControl.color = false;
                that.setColor = "";
              }
            }else{
              that.optionBtnControl.remove = false;
              that.optionBtnControl.color = false;
              that.setColor = "";
            }
  
            that.activeComponent = data;
          }
        })(addComponent));
        addComponent.on("deselected", function(){
          // console.log("deselected")
          that.activeComponent = null;
          that.setColor = "";
          that.optionBtnControl.color = false;
          that.optionBtnControl.remove = false;
        });
        // 添加到画布上
        this.fabricHandle.add(addComponent);

        // 如果是贴花  获取当前添加的所有组件  文字总在贴花上面
        if(type == 'image'){
          addComponent.imgData = JSON.parse(JSON.stringify(imgData));
          var allComponents = this.fabricHandle.getObjects();
          for(var i = allComponents.length-1;i>0;i--){
            var one = allComponents[i];
            // 如果发现在文字  将添的的贴花降一层
            if(one.componentType=='text'){
              this.fabricHandle.sendBackwards(addComponent);
            }
          }
        }

        // 压放已添加组件数组内
        this.components.push(addComponent);
      }

    },
    // 生成随机ID
    rndId: function(){
      return this.$md5(new Date().getTime()+""+(Math.random()*100000|0))
    }, 

    //  工具栏  type: add 添加  config 配置   remove 删除
    options: function(type){
      switch(type){
        case 'add':
          this.addPopup.type = 1;
          this.addPopup.text = "";
          this.addPopup.textColor = "#333333";
          this.addPopup.selImgId = "";
          this.addPopup.show = true;
          break;
        case 'color':
          // 获取选中组件
          var component = this.fabricHandle.getActiveObject();
          component.set("fill", this.setColor);
          this.fabricHandle.renderAll();
          break;
        case 'remove':
          // 获取激活组件
          var component = this.fabricHandle.getActiveObject();
          // 删除组件
          this.fabricHandle.remove(component);
          break;
      }
    },
    // 底部保存
    saveImage: function(){
      // 取消激活组件状态
      this.fabricHandle.discardActiveObject(); 
      this.fabricHandle.renderAll(); 
      // 去边框颜色
      this.components[0].set("stroke", 'rgba(0,0,0,0)');
      this.components[0].set("fill", 'rgba(255,255,255,0)');
      // 生成图片base64
      var dataURL = this.fabricHandle.toDataURL({
        format: 'png', // jpeg或png
        // quality: 0.8 // 图片质量，仅jpeg时可用
        // 截取指定位置和大小
        left: this.configView.x, 
        top: this.configView.y-10,
        width: this.configView.w+5,
        height: this.configView.h+5
      });
      // 恢复边框颜色
      this.components[0].set("stroke", 'red');
      this.components[0].set("fill", 'rgba(255,255,255,0)');
      console.log(dataURL)

      // 贴花返回数据
      var imgData = {}, isAddText = false, jsonDate = [];
      this.components.forEach(one => {
        switch(one.componentType){
          case 'image':
            if(imgData[one.imgData.id]){
              imgData[one.imgData.id] = imgData[one.imgData.id]+1;
            }else{
              imgData[one.imgData.id] = 1;
            }
            break;
          case "text":
            isAddText = true;
            break;
        }
      });
      // 遍历数据  重组json
      for(var key in imgData){
        jsonDate.push({
          id: key,
          num: imgData[key]
        });
      }

      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
      });
      // 上传文件
      this.$axios.post('uploadBase64Img', {
        image: dataURL
      }).then(res => {
        if(res.data.result==0){
          var newImgUrl = res.data.reData.image;
          // 保存数据
          this.$axios.post('art/saveUserApplique',{
            image: newImgUrl,
            applique: JSON.stringify(jsonDate),
            isAddText: isAddText,
          }).then(saveRes => {
            if(saveRes.data.result==0){
              Notify({ type: 'success', message: '保存成功' });
              if(uni){
                uni.navigateBack();
              }
            }else{
              Notify({ type: 'danger', message: saveRes.data.message });
            }
          }).catch(err => {
            this.$toast.clear();
            Notify({ type: 'danger', message: '服务器异常' });
          });
        }else{
          this.$toast.clear();
          Notify({ type: 'danger', message: res.data.message });
        }
      }).catch(err => {
        this.$toast.clear();
        Notify({ type: 'danger', message: '服务器异常' });
      });      
    },

    // 选中添加贴花
    selAddImg: function(img){
      if(this.addPopup.selImgId != img.id){
        this.addPopup.selImgId = img.id;
        this.addPopup.imgSpecs = img.size.map(one => {
          return ''+one;
        });
        this.addPopup.imgSize = "";
      }
    },
    // 添加组件弹窗回调方法
    submitAddComponent: function(state){
      if(state){
        // console.log(this.addPopup);
        var rectW = this.configView.w;
        var left =  this.configView.x+5;
        var top = this.configView.y-5;
        if(this.addPopup.type == 1){
          // 文字   
          this.addComponent({
            type: 'text', 
            top: top, 
            left: left, 
            content: {
              text: this.addPopup.text,
              color: this.addPopup.textColor||'rgba(0,0,0,0)'
            }
          });
        }else{
          
          /**
           * model  贴花形状类型  1  正方形  2  长方形横向  3  长方形纵向
           * size   1 大号 100%  2 中号 70%    3 小号 30%
           * */ 

          // 贴花
          var imgUrl = "";
          var type = 1; // 1 base64  2 地址 
          var imgRes = this.$common.searchArr(this.images, "id", this.addPopup.selImgId);

          // 视口宽度  贴花类型
          var viewWidth = rectW -5, imgType = imgRes.result?imgRes.data.model:1;

          // 检证
          if(!this.addPopup.imgSize){
            Notify({ type: 'danger', message: '请选取贴花规格' });
            return;
          }
          // 判定贴花比例视口
          switch(true){
            case this.addPopup.imgSize==1: 
              viewWidth = 1*viewWidth;
              break;
            case this.addPopup.imgSize==2: 
              viewWidth = 0.7*viewWidth;
              break;
            case this.addPopup.imgSize==3: 
              viewWidth = 0.3*viewWidth;
              break;
          }
          
          if(imgRes.data.base_url){
            imgUrl = imgRes.data.base_url.replace('/public',"");
            type = 1;
          }else{
            // 没有base64 无法添加
            Notify({ type: 'danger', message: '该贴花无法添加' });
            return;
          }
          if(imgUrl){
            this.$toast.loading({
              message: '加载中...',
              forbidClick: true,
            });

            this.getImgBase64({
              url: imgUrl,
              type: type,
            }).then(res => {
              // 组件缩放比例
              var scale;  
              // 判定绽放
              switch(true){
                case imgType==1: 
                  // 正方形
                  scale = viewWidth/res.width;
                  break;
                case imgType==2: 
                  // 长方形横向
                  scale = viewWidth/res.width;
                  break;
                case imgType==3:
                  // 长方形纵向 
                  scale = viewWidth/res.height;
                  break;
              }
              
              this.$toast.clear();
              this.addComponent({
                type: "image",
                top: top,
                left: left,
                width: res.width,
                height: res.height,
                content: {
                  base64: res.base64,
                  scale: scale
                },
                imgData: imgRes.data
              });
            });
          }
        }
      }
      this.addPopup.show = false
    }
  },
  mounted: function() {
    // console.log(this.$serverConfig)   //ecc4bd06b2138c12   241cc5b3a38c94b2
    sessionStorage['user_sessionId'] = this.$route.query.sessionId;
    // 初始化插件
    this.initFabric();

    // 获取贴花图片列表
    this.getImgList();

  },
}
</script>
<style lang="less">
  @activeColor: #409EFF;
  
  .indexPage{
    width: 100%;
    height: 100%;
    position: relative;
    background-color: red;
    >.view{
      width: 100%;
      height: calc(100% - 3rem);
    }
    >.options{
      position: absolute;
      top: 0.3rem;
      right: 0.3rem;
      >.btn{
        width: 2rem;
        height: 2rem;
        line-height: 1.9rem;
        font-size: 1.5rem;
        color: #aaa;
        text-align: center;
        border-radius: 50%;
        overflow: hidden;
        position: relative;
        &:not(:last-child){
          margin-bottom: .5rem;
        }
        >img{
          width: 23px;
          height: 23px;
        }
        >.el-color-picker{
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
        }
      }
    }
    >.saveBtn{
      border-top: 0.02rem solid  #aaa;
      background-color: #fff;
      height: 3rem;
      >ul{
        height: 100%;
        color: #333;
        >li{
          float: left;
          width: 50%;
          height: 100%;
          // height: 2.5rem;
          padding: 0.4rem 0.2rem;
          &:first-child{
            border-right: 0.02rem solid  #aaa;
          }
          >.icon{
            height: 1.2rem;
            line-height: 1.2rem;
            font-size: 1rem;
            text-align: center;
          }
          >span{
            display: block;
            height: .8rem;
            line-height: .8rem;
            font-size: 0.2rem;
            text-align: center;
          }
        }
      }
      // height: 2.5rem;
      // line-height: 2.5rem;
      // >.el-button{
      //   display: block;
      //   width: 100%;
      // }
    }
  }

  // 添加弹窗
  .addPopupMain{
    >.tit{
      padding: 0 .5rem;
      height: 2rem;
      line-height: 2rem;
      font-size: 0.9rem;
      font-weight: bold;
      color: #333;
    }
    >.body{
      padding: 0 .5rem;
      >.type{
        >ul{
          overflow: hidden;
          >li{
            margin-right: 0.5rem;
            padding: 0 1.5rem;
            float: left;
            height: 1.5rem;
            line-height: 1.4rem;
            font-size: 0.8rem;
            color: #333;
            border: 0.05rem solid #aaa;
            border-radius:  1.5rem;
            &.active{
              color: @activeColor;
              border-color: @activeColor;
            }
          }
        }
      }
      >.content{
        padding: .5rem 0;
        max-height: 40vh;
        overflow-y: auto;
        >.textInput{
          >.group{
            >.label{
              float: left;
              width: 80px;
              height: 40px;
              line-height: 40px;
              font-size: 14px;
              color: #333;
              text-align: center;
            }
            >.setInput{
              margin-left: 80px;
              height: 40px;
              >.el-color-picker{
                float: left;
                line-height: 32px;
              }
            }
          }
        }

        >.imgList{
          >.listView{
            padding-bottom: 0.5rem;
            width: 100%;
            overflow: auto;
            >.list{
              >.item{
                float: left;
                width: 6rem;
                padding: 0.2rem .5rem;
                border: 0.02rem solid transparent;
                border-radius: 0.25rem;
                >.img{
                  height: 5rem;
                  display: flex;
                  flex-direction: row;
                  justify-content: center;
                  align-items: center;
                  >img{
                    max-width: 100%;
                    max-height: 100%;
                  }
                }
                >span{
                  margin-top: 0.2rem;
                  display: block;
                  height: 1rem;
                  line-height: 1rem;
                  font-size: 0.6rem;
                  color: #666;
                  text-align: center;
                }
                &:not(:last-child){
                  margin-right: 0.5rem;
                }
                &.active{
                  border-color: @activeColor;
                  >span{
                    color: @activeColor;
                  }
                }
              }
            }
          }

          >.specs{
            padding-top: 0.5rem;
            border-top: 0.02rem solid #ccc;
            >.group{
              padding: 0 0.3rem;
              >.label{
                float: left;
                width: 3rem;
                height: 2rem;
                line-height: 2rem;
                font-size: 0.34rem;
                color: #333;
                text-align: center;
              }
              >.setInput{
                margin-left: 3.2rem;
                height: 2rem;
                line-height: 2rem;
                .el-radio-group{
                  display: block;
                  height: 2rem;
                  line-height: 2rem;
                  padding: 0.4rem 0;
                }
              }
            }
          }
        }
      }
    }
    >.pupup-btns{
      padding: .3rem 0.8rem;
      text-align: right;
      overflow: hidden;
      .el-button{
        margin-left: 0.5rem;
        float: right;
        padding: 0.3rem 1rem;
        // height: 1.8rem;
      }
    }
  }

  .el-color-dropdown{
    z-index: 99999!important;
  }

  // 添加类型弹出遮罩层
  .van-overlay.addComponentPopup{
    background-color: rgba(0,0,0,0.3);
  }
</style>