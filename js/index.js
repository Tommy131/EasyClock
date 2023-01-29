// 禁止使用右键菜单
document.oncontextmenu = () => {return false}

// 定义工具方法
const owo = {
    // 简化本地存储
    storage: localStorage,
    // 获取时钟对象
    clock(time) {
        let date = (isNaN(time) || (time == null)) ? new Date : new Date(time)
        return {
            obj:    date,
            year:   date.getFullYear(),
            month:  date.getMonth() + 1,
            date:   date.getDate(),
            today:  date.getDay(),
            hour:   date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds()
        }
    },
    // 格式化时间
    formatTime(number) {
        return (number >= 0 && number <= 9) ? '0' + number : number
    },
    formatDateToCN(year, month, date) {
        return year + '年' + this.formatTime(month) + '月' + this.formatTime(date) + '日'
    },
    // 通过数字获取星期
    getDay(day, language = 'cn') {
        if(day >= 7) {
            day -= 7
        }
        let _ = []
        switch(language) {
            case 'cn':
            case 'zh-CN':
            default:
                _ = ['日', '一', '二', '三', '四', '五', '六']
                return '星期' + _[day]

            case 'en':
                _ = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                return _[day]

            case 'de':
                _ = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
                return _[day]
        }
    },
    // 返回完整格式化的日期
    getFullDate(year, month, date, day) {
        let maxDate = (new Date(year, month, 0)).getDate()
        if(date > maxDate) {
            date = Math.abs(maxDate - date)
            month++
        }
        return this.formatDateToCN(year, month, date) + this.getDay(day)
    },
    // DOM选择器
    select(selector) {
        return document.querySelector(selector)
    },
    // 节点选择器
    selectWith(node, selector) {
        return node.querySelector(selector)
    },
    // DOM全选择器
    selectAll(selector) {
        return document.querySelectorAll(selector)
    },
    // DOM Class全选择器
    selectClasses(className) {
        return document.getElementsByClassName(className)
    },
    // 获取元素客户端宽度
    getClientWidth(el) {
        return this.select(el).clientWidth
    },
    clear() {
        owo.storage.removeItem('lastDate')
        owo.storage.removeItem('timeStamp')
        owo.storage.removeItem('currentHour')
        owo.storage.removeItem('progress')
        console.log('Done.')
    }
}

function testData() {
    owo.storage.setItem('lastDate', '2023年01月29日星期日')
    owo.storage.setItem('timeStamp', '1675011543000')
    owo.storage.setItem('currentHour', 23)
    owo.storage.setItem('progress', 23)
}

// 定义选择器
const el = {
    clock: [
        {
            name: 'hour',
            class: '.hour',
            method: 'getHours'
        },
        {
            name: 'minute',
            class: '.minute',
            method: 'getMinutes'
        },
        {
            name: 'second',
            class: '.second',
            method: 'getSeconds'
        },
    ],
    moveableLine: {
        timeline:      '.timeline',
        boxBottom:     '.timeline .box .bottom',
    },
    _others: {
        point:         '.point.done',
        line:          '.timeline .box > .top .line',
        capsuleLabel: '.capsule-label'
    }
}

// 定义时钟Div更新方法
const updateClockDiv = {
    refresh(selector, value) {
        owo.select(selector).innerText = owo.formatTime(value)
    },
    withAnimation(selector, method) {
        let t = (new Date)[method]()
        for(let i = 0; i <= t; i++) {
            setTimeout(() => {
                this.refresh(selector, i)
            }, i * (500 / t))
        }
    },
    setClockShadow(color = 50, opacity = 1) {
        if(color.length <= 3) {
            color = 'rgba(' + color + ', ' + color + ', ' + color + ', ' + opacity + ')'
        }
        for(e of el.clock) {
            owo.select(e.class).style.boxShadow = '0 0 30px ' + color
        }
    }
}

// 更新CSS样式
const updateStyle = {
    // 更新时间进度条
    timeProgress(progress) {
        let moveableDiv   = owo.select('#moveableDiv')
        let moveablePoint = owo.select('#moveablePoint')
        let divTopWidth   = owo.select('.top').clientWidth
        let maxWidth      = divTopWidth * (boxController.getAll().length - 1)
        let tick          = divTopWidth / 24
        progress          = progress * tick
        moveableDiv.style.width = moveablePoint.style.marginLeft = (progress <= maxWidth ? progress : 0) + 'px'
        return progress > maxWidth
    },
    moveableLine() {
        let unit                = 'px'
        let moveableLine        = owo.select('#moveableLine').style
        let currentPercent      = parseFloat(moveableLine.marginLeft, unit)
        currentPercent          = isNaN(currentPercent) ? 0 : currentPercent
        let maxWidth            = owo.getClientWidth(el.moveableLine.timeline) - owo.getClientWidth(el.moveableLine.boxBottom) - 2
        moveableLine.marginLeft = ((currentPercent >= maxWidth) ? -20 : (currentPercent + 20)) + unit
        moveableLine.display    = (currentPercent >= maxWidth) ? 'none' : 'block'
    },
    backgroundStarsSky(status = 'none') {
        let el = owo.select('.stars-sky')
        el.style.display = status ?? 'none'
    },
    setPercent(percent = 0) {
        owo.select('body').style.backgroundPosition = percent + '%'
    },
    switchStationLight(status = 1) {
        let style = owo.select('.current-station').style
        style.animationName = (status == 1) ? 'station-afternoon' : 'station-night'
    },
    setThemeColor(type) {
        type = 'var(--preset-point-theme-color-' + type + ')'
        owo.selectAll(el._others.point).forEach((p) => {
            p.style.backgroundColor = type
        })
        owo.selectAll(el._others.line).forEach((l) => {
            l.style.borderColor = type
        })
        owo.selectAll(el._others.capsuleLabel).forEach((c) => {
            c.style.backgroundColor = type
            c.onmouseover = () => {c.style.backgroundColor = '#363636'}
            c.onmouseout  = () => {c.style.backgroundColor = type}
        })
    }
}

// 日期节点控制器
const boxController = {
    length: 0,
    getAll() {
        let all = owo.selectAll('.timeline .box')
        this.length = all.length
        return all
    },
    update(time, forceUpdate = false) {
        let all   = this.getAll()
        let clock = owo.clock(time)
        let today = owo.getFullDate(clock.year, clock.month, clock.date, clock.today)
        if(!owo.storage.getItem('lastDate')) {
            owo.storage.setItem('lastDate',  owo.getFullDate(clock.year, clock.month, clock.date + this.length - 1, clock.today + this.length - 1))
            owo.storage.setItem('timeStamp', clock.obj.getTime() / 1000000)
        }
        let last = owo.storage.getItem('lastDate')
        all.forEach((box, k) => {
            let label = owo.selectWith(box, '.capsule-label')
            let point = owo.selectWith(box, '.point')
            let date  = owo.getFullDate(clock.year, clock.month, clock.date + k, clock.today + k)

            if(forceUpdate || (label.innerText.length <= 0) || (last === today)) {
                label.innerText = date
                label.setAttribute('title', date)
            }

            let isToday = label.getAttribute('title') === today
            if(isToday) {
                label.classList.add('current-station')
                point.classList.add('done')
            }
            else {
                label.classList.remove('current-station')
            }
            if((last === today) && (k !== 0)) {
                point.classList.remove('done')
            }
        })
    },
    addPoints(count, time) {
        if((typeof count != 'number') || (count <= 0)) {
            return
        }

        let endPoint = owo.select('#endPoint')
        for(let i = 0; i < count; i++) {
            // ~创建外部Div
            let newBox = document.createElement('div')
            newBox.setAttribute('class', 'box')
            newBox.setAttribute('id', 'point' + i)

            // ~创建顶部Div
            let boxTop = document.createElement('div')
            boxTop.setAttribute('class', 'top')
            // 创建日期节点Div
            let point = document.createElement('div')
            point.setAttribute('class', 'point')
            let inner = document.createElement('div')
            inner.setAttribute('class', 'inner')
            point.appendChild(inner)
            // 创建线路Div
            let line = document.createElement('div')
            line.setAttribute('class', 'line')

            // ~创建底部Div
            let boxBottom = document.createElement('div')
            boxBottom.setAttribute('class', 'bottom')
            // 创建日期标签Div
            let capsuleLabel = document.createElement('span')
            capsuleLabel.setAttribute('class', 'capsule-label')

            // !合并所有Div
            boxTop.appendChild(point)
            boxTop.appendChild(line)
            newBox.appendChild(boxTop)
            newBox.appendChild(boxBottom).appendChild(capsuleLabel)
            owo.select('.timeline').insertBefore(newBox, endPoint)
        }
        this.update(time)
        this.update()
    }
}

// 创建始终计时器
let progress    = owo.storage.getItem('progress') ?? (owo.clock().hour - 1)
let currentHour = owo.storage.getItem('currentHour') ?? 0
console.log(progress)
const createClockInterval = () => {
    return setInterval(() => {
        let clock  = owo.clock()
        let hour   = clock.hour
        let minute = clock.minute
        let second = clock.second

        // 模拟地铁行进路线
        updateStyle.moveableLine()

        // 判断当前小时是否发生改变 (节约性能)
        if(currentHour == hour) {
            // 刷新当前时间到时钟Div
            for(e of el.clock) {
                updateClockDiv.refresh(e.class, clock[e.name])
            }
            // 更新时间进度条
            if(updateStyle.timeProgress(progress)) {
                progress = owo.clock().hour
                boxController.update(NaN, true)
            }
        } else {
            progress++
            currentHour = hour
            owo.storage.setItem('currentHour', currentHour)
        }

        // 整点刷新所有日期
        if((hour === 0) && (minute <= 1) && (second <= 1)) {
            boxController.update()
        }

        // 设置时钟背景阴影
        if((hour >= 0) && (hour <= 5)) {
            updateClockDiv.setClockShadow('255', 0.5)
        } else {
            updateClockDiv.setClockShadow()
        }

        // 设置星空背景
        let _ = ((hour >= 0) && (hour <= 6)) || ((hour >= 19) && (hour <= 23))
        updateStyle.backgroundStarsSky(_ ? 'block' : 'none')
        // 设置主题颜色
        updateStyle.setThemeColor(((hour >= 10) && (hour <= 15)) ? 2 : 1)
        // 切换站台灯光
        updateStyle.switchStationLight(((hour >= 0) && (hour <= 5) || (hour >= 19) && (hour <= 23)) ? 0 : 1)

        // 更新背景颜色
        let percent = 0
        if((hour >= 0) && (hour <= 5)) {
            percent = 0
        }
        else if((hour === 6)) {
            percent = 20
        }
        else if((hour >= 7) && (hour <= 9)) {
            percent = 40
        }
        else if((hour >= 10) && (hour <= 15)) {
            percent = 60
        }
        else if((hour >= 16) && (hour <= 18)) {
            percent = 80
        }
        else if((hour >= 19) && (hour <= 23)) {
            percent = 100
        }
        updateStyle.setPercent(percent)
    }, 100)
}

;(() => {
    // 激活烟花效果
    const fireworks = owo.selectClasses('fireworks')
    for(let firework of fireworks) {
        for(let t = 0; t < 50; t++) {
            let year = document.createElement('div')
            year.classList.add('year')
            firework.appendChild(year)
        }
    }

    // 初始化时钟延迟动画
    for(e of el.clock) {
        updateClockDiv.withAnimation(e.class, e.method)
    }

    // 创建新的日期节点
    boxController.addPoints(3, Math.round(parseFloat(owo.storage.getItem('timeStamp')) * 1000000))

    setInterval(() => {
        owo.storage.setItem('progress', progress)
    }, 500)

    // 时钟暂停控制器
    let clockInterval = createClockInterval();
    owo.select('#clockController').addEventListener('click', function() {
        if(clockInterval != 0) {
            clearInterval(clockInterval)
            clockInterval = 0
            this.innerText = '启动'
        } else {
            clockInterval = createClockInterval()
            this.innerText = '暂停'
        }
    })
})()