'use strict'

const sha1 = require('sha1');
const Wechat = require('./wechat')
const util = require('./util')
const getRawBody = require('raw-body')




module.exports = function  (params) {
  //  let wechat = new Wechat(params)//管理票据的更新及存储  实例化构造函数
    return function *(next){
        let that = this;
        console.log(this.query)
        let token =params.token;
        let signature = this.query.signature;
        let nonce=this.query.nonce;
        let timestamp=this.query.timestamp;
        let echostr = this.query.echostr;
        let str =[token,timestamp,nonce].sort().join('');
        let sha = sha1(str)
    
        //判断请求类型
        if(this.method === 'GET'){
            if(sha === signature){
                this.body =echostr +''
            }else{
                this.body = 'wrong'
            }
        }else if(this.method ==='POST'){
            if(sha !== signature){
                this.body ='wrong'
                return false
            }else{
             

                let data = yield getRawBody(this.req,{//处理获得的数据 把XML暴露出来
                    length:this.length,
                    limit:'1mb',
                    encoding:this.charset
                })


                //console.log(data.toString())

                let content = yield util.parseXMLAsync(data)
               // console.log(content)
              
                let message = util.formatMessage(content.xml)

                console.log(message)

                //一个回复的类型
                // if(message.MsgType === 'event'){
                //     if(message.Event === 'subscribe'){
                //         let now = new Date().getTime()
                        
                //         that.status = 200
                //         that.type = 'application/xml'
                //         let reply =`<xml>
                //         <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                //         <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                //         <CreateTime>${now}</CreateTime>
                //         <MsgType><![CDATA[text]]></MsgType>
                //         <Content><![CDATA[你好! 欢迎来到流风]]></Content>
                //       </xml>`
                //         console.log(reply)
                //         that.body = reply

                //         return
                //     }
                // }


                this.weixin = message
                yield handler.call(this,next)

                wechat.reply.call(this)
            }
        }

       
    
    }
}

