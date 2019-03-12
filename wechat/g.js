'use strict'

const sha1 = require('sha1');
const Wechat = require('./wechat')
const getRawBody = require('raw-body')




module.exports = function  (params) {
    let wechat = new Wechat(params)//管理票据的更新及存储  实例化构造函数
    return function *(next){
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
             

                let data = yield getRawBody(this.req,{
                    length:this.length,
                    limit:'1mb',
                    encoding:this.charset
                })


                console.log(data.toString())
            }
        }

       
    
    }
}

