// pages/testpage/testpage.js
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
const qqMapWX = new QQMapWX({
  key: 'ZOKBZ-UTIH3-IDI36-3LEBF-GQZ5Z-D5BYI'
})
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusHeight: 0,
    array: [
      '黔南布依族苗族自治州',
      '六盘水市',
      '遵义市',
      '安顺市',
      '毕节市',
      '铜仁市',
      '黔西南布依族苗族自治州',
      '黔东南苗族侗族自治州',
      '贵阳市'
    ],
    starting:{},
    index: 0,
    suggestion: []
  },
  //获取选择的目的地
  placeTap: function (e) {
    var data = e.currentTarget.dataset
    var destination = {
        lat: data.latitude,
        lon: data.longitude,
        title: data.title
    }
    var url = '../determine/determine?startLat=' + this.data.starting.lat + '&startLon=' + this.data.starting.lon + '&startTitle=' + this.data.starting.title + '&destLat=' + data.lat + '&destLon=' + data.lon + '&destTitle=' + data.title
    wx.navigateTo({
      url: url,
    })
    // var pages = getCurrentPages();
    // var prevPage = pages[0]; //上一个页面
    // prevPage.setData({
    //   destinationPlace: location,
    //   showDriver: true,
    // })
    // wx.navigateBack({
    //   url: 'index',
    // })
  },
  //返回主页面
  backIndex: function () {
    wx.navigateBack({
      url: 'index',
    })
  },
  //选择乘车城市
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  //触发关键词输入提示事件
  getsuggest: function (e) {
    var _this = this;
    qqMapWX.getSuggestion({
      //获取输入框值并设置keyword参数
      keyword: e.detail.value, //用户输入的关键词，可设置固定值,如
      region: this.data.array[this.data.index], //设置城市名，限制关键词所示的地域范围，非必填参数
      region_fix: 1,
      location: '26.884335,107.454958',
      // get_subpois:1,
      address_format: 'short',
      success: function (res) { //搜索成功后的回调
        var sug = [];
        for (var i = 0; i < res.data.length; i++) {
          sug.push({ // 获取返回结果，放到sug数组中
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            city: res.data[i].city,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng
          });
        }
        _this.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
          suggestion: sug
        });
      },
      fail: function (error) {
        console.error(error);
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      statusHeight: app.globalData.statusBarHeight,
      starting: {
        lat: options.latitude,
        lon: options.longitude,
        title: options.title
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})