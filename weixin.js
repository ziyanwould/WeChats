'use strict'

exports.reply = function *(next){

    let message = this.weixin //事件与普通消息分开

    if(message.msgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log(`扫描二维码过来：${message.EventKey} ${message.ticket}`)
            }
            this.body =`欢迎你订阅了本订阅号`
        }else if(message.Event === 'unsubscribe'){
                console.log('取消关注')
                this.body=''
        }
    }

}