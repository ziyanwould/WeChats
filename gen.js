let gen = function  *(n) {
    for(var i =0;i<3; i++){
     n++
     yield n //断点的作用
    }
}

let genObj = gen(2)//不会执行函数 只是实例化
console.log(genObj.next())//开始执行 
console.log(genObj.next())//进行下一步
console.log(genObj.next())
console.log(genObj.next())


//通过next()
// { value: 3, done: false }
// { value: 4, done: false }
// { value: 5, done: false } done 生成器 执行完毕
// { value: undefined, done: true }