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
    <title>搜索电影</title>
</head>

<body>
    <h1 class="">点击标题，开始录音翻译</h1>
    <p class="title">

    </p>
    <div class="directors">

    </div>
    <div class="year">

    </div>

    <div class="poster">

    </div>
    <script src="https://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
    <script src="https://res2.wx.qq.com/open/js/jweixin-1.4.0.js"></script>
    <script>
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wxf2d1d23f5191f54a', // 必填，公众号的唯一标识
            timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
            nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
            signature: '<%= signature %>', // 必填，签名
            jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'translateVoice',
                    ''
                ] // 必填，需要使用的JS接口列表
        });
        wx.ready(function() {
            wx.checkJsApi({
                jsApiList: ['onVoiceRecordEnd'],
                success: function(res) {
                    console.log(res)

                }
            });
            let shareContent = {
                title: '分享标题', // 分享标题
                desc: '分享描述', // 分享描述
                link: 'https:yln212.top', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: 'https://yln212.top/-M_w587G8t-qPtaRdCALx.png', // 分享图标
                type: 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function() {
                    alert(分享成功)
                },
                cancel: () => {
                    alert(分享失败)
                }
            }
            wx.onMenuShareAppMessage(shareContent)
            let vido = false
            $('h1').click(function() {
                if (!vido) {
                    vido = true
                    wx.startRecord({
                        cancel: () => {
                            alert('那就不去搜索了')
                        }
                    });

                    return
                }

                vido = false

                wx.stopRecord({
                    success: function(res) {
                        var localId = res.localId;

                        wx.translateVoice({
                            localId: localId,
                            isShowProgressTips: 1,
                            success: function(res) {
                                // alert(res.translateResult); // 语音识别的结果
                                $.ajax({
                                    url: "https://api.douban.com/v2/movie/search?q=流浪地球", //res.translateResult,
                                    type: "GET",
                                    dataType: "jsonp", //指定服务器返回的数据类型
                                    success: function(data) {
                                        let message = data.subjects[0]
                                        $('.title').html(message.title)
                                        $('.directors').html(message.directors[0].name)
                                        $('.year').html(message.year)
                                        $('.poster').html(` <img src="https://yln212.top/-M_w587G8t-qPtaRdCALx.png" alt="" class="">`)

                                        shareContent = {
                                            title: message.title, // 分享标题
                                            desc: '你懂的', // 分享描述
                                            link: 'https://github.com', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                                            imgUrl: 'https://yln212.top/-M_w587G8t-qPtaRdCALx.png', // 分享图标
                                            success: () => {
                                                alert(分享成功)
                                            },
                                            cancel: () => {
                                                alert(分享失败)
                                            }
                                        }

                                    }
                                });
                            }
                        });
                    }
                });
            })
        });

        $('.poster').click(function() {
            wx.previewImage({
                current: 'https://yln212.top/-M_w587G8t-qPtaRdCALx.png', // 当前显示图片的http链接
                urls: [
                        'https://yln212.top/-NmoO5FsfAPjOBGa-saLg.jpg',
                        'https://yln212.top/-SFEFYo1prGn45p7t2ud0.png',
                        'https://yln212.top/1Umaa1p5fbP6oHdkS2mFR.png',
                        'https://yln212.top/1vCVN3VmPHuyFvyvWYN2O.jpg',
                        'https://yln212.top/2C1Dfsh4mfOhCqTgg3dW6.png'
                    ] // 需要预览的图片http链接列表
            });
        })
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