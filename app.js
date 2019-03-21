const Koa = require('koa');
const util = require('./libs/util')
const path  = require('path')
const wechat = require('./wechat/g')
const config = require('./config')
const reply = require('./wx/reply.js')
//为了解决 单页面问题
const ejs = require('ejs')
const heredoc = require('heredoc')


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
</body>

</html>
    
    */
})


const app = new Koa()
app.use(function *(next){
    if(this.url.indexOf('/movie') > -1){
        this.body =  ejs.render(tpl,{})
        return next
    }
    yield next
})
app.use(wechat(config.wechat,reply.reply))

app.listen(1234)
console.log('Listening:1234')