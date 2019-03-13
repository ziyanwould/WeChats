'use strict'

exports.reply = function *(next){

    let message = this.weixin //事件与普通消息分开
    console.log('message',message)
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log(`扫描二维码过来：${message.EventKey} ${message.ticket}`)
            }
            console.log(`欢迎你订阅了本订阅号`)
            this.body =`终于等到你 能找到这是一个不一样的人。请按顺序依次回复数字【1】到【9】吧`
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
            reply='因为我喜欢你呀'
        }else if(content ==='4'){
            reply='还爱上你了呢'
        }else if(content ==='5'){
            reply='你肯定说 信你个鬼 是不是对每个小姐姐都这么说'
        }else if(content ==='6'){
            reply='还想着是不是就这样撩妹'
        }else if(content ==='7'){
            reply='我才不是你想像那样的人的'
        }else if(content ==='8'){
            reply='我只喜欢一个叫 杨丽娜的小姐姐 '
        }else if(content ==='9'){
            reply='不是每个小姐姐都叫杨丽娜哦 只有屏幕前有一点点气急败坏的小姐姐是我爱的  独一无二的'
        }

        this.body=reply
    }
    yield next
}