'use strict'
const config = require('../config')
const Wechat = require('../wechat/wechat')
const path = require('path')
const wechatApi = new Wechat(config.wechat)
const menu = require('./menu')
//初始化自定义菜单
//  let xx = wechatApi.createMenu(menu);
//  console.log(xx)
// wechatApi.deleteMenu().then(data=>{
//     console.log('data',data)
//     return wechatApi.createMenu(menu)
// })
// .then(msg=>{
//   console.log(msg)  
// })


exports.reply = function *(next){
 
    let message = this.weixin //事件与普通消息分开
    console.log('message',message)
    //判断用户行为 是事件推送还是普通消息 先判断的是事件推送
    if (message.MsgType === 'event') {
        //订阅事件 分为搜索订阅和二维码订阅
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('扫描二维码进来' + message.EventKey + ' ' + message.ticket);
            }
            //通过this.body设置回复消息
            //this.body = '欢迎订阅我的公众号';
            this.body =[{
                title:'终于等到你 能找到这,你一定是一个不一样的人',
                description:'我的页面',
                picurl:'https://www.ziyanwould.top/img/tm-img-04-tn.jpg',
                url:'https://www.ziyanwould.top/'
                
            },{
                title:'GitHub',
                description:'这只是简单的描述',
                picurl:'https://www.ziyanwould.top/img/tm-img-01-tn.jpg',
                url:'https://github.com/'
                
            }]
        }
        //取消订阅事件
        else if (message.Event === 'unsubscribe') {
            console.log('用户取消了关注');
            this.body = '';
        }
        //地理位置事件
        else if (message.Event === 'LOCATION') {
            this.body = '您上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' + message.Precision;
        }
        //点击事件 自定义菜单事件
        else if (message.Event === 'CLICK') {
            this.body = '您点击了菜单：' + message.EventKey;
        }
        //跳转链接事件 点击菜单跳转链接时的事件推送
        else if (message.Event === 'VIEW') {
            this.body = '您点击了菜单中的链接：' + message.EventKey;
        }
        //扫描事件
        else if (message.Event === 'SCAN') {
            console.log('关注后扫描二维码' + message.EventKey + ' ' + message.Ticket);
            this.body = '看到你扫一下哦';
        }
        //扫码推送事件
        else if (message.Event === 'scancode_push') {
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);
            this.body = '您点击了菜单中的链接：' + message.EventKey;
        }
        //扫码推送
        else if (message.Event === 'scancode_waitmsg') {
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);
            this.body = '您点击了菜单中的：' + message.EventKey;
        }
        //弹出系统拍照
        else if (message.Event === 'pic_sysphoto') {
            console.log( message.SendPicsInfo.PicList);
            console.log( message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的：' + message.EventKey;
        }
        //弹出拍照或者相册
        else if (message.Event === 'pic_photo_or_album') {
            console.log( message.SendPicsInfo.PicList);
            console.log( message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的：' + message.EventKey;
        }
        //微信相册发图
        else if (message.Event === 'pic_weixin') {
            console.log( message.SendPicsInfo.PicList);
            console.log( message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的：' + message.EventKey;
        }
        //地理位置选择器
        else if (message.Event === 'location_select') {
            console.log(message.SendLocationInfo.Location_X);
            console.log(message.SendLocationInfo.Location_Y);
            console.log(message.SendLocationInfo.Scale);
            console.log(message.SendLocationInfo.Label);
            console.log(message.SendLocationInfo.Poiname);
            this.body = '您点击了菜单中的：' + message.EventKey;
        }
    }
    else if(message.MsgType==='location'){
        this.body=`您上报的位置信息是： ${message.Location_X}/${message.Location_Y}-${message.Label}`
    }else if(message.MsgType === 'text'){
        let content = message.Content 
        let reply =`咕~~(╯﹏╰)b，你说的“${message.Content} ” 太复杂和深奥 ......` 
        if( content ==='1'){
            reply='你是一个漂亮的小姐姐哦'
        }else if(content ==='2'){
            reply='别问我怎么知道的'
        }else if(content ==='3'){
            reply='鬼知道我怎么知道的'
        }else if(content ==='4'){
            reply=[{
                title:'我的',
                description:'我的页面',
                picurl:'https://www.ziyanwould.top/img/tm-img-04-tn.jpg',
                url:'https://www.ziyanwould.top/'
                
            }]
        }
        else if(content === '5'){
           let data = yield wechatApi.uploadMaterial('image',path.join(__dirname, '../2.jpg'))

           reply = {
               type:'image',
               mediaId:data.media_id
           }
        }else if(content === '6'){
            let data = yield wechatApi.uploadMaterial('video',path.join(__dirname, '../2.mp4'))
            reply ={
                type:'video',
                title:'你想要的视频',
                description:'梦幻一般',
                mediaId:data.media_id
            }

        }else if(content === '7'){
            let data = yield wechatApi.uploadMaterial('image',path.join(__dirname, '../2.jpg'))
            reply = {
                type:'music',
                title:'这是我喜欢的一段音乐',
                description:'放松一下',
                musicUrl:'https://yln212.top/7.mp3',
                hqMusicUrl:'https://yln212.top/7.mp3',
                thumbMediaId:data.media_id
            }
           

        } else if(content === '8'){
            let data = yield wechatApi.uploadMaterial('image',path.join(__dirname, '../2.jpg'),{type:'image'})
 
            reply = {
                type:'image',
                mediaId:data.media_id
            }
         
        }else if(content === '9'){
            let data = yield wechatApi.uploadMaterial('video',path.join(__dirname, '../2.mp4'),{
                type:'video',
                description:'{"title":"Really a nince place ","introduction":"Nerver think it so easy"}'
            })
            reply ={
                type:'video',
                title:'你想要的视频',
                description:'梦幻一般 永久上传',
                mediaId:data.media_id
            }

        }
        else if(content === '10'){
            let picData = yield wechatApi.uploadMaterial('image',path.join(__dirname, '../2.jpg'),{})
            
            let media = {
                articles:[{
                   title:'测试测试',
                   thumb_media_id:picData.media_id,
                   author:'ziyanwould',
                   digest:'没有摘要',
                   show_cover_pic:1,
                   content:'没有内容',
                   content_source_url:'https://github.com'

               }]

              
            }

          let   datas = yield wechatApi.uploadMaterial('news',media,{})
         
           let     data = yield wechatApi.fetchMaterial(datas.media_id,'news',{})

          
            let items = data.news_item 
            let news = []

            items.forEach(function(item){
                news.push({
                    title:item.title,
                    description:item.digest,
                    picurl:picData.url,
                    url:item.url
                })
            })
               reply = news
        }else if(content === '11'){
         let counts = yield wechatApi.countMaterial()

         console.log(JSON.stringify(counts))
         let results = yield [
             wechatApi.batchMaterial({
                 type:'image',
                 offset:0,
                 count:10
             }),
             wechatApi.batchMaterial({
                type:'video',
                offset:0,
                count:10
            }),
            wechatApi.batchMaterial({
                type:'voice',
                offset:0,
                count:10
            }),
            wechatApi.batchMaterial({
                type:'news',
                offset:0,
                count:10
            }),
         ]
          console.log(JSON.stringify(results))
        console.log(results)
         reply = 1
        }else if(content === '12'){
              let grouptag  = yield wechatApi.createTag('ziyanwould') //创建标签
              console.log(grouptag)
              let group = yield wechatApi.batchtaggingTag(['oh4g-1LRE5jyMAzUo5JABQ0zvIMk','oh4g-1KF0_l2THlbspURUVnzprI4','oh4g-1JnqBmTQH9VKAZMpEWC4DEM'],103)
              console.log('打标签 ')
              console.log(group)

              let groups = yield wechatApi.fetchTag()

              console.log('最新分组')
              console.log(groups)
              let groupqx = yield wechatApi.batchuntaggingTag([message.FromUserName],100)
              console.log(groupqx)
              let group2 = yield wechatApi.checkTag(message.FromUserName)

              console.log('查看自己的分组')
              console.log(group2)

              reply = 'hello world'
            
        }else if(content === '13'){
            let list = yield wechatApi.userTag(100)
            console.log(list)

            let newTag = yield wechatApi.updateTag(100,'my ziyanwould')
            console.log(newTag)
            let groups = yield wechatApi.fetchTag()

            console.log('最新分组')
            console.log(groups)
            reply = 'hello world111'
        }else if(content === '14'){
             let group  = yield wechatApi.createTag('new tags') //创建标签
             console.log(group)
            
             let del = yield wechatApi.deleteTag(100)
             console.log(del)

             let groups = yield wechatApi.fetchTag()
             console.log('最新分组')
             console.log(groups)
             reply = 'hello world1114'
        }else if(content === '15'){
          let user = yield wechatApi.fetchUsers(message.FromUserName,'en')
          console.log(user)

          var openIds = [
              {
                  openid:message.FromUserName,
                  lang:'en'
              }
          ]
          let users = yield wechatApi.fetchUsers(openIds)

          console.log(users)

          reply = JSON.stringify(user)

        }else if(content === '16'){

         let userlist = yield wechatApi.listUsers()
         console.log(userlist)
         reply = userlist.total

        }else if(content === '17'){
          let  mpnews = {
              media_id:'Wfafuq8sdY6UHZIsrlyG-zE5F7GilEZ0F1OGE_14REQ'
          }

          //群发文本
        //   let text ={
        //     "content":"CONTENT"
        //   }
        //   let msgData = yield wechatApi.sendByGroup('text',text,103)


          let msgData = yield wechatApi.sendByGroup('mpnews',mpnews,103)
          console.log(msgData)
          reply = 'hello ziyanwould'
        }else if(content === '18'){
            let  mpnews = {
                media_id:'Wfafuq8sdY6UHZIsrlyG--0Wgtwh1JSvIVryHB83ru4'
            }
  
            //群发文本
            // let text ={
            //   "content":"CONTENT"
            // }
            // let msgData = yield wechatApi.previewMass('text',text,'oh4g-1KF0_l2THlbspURUVnzprI4')
  
  
            let msgData = yield wechatApi.sendByGroup('mpnews',mpnews,'oh4g-1KF0_l2THlbspURUVnzprI4')
            console.log(msgData)
            reply = 'hello ziyanwould'
          }else if(content === '19'){
           
            let msgData = yield wechatApi.checkMass('400958630')
            console.log(msgData)

           

            reply= '查看消息发送状态'
          }else if(content === '20'){
             let semanticData = {
                "query":"特色小吃",
                "city":"广州市",
                "category": "restaurant",
                "appid":config.wechat.appID,
                "uid": message.FromUserName
                }
             let _semanticData = yield wechatApi.semantic(semanticData)

             reply = JSON.stringify(_semanticData)
          }

        this.body=reply
    }
    yield next
}