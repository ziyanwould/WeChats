'use strict'
const config = require('./config')
const Wechat = require('./wechat/wechat')
const wechatApi = new Wechat(config.wechat)
exports.reply = function *(next){

    let message = this.weixin //事件与普通消息分开
    console.log('message',message)
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log(`扫描二维码过来：${message.EventKey} ${message.ticket}`)
            }
            console.log(`欢迎你订阅了本订阅号`)
          
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
          
            // this.body =`终于等到你 能找到这是一个不一样的人。请按顺序依次回复数字【1】到【9】吧`
        }else if(message.Event === 'unsubscribe'){
            console.log(`取消关注a`)
               
                this.body=''
        }else if(message.Event === 'LOCATION'){
            this.body=`您上报的位置信息是： ${message.Latitude}/${message.Longitude}-${message.Precision}`
        }else if(message.Event == 'CLICK'){
            this.body=`你点击了菜单 ${message.EventKey}`
        }else if(message.Event==='SCAN'){
            console.log('关注后扫二维码'+message.EventKey +' '+message.Ticket)
        }else if(message.Event ==='VIEW'){
            this.body ='您点击了菜单的链接：'+message.EventKey
        }
      
    }else if(message.MsgType==='location'){
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
           let data = yield wechatApi.uploadMaterial('image',__dirname +'/2.jpg')

           reply = {
               type:'image',
               mediaId:data.media_id
           }
        }else if(content === '6'){
            let data = yield wechatApi.uploadMaterial('video',__dirname +'/2.mp4')
            reply ={
                type:'video',
                title:'你想要的视频',
                description:'梦幻一般',
                mediaId:data.media_id
            }

        }else if(content === '7'){
            let data = yield wechatApi.uploadMaterial('image',__dirname +'/2.jpg')
            reply = {
                type:'music',
                title:'这是我喜欢的一段音乐',
                description:'放松一下',
                musicUrl:'https://yln212.top/7.mp3',
                hqMusicUrl:'https://yln212.top/7.mp3',
                thumbMediaId:data.media_id
            }
           

        } else if(content === '8'){
            let data = yield wechatApi.uploadMaterial('image',__dirname +'/2.jpg',{type:'image'})
 
            reply = {
                type:'image',
                mediaId:data.media_id
            }
         
        }else if(content === '9'){
            let data = yield wechatApi.uploadMaterial('video',__dirname +'/2.mp4',{
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
            let picData = yield wechatApi.uploadMaterial('image',__dirname +'/2.jpg',{})
            
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
        //  console.log(JSON.stringify(results))
        console.log(results)
         reply = 1
        }else if(content === '12'){
              //let group  = yield wechatApi.createTag('ziyanwould') //创建标签
              let group = yield wechatApi.batchtaggingTag(['oh4g-1LRE5jyMAzUo5JABQ0zvIMk','oh4g-1KF0_l2THlbspURUVnzprI4','oh4g-1JnqBmTQH9VKAZMpEWC4DEM'],100)
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
        }

        this.body=reply
    }
    yield next
}