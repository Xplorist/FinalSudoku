var app = new Vue({
    el: '#app',
    data: {
        rows: [],
        cols: [],
        zones: [],
    },
    created: function () {
        this.init();
        this.digHole();
    },
    methods: {
        init: function () {
            this.initEmptyArr(this.rows, 'obj');
            this.initEmptyArr(this.cols);
            this.initEmptyArr(this.zones);
            this.rows[0] = this.getRandomRow('obj');
            // 初始化第1行的列，宫数据
            for (let i = 0; i < 9; i++) {
                let num = this.rows[0][i].val;
                let zoneName = this.getZoneName(0, i);
                let zoneOrder = this.getZoneOrder(0, i);
                this.cols[i][0] = num;
                this.zones[zoneName][zoneOrder] = num;
            }
            this.forward(0, 8);
        },
        // 挖空
        digHole: function () {
            let rows = this.rows;
            for (let i = 0; i < rows.length; i++) {
                let randomArr = this.getRandomRow();
                let random = this.getRandomNum(3, 5);
                for (let j = 0; j < random; j++) {
                    let randomCol = randomArr[j] - 1;
                    this.gridSet(i, randomCol, 0);
                    this.rows[i][randomCol].input = true;
                }
            }
        },
        // 前进
        forward: function (row, col) {
            let curRow = 0;
            let curCol = 0;
            if (col === 8) {
                curRow = row + 1;
                curCol = 0;
            } else {
                curRow = row;
                curCol = col + 1;
            }
            if (curRow < 1 || curRow > 8 || curCol < 0 || curCol > 8) {
                return;
            }

            let possible = this.getPossible(curRow, curCol);
            if (possible.length === 0) {
                // 回溯
                this.gridReset(curRow, curCol);
                this.backward(curRow, curCol);
            } else {
                // 前进
                let randomVal = this.getRandomOne(possible);
                this.gridSet(curRow, curCol, randomVal);
                this.forward(curRow, curCol);
            }
        },
        // 回溯
        backward: function (row, col) {
            let curRow = 0;
            let curCol = 0;
            if (col === 0) {
                curRow = row - 1;
                curCol = 8;
            } else {
                curRow = row;
                curCol = col - 1;
            }
            if (curRow < 1 || curRow > 8 || curCol < 0 || curCol > 8) {
                return;
            }
            // 把当前值加入error中
            this.addCurIntoError(curRow, curCol);
            // 从可能值中随机一个当前值
            this.setCurInPossible(curRow, curCol);
        },
        // 从可能值中随机一个当前值
        setCurInPossible: function (row, col) {
            let curGrid = this.rows[row][col];
            let possible = this.getPossible(row, col);
            let beforeStr = this.getBeforeStr(row, col);
            let arr = [];
            for (let i = 0; i < possible.length; i++) {
                arr.push(beforeStr + '' + possible[i]);
            }
            let errorArr = curGrid.error;
            for (let i = 0; i < arr.length; i++) {
                let str = arr[i];
                if (errorArr.includes(str)) {
                    arr.splice(i, 1);
                    i--;
                }
            }
            if (arr.length === 0) {
                // 回溯
                this.gridReset(row, col);
                this.backward(row, col);
            } else {
                // 前进
                let randomStr = this.getRandomOne(arr);
                let char = randomStr[randomStr.length - 1];
                let num = parseInt(char);
                this.gridSet(row, col, num);
                this.forward(row, col);
            }
        },
        // 把当前值加入error中
        addCurIntoError: function (row, col) {
            let curGrid = this.rows[row][col];
            let errorStr = this.getBeforeStr(row, col) + curGrid.val;
            curGrid.error.push(errorStr);
        },
        // 获取当前格子前面所有的格子记录
        getBeforeStr: function (row, col) {
            let str = '';
            for (let i = 0; i < col; i++) {
                str += '' + this.rows[row][i].val;
            }
            return str;
        },
        test: function (row, col, val) {
            let obj = {val: val, error: [], input: false};
            this.rows[row].splice(col, 1, obj);
        },
        inputFocus: function (event, row, col) {
            event.currentTarget.select();
            let val = event.target.value;
            val = this.checkInputValue(row, col, val); // 检查输入值
            this.gridSet(row, col, val); // 更新格子的值
            let completeFlag = this.updateRelateColor(); // 更新相关的行列宫格子的颜色
            if (completeFlag) {
                alert('恭喜您完成了本道数独！！！');
            }
        },
        // 检查输入值
        checkInputValue: function (row, col, val) {
            let element = document.querySelector('#r' + row + 'c' + col);
            val = val.trim().replace(/\D/g, '0');
            val = parseInt(val);
            if (isNaN(val)) {
                val = 0;
            }
            if (val < 0 || val > 10) {
                val = 0;
            }
            element.value = val;
            return val;
        },
        // 更新所有input格子的颜色
        updateRelateColor: function () {
            let completeFlag = true;
            let rows = this.rows;
            for (let i = 0; i < rows.length; i++) {
                for (let j = 0; j < rows[i].length; j++) {
                    if (rows[i][j].input) {
                        let color = this.updateGridColor(i, j);
                        if (color === 'red') {
                            completeFlag = false;
                        }
                    }
                }
            }
            return completeFlag;
        },
        // 更新格子的颜色
        updateGridColor: function (row, col) {
            let color = 'red';
            let element = document.querySelector('#r' + row + 'c' + col);
            let val = this.rows[row][col].val;
            if (val !== 0) {
                this.gridReset(row, col);
                let possible = this.getPossible(row, col);
                if (possible.includes(val)) {
                    color = 'blue';
                }
                this.gridSet(row, col, val);
            }
            element.style.color = color;
            return color;
        },
        gridSet: function (row, col, val) {
            let obj = this.rows[row][col];
            obj.val = val;
            this.rows[row].splice(col, 1, obj);
            this.cols[col].splice(row, 1, val);

            let zoneName = this.getZoneName(row, col);
            let zoneOrder = this.getZoneOrder(row, col);
            this.zones[zoneName].splice(zoneOrder, 1, val);
        },
        gridReset: function (row, col) {
            this.gridSet(row, col, 0);
        },
        initEmptyArr: function (arr, type) {
            for (var i = 0; i < 9; i++) {
                var row = [];
                for (var j = 0; j < 9; j++) {
                    if (type === 'obj') {
                        let obj = {val: 0, error: [], input: false};
                        row.push(obj);
                    } else {
                        row.push(0);
                    }
                }
                arr.push(row);
            }
        },
        // 获取宫序号
        getZoneOrder: function (row, col) {
            return row % 3 * 3 + col % 3;
        },
        // 获取宫名
        getZoneName: function (row, col) {
            return Math.floor(row / 3) * 3 + Math.floor(col / 3);
        },
        // 根据坐标获取可能集合中的一个随机值
        getRandomInPossible: function (row, col) {
            var possible = this.getPossible(row, col);
            if (possible.length === 0) {
                return 0;
            }
            return this.getRandomOne(possible);
        },
        // 根据坐标获取可能集合
        getPossible: function (row, col) {
            var zone = this.getZoneName(row, col);

            var rowTemp = this.pushToArr(this.rows[row], 'obj');
            var colTemp = this.pushToArr(this.cols[col]);
            var zoneTemp = this.pushToArr(this.zones[zone]);

            // 去0
            var rowArr = this.getNotZeroSet(rowTemp);
            var colArr = this.getNotZeroSet(colTemp);
            var zoneArr = this.getNotZeroSet(zoneTemp);
            // 去重
            var subAll = [];
            subAll = this.addToSubSet(rowArr, subAll);
            subAll = this.addToSubSet(colArr, subAll);
            subAll = this.addToSubSet(zoneArr, subAll);
            var total = this.getTotalSet();
            var result = [];
            // 求该坐标的行列宫已有值的全集的补集
            for (var i = 0; i < total.length; i++) {
                var item = total[i];
                if (!subAll.includes(item)) {
                    result.push(item);
                }
            }
            if (result.length === 0) {
                //window.console.log( 'row: ' + row + ' col: ' + col + ' zon: ' + zone
                //    + '\nrowTemp: ' + rowTemp + '\ncolTemp: ' + colTemp + '\nzoneTemp: ' + zoneTemp
                //    + '\nsubAll : ' + subAll);
            }
            return result;
        },
        // 将一个数组中的所有元素添加到另外一个数组中
        pushToArr: function (arr, type) {
            var result = [];
            for (var i = 0; i < arr.length; i++) {
                if (type === 'obj') {
                    result.push(arr[i].val);
                } else {
                    result.push(arr[i]);
                }
            }
            return result;
        },
        // 将集合去重添加到目标集合中
        addToSubSet: function (arr, subAll) {
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                if (!subAll.includes(item)) {
                    subAll.push(item);
                }
            }
            return subAll;
        },
        // 获取非0集合
        getNotZeroSet: function (arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === 0) {
                    arr.splice(i, 1);
                    i--;
                }
            }
            return arr;
        },
        // 获取全集
        getTotalSet: function () {
            var total = [];
            for (var i = 0; i < 9; i++) {
                total.push(i + 1);
            }
            return total;
        },
        // 获取1-9的随机不重复数组
        getRandomRow: function (type) {
            var row = [];
            var temp = [];
            for (var i = 0; i < 9; i++) {
                temp.push(i + 1);
            }
            for (var i = 0; i < 9; i++) {
                var random = this.getRandomNum(0, temp.length - 1);
                if (type === 'obj') {
                    let obj = {val: temp[random], error: [], input: false};
                    row.push(obj);
                } else {
                    row.push(temp[random]);
                }
                temp.splice(random, 1);
            }
            return row;
        },
        // 将数组变成随机数组
        getRandomArr: function (arr) {
            var result = [];
            var temp = arr.slice();
            while (temp.length > 0) {
                var random = this.getRandomNum(0, temp.length - 1);
                result.push(temp[random]);
                temp.splice(random, 1);
            }
            return result;
        },
        // 从数组中随机取出一个数
        getRandomOne: function (arr) {
            var random = this.getRandomNum(0, arr.length - 1);
            return arr[random];
        },
        // 获取[min, max]之间的一个随机数
        getRandomNum: function (min, max) {
            min = Math.floor(min);
            max = Math.ceil(max);
            return Math.floor(Math.random() * (max + 1 - min)) + min;
        },
    },
});