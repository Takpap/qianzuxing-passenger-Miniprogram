//index.js
//获取应用实例
const app = getApp()
//声明一个全局上下文
var ctx
// 定时器
var updateMarks
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
// 实例化API核心类
const qqMapWX = new QQMapWX({
  key: 'ZOKBZ-UTIH3-IDI36-3LEBF-GQZ5Z-D5BYI'
})

Page({
  data: {
    clicked: true,
    open: true,
    startPlace: "确认地图上您的上车点",
    destinationPlace: {
      'title': '输入您的目的地'
    },
    drillText: "在这里上车",
    longitude: 107.454958,
    latitude: 26.884335,
    showDriver:false,
    markers: [{
        iconPath: "/images/dot.png",
        id: 0,
        latitude: '',
        longitude: '',
        rotate: 0,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      },
      {
        iconPath: "/images/destination.png",
        id: 1,
        latitude: '',
        longitude: '',
        rotate: 0,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      },
      {
        iconPath: "/images/carer.png",
        id: 2,
        latitude: 26.884431,
        longitude: 107.454899,
        rotate: 0,
        anchor: {
          x: 0.5,
          y: 0.5
        },
      }
    ]
  },

  onLoad: function () {
    console.log('onload')
    ctx = this
    // updateMarks = setInterval(this.getBaidulocations(), 10000)
  },
  onShow: function () {
    //console.log(Object.keys(this.data.destinationPlace).length)
    if (Object.keys(this.data.destinationPlace).length != 1) {
      ctx.setData({
        ['markers[1].latitude']: ctx.data.destinationPlace.lat,
        ['markers[1].longitude']: ctx.data.destinationPlace.lon,
      })
      ctx.getPolyline()
    } else {
      ctx.getLocation1()
    }
  },
  onHide: function(){
    clearInterval(updateMarks)
  },
  onUnload: function(){
      console.log("小程序已经关闭")
  },
  //获取当前位置
  getLocation1: function () {
    wx.getLocation({
      isHighAccuracy: true,
      type: 'gcj02',
      success: (res) => {
        console.log(res)
        ctx.getAddress(res.latitude, res.longitude)
        ctx.setData({
          drillText: "在这里上车",
          longitude: res.longitude,
          latitude: res.latitude,
          ['markers[0].latitude']: res.latitude,
          ['markers[0].longitude']: res.longitude,
        })
      },
      fail: res => {
        console.log(res)
        if (res.errCode == 2 || res.accuracy > 100) {
          wx.showToast({
            icon: 'none',
            title: '请先开启手机GPS',
            duration: 4000
          })
          ctx.setData({
            drillText: "位置信息异常"
          })
        }
      }
    })
  },
  //点击切换到当前位置
  tapLocation: function () {
    console.log('location')
    ctx.mapCtx = wx.createMapContext("youngmap");
    var latitude = ctx.data.latitude,longitude = ctx.data.longitude
    ctx.mapCtx.moveToLocation({
      latitude: latitude,
      longitude: longitude,
    })
    ctx.setData({
      ['markers[0].latitude']: latitude,
      ['markers[0].longitude']: longitude,
    })
    ctx.getAddress(latitude, longitude)
  },
  //点击切换到目的地选择页
  inputFocus: function () {
    wx.navigateTo({
      url: 'select-destination?latitude='+this.data.markers[0].latitude+'&longitude='+this.data.markers[0].longitude+'&title='+this.data.startPlace,
    })
  },
  //点击菜单切换
  _tapMenu: function () {
    this.setData({
      open: !this.data.open
    })
  },
  //点击标题切换
  titleClickNow: function () {
    ctx.setData({
      clicked: true
    })
  },
  titleClickApporint: function () {
    ctx.setData({
      clicked: false
    })
  },
  //地图视野改变
  regionchange: function (e) {
    if(e.type=='begin' && e.causedBy == 'gesture'){
      ctx.setData({
        startPlace: '选择出发地......',
        drillText: '松手确认出发地'
      })
    }
    if (e.type == 'end' && (e.causedBy == 'drag'|| e.causedBy == 'update')) {
      ctx.mapCtx = wx.createMapContext("youngmap");
      ctx.mapCtx.getCenterLocation({
        success: function (res) {
          ctx.setData({
            ['markers[0].latitude']: res.latitude,
            ['markers[0].longitude']: res.longitude,
            drillText: "在这里上车"
          })
          ctx.getAddress(res.latitude, res.longitude)
        }
      })
    }
  },

  //获取服务器上的百度坐标
  getBaidulocations: function () {
    wx.request({
      url: app.globalData.baseUrl + 'getlocations?userId=c8fb97c78c49e294cc683b2fd1f30149',
      success: (res) => {
        ctx.reverseLocation(res.data.latitude, res.data.longitude, res.data.direction)
      },
      fail: (e) => {
        console.log(e)
      }
    })
    return ctx.getBaidulocations
  },
  //百度经纬度转换腾讯经纬度
  reverseLocation: function (baiduLatitude, baiduLongitude, direction) {
    // 调用接口
    qqMapWX.reverseGeocoder({
      location: {
        latitude: baiduLatitude,
        longitude: baiduLongitude
      },
      coord_type: 3, //baidu经纬度
      success: (res) => {
        var latitude = res.result.location.lat
        var longitude = res.result.location.lng;
        console.log(typeof (direction) + "\t" + typeof (longitude) + "\t" + latitude)
        ctx.setData({
          ['markers[2].latitude']: latitude,
          ['markers[2].longitude']: longitude,
          ['markers[2].rotate']: parseFloat(direction),
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },
  //根据经纬度获取地址描述信息
  getAddress(latitude, longitude) {
    // reverseGeocoder 为 QQMapWX 解析 经纬度的方法
    qqMapWX.reverseGeocoder({
      location: {
        latitude,
        longitude
      },
      success: (res) => {
        this.setData({
          startPlace: res.result.formatted_addresses.rough
        })
      }
    })
  },
  //根据起点和终点获取线路规划
  getPolyline() {
    var start = {},
    dest = {}
    start.latitude = ctx.data.markers[0].latitude
    start.longitude = ctx.data.markers[0].longitude
    dest.latitude = ctx.data.markers[1].latitude
    dest.longitude = ctx.data.markers[1].longitude
    //调用距离计算接口
    qqMapWX.direction({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from: start,
      to: dest,
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        ctx.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 4
          }]
        })
      },
      fail: function (error) {
        console.error(error);
      }
    });
  }
})