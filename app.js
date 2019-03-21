const Koa = require('koa');
const util = require('./libs/util')
const path  = require('path')
const wechat = require('./wechat/g')
const config = require('./config')
const reply = require('./wx/reply.js')
const Wechat = require('./wechat/wechat.js')
//为了解决 单页面问题
const ejs = require('ejs')
const heredoc = require('heredoc')
const crypto = require('crypto')


let tpl = heredoc(()=>{
    /*
    
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>猜电影</title>
</head>

<body>
    <h1 class="">点击标题，开始录音翻译</h1>
    <p class="title">

    </p>
    <div class="poster">

    </div>
    <script src="https://cdn.bootcss.com/jquery/2.0.0/jquery.js"></script>
    <script src="https://res2.wx.qq.com/open/js/jweixin-1.4.0.js"></script>
    <script>
        wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wxf2d1d23f5191f54a', // 必填，公众号的唯一标识
            timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
            nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
            signature: '<%= signature %>', // 必填，签名
            jsApiList: [
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'translateVoice'
            ] // 必填，需要使用的JS接口列表
        });
    </script>
</body>

</html>
    
    */
})

let createNonce = ()=>{
    return Math.random().toString(36).substr(2,15)
}

let createTimestamp = ()=>{
    return parseInt(new Date().getTime()/1000,10)+''
}
let  _sign = (noncestr,ticket,timestamp,url)=>{
    let params = [
        'noncestr='+noncestr,
        'jsapi_ticket='+ticket,
        'timestamp='+timestamp,
        'url='+url
    ]

    let str = params.sort().join('&')

    let shasum = crypto.createHash('sha1')
    shasum.update(str)
    return shasum.digest('hex')
}
function sign(ticket,url){
    let noncestr = createNonce()
    let timestamp = createTimestamp()
    let signature = _sign(noncestr,ticket,timestamp,url)
     console.log(ticket,url)
    return{
        noncestr:noncestr,
        timestamp:timestamp,
        signature:signature
    }
}

const app = new Koa()
app.use(function *(next){
    if(this.url.indexOf('/movie') > -1){
        let wechatApi = new Wechat(config.wechat)
        let data = yield wechatApi.fetchAccessToken()
        let access_token = data.access_token
        let ticketData = yield wechatApi.fetchTicket(access_token)
        let ticket = ticketData.ticket
        let url = this.href.replace('http','https')
        let params = sign(ticket,url)
        console.log('params',params)
        this.body =  ejs.render(tpl,params)
        return next
    }
    yield next
})
app.use(wechat(config.wechat,reply.reply))

app.listen(1234)
console.log('Listening:1234')