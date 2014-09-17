/**
 * Diamond Dash関連オブジェクトを格納するNamespace
 */
var DIAMONDDASH = DIAMONDDASH || {};
 
/**
 * BlockのModel
 * 
 * BlockModelで初期値を設定
 * BlockCollectionに、modelの更新処理を記述
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};

    ns.BlockModel = Backbone.Model.extend({
        defaults: {
            blockColor: 0,      //0:赤、1:黄、2:紫、3:緑、4:青
            blockX: 0,          //ブロックのX座標（0〜6）
            blockY: 0,          //ブロックのY座標（0〜7）
            id: 'id0_0',          //ブロックの座標を表すID
            erasable: false,    //消せるかどうか
            group: undefined    //消せるブロックグループ
        }
    });

    ns.BlockCollection = Backbone.Collection.extend({
        model: ns.BlockModel,
        properties: {
            blockListX: 7,      //列の数
            blockListY: 16,     //行の数（表示するブロックの２倍）
            resetFlg: false  //消えるブロックがひとつもない時のリセット管理に使うフラグ
        },
        initialize: function(blockListView, restart) {
            this.collection = this.createBlockModels();
            this.updateErasables(blockListView, restart);
        },
        //ブロックModelを作って返すメソッド
        createBlockModels: function() {
            var x, y, r;
            var blockModel;
            for(x = 0; x < this.properties.blockListX; x ++) {
                this.models[x] = [];
                for(y = 0; y < this.properties.blockListY; y ++) {
                    id = x + (y * this.properties.blockListX);
                    r = Math.round(Math.random() * 4);
                    blockModel = new ns.BlockModel({id: 'id' + x +'_'+ y, blockColor: r, blockX: x, blockY: y});
                    this.models[x][y] = blockModel;
                }
            }
            return this;
        },
        //ブロックが消えるかどうか判定
        updateErasables: function(blockListView, restart) {
            var group = 0;                  //グループID定義
            var checkFlg = new Array(this.properties.blockListX);    //チェック済みか管理するフラグ配列定義（7×16）
            var erasableBlockCount = 0; //消せるブロックの数
            var x, y, i;
            var firstFlg = 0;
            var sameBlockCount = 0; //繋がっている同じブロックの総数
            for(i = 0; i < this.properties.blockListX; i++) {
                checkFlg[i] = new Array(this.properties.blockListX + 1);
            }
            for(y = (this.properties.blockListY / 2); y < this.properties.blockListY; y ++) {
                for(x = 0; x < this.properties.blockListX; x ++) {
                    if(this.models[x][y] == undefined) continue;
                    this.models[x][y].set('erasable', false);
                    this.models[x][y].set('group', undefined);
                }
            }
            for(y = (this.properties.blockListY / 2); y < this.properties.blockListY; y ++) {
                for(x = 0; x < this.properties.blockListX; x ++) {
                    sameBlockCount = 0;
                    //周りのブロック判定メソッド
                    if(this.models[x][y] == undefined) continue;
                    (function checkAroundBlock(self,x,y) {
                        //上のブロックと比較
                        if(y > (self.properties.blockListY / 2) && self.models[x][y - 1] != undefined) {
                            if(self.models[x][y].get('blockColor') == self.models[x][y - 1].get('blockColor')) {
                                if(self.models[x][y - 1].get('group') == undefined && checkFlg[x][y - 1] == undefined) {
                                    checkFlg[x][y - 1] = 1;
                                    sameBlockCount ++;
                                    if(sameBlockCount >= 3) {
                                        self.models[x][y].set('group',group);
                                        self.models[x][y - 1].set('group',group);
                                        erasableBlockCount ++;
                                    }
                                    checkAroundBlock(self, x, y - 1);
                                }
                            }
                        }
                        //左のブロックと比較
                        if(x > 0 && self.models[x - 1][y] != undefined) {
                            if(self.models[x][y].get('blockColor') == self.models[x - 1][y].get('blockColor')) {
                                if(self.models[x - 1][y].get('group') == undefined && checkFlg[x - 1][y] == undefined) {
                                    checkFlg[x - 1][y] = 1;
                                    sameBlockCount ++;
                                    if(sameBlockCount >= 3) {
                                        self.models[x][y].set('group',group);
                                        self.models[x - 1][y].set('group',group);
                                        erasableBlockCount ++;
                                    }
                                    checkAroundBlock(self, x - 1, y);
                                }
                            }
                        }
                        //右のブロックと比較
                        if(x < self.properties.blockListX - 1 && self.models[x + 1][y] != undefined) {
                            if(self.models[x][y].get('blockColor') == self.models[x + 1][y].get('blockColor')) {
                                if(self.models[x + 1][y].get('group') == undefined && checkFlg[x + 1][y] == undefined) {
                                    checkFlg[x + 1][y] = 1;
                                    sameBlockCount ++;
                                    if(sameBlockCount >= 3) {
                                        self.models[x][y].set('group',group);
                                        self.models[x + 1][y].set('group',group);
                                        erasableBlockCount ++;
                                    }
                                    checkAroundBlock(self, x + 1, y);
                                }
                            }
                        }
                        //下のブロックと比較
                        if(y < self.properties.blockListY - 1 && self.models[x][y + 1] != undefined) {
                            if(self.models[x][y].get('blockColor') == self.models[x][y + 1].get('blockColor')) {
                                if(self.models[x][y + 1].get('group') == undefined && checkFlg[x][y + 1] == undefined) {
                                    checkFlg[x][y + 1] = 1;
                                    sameBlockCount ++;
                                    if(sameBlockCount >= 3) {
                                        self.models[x][y].set('group',group);
                                        self.models[x][y + 1].set('group',group);
                                        erasableBlockCount ++;
                                    }
                                    checkAroundBlock(self, x, y + 1);
                                }
                            }
                        }
                        if(sameBlockCount >= 3) {
                            self.models[x][y].set('group', group);
                            self.models[x][y].set('erasable', true);
                        }
                    })(this,x,y);
                    if(sameBlockCount >= 3) {
                        group ++;
                    }
                }
            }
            if(erasableBlockCount == 0) {
                alert('消せるブロックがひとつも無いので、シャッフルするよ！');
                this.properties.resetFlg = true;
                this.initialize(blockListView, restart);
            }
            if(blockListView != undefined && this.properties.resetFlg == true) {
                setTimeout(function() {blockListView.$el.empty();}, 50);
                setTimeout(function(){blockListView.blockListSet();}, 100);
                this.properties.resetFlg = false;
            }
        }
    });
})(this);

/**
 * BlockのView
 * 
 * BlockのDOM生成とイベント設定、表示変更
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};

    ns.BlockView = Backbone.View.extend({
        tagName: 'li',
        className: 'block',
        events: {
            'click': 'clickHandler',
        },
        clickHandler: function(event) {
            this.trigger('blockClick', event, this);
        },
        render: function(self) {
        }
    });
})(this);
 
/**
 * BlockリストのView
 * 
 * Collectionを初期化し、各Blockをレンダリング
 * Blockのclickイベントをハンドリング
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};
 
    ns.BlockListView = Backbone.View.extend({
        el: $('#block_list'),
        initialize: function() {
            this.collection = new ns.BlockCollection();
            this.blockListSet();
        },
        //ブロックの初期配置処理
        blockListSet: function() {
            var lis = [];
            var id = 0;
            var x, y;
            for(y = 0; y < this.collection.properties.blockListY; y ++) {
                for(x = 0; x < this.collection.properties.blockListX; x ++) {
                    lis[id] = new ns.BlockView(this.collection.models[x][y]);
                    lis[id].$el.addClass("type_" + lis[id].attributes.blockColor);
                    //消えるブロックを分かり易くする一時処理（デバッグ用）
                    // if(lis[id].attributes.erasable == true) {
                    //     lis[id].$el.addClass('erasable');
                    // }
                    lis[id].on('blockClick', $.proxy(this.blockGroupDelete, this));
                    this.$el.append(lis[id].el);
                    id ++;
                }
            }
        },
        //３つ以上隣接してるブロックグループを消去
        blockGroupDelete: function(event, self) {
            var deletedBlocks = []; //消したブロックの座標情報
            var i = 0;
            var x, y;
            for(y = 0; y < this.collection.properties.blockListY; y ++) {
                for(x = 0; x < this.collection.properties.blockListX; x ++) {
                    // console.log(this.models[x][y].get('group'));
                    if(this.collection.models[x][y] == undefined) continue;
                    if(this.collection.models[x][y].get('group') == undefined) continue;
                    if(this.collection.models[x][y].get('group') == self.attributes.group && this.collection.models[x][y].get('erasable') == true) {
                        var expTop = Number($('#id' + x + '_' + y).css('top').slice(0, -2)) - 10;
                        var expLeft = Number($('#id' + x + '_' + y).css('left').slice(0, -2)) - 10;
                        this.$el.append('<li id="exp' + this.collection.models[x][y].get('group') + '" class="explosion" style="top:'+expTop+'px; left:'+expLeft+'px;"></li>');   //爆発エフェクト追加
                        var expId = this.collection.models[x][y].get('group');
                        $('#id' + x + '_' + y).remove();
                        delete this.collection.models[x][y];
                        deletedBlocks[i] = [];
                        deletedBlocks[i].push(x,y);
                        i++;
                    } 
                }
            }
            setTimeout(function() {$('#exp' + expId + '.explosion').remove();}, 600); //爆発エフェクト削除
            var scoreView = new ns.ScoreStatusView(deletedBlocks);
            this.blockFall(deletedBlocks, self);
        },
        //ブロックの落下処理
        blockFall: function(deletedBlocks, view) {
            var blockXY = this.setFallBlock(deletedBlocks);
            this.blockFallRender(view, blockXY);
        },
        //X座標毎に落下するブロックの数と座標を設定する処理
        setFallBlock: function(deletedBlocks) {
            var x = [];     //X座標毎の落下数を入れる配列
            var y_x = [];   //X座標毎の落下するブロックの座標を入れる配列
            var i;
            for(i = 0; i < this.collection.properties.blockListX; i++) {
               x[i] = 0;
               y_x[i] = [];
            }
            _.each(deletedBlocks, function(num) {
                switch(num[0]) {
                    case 0:
                        x[0] ++;
                        y_x[0].push(num[1]);
                        break;
                    case 1:
                        x[1] ++;
                        y_x[1].push(num[1]);
                        break;
                    case 2:
                        x[2] ++;
                        y_x[2].push(num[1]);
                        break;
                    case 3:
                        x[3] ++;
                        y_x[3].push(num[1]);
                        break;
                    case 4:
                        x[4] ++;
                        y_x[4].push(num[1]);
                        break;
                    case 5:
                        x[5] ++;
                        y_x[5].push(num[1]);
                        break;
                    case 6:
                        x[6] ++;
                        y_x[6].push(num[1]);
                        break;
                }
            });
            return [x, y_x];
        },
        //実際の落下処理（レンダリングとmodelの更新）
        blockFallRender: function(view, blockXY) {
            var fallY_max;      //そのX座標上で消えるブロック内で最大のY座標
            var fallY_now;      //チェック中のブロックのY座標を入れる変数
            var fallY_min;      //そのX座標上で消えるブロック内で最小のY座標-1を入れる変数
            var fallCount;      //そのX軸上で落としたブロックの数を入れる変数
            var tempY;          //ブロックの元のY位置(px)を記憶しておく変数
            var emptyBlocks = [];   //ブロック落下後に空白になる座標を入れる配列
            var addBlocks = []; //空白になった後にブロックが落下し、再び空でなくなった座標
            for(n = 0; n < this.collection.properties.blockListX; n ++) {
                if(blockXY[0][n] != 0) {
                    //コの字型にブロックを消した際の処理
                    fallY_max = _.max(blockXY[1][n]); //そのX座標上で消えるブロック内で最大のY座標
                    fallY_now = fallY_max;
                    fallY_min = _.min(blockXY[1][n]) - 1; //そのX座標上で消えるブロック内で最小のY座標-1
                    fallCount = 0;  //そのX軸上で落としたブロックの数
                    for(fallY_now; fallY_now > fallY_min; fallY_now --) {
                        if(this.collection.models[n][fallY_now] == undefined) continue;
                        if(this.collection.models[n][fallY_now].get('group') == view.attributes.group) continue;
                        $('#id'+n+'_'+fallY_now).attr('id', 'id' + n + '_' + (fallY_max - fallCount)); //IDを更新
                        tempY = this.collection.models[n][fallY_now].get('blockY')
                        this.collection.models[n][fallY_now].set('blockY', (fallY_max - fallCount));     //modelのY座標を更新
                        this.collection.models[n][fallY_now].set('id', 'id' + n + '_' + (fallY_max - fallCount));     //modelのIDを更新
                        this.collection.models[n][(fallY_max - fallCount)] = this.collection.models[n][fallY_now];  //落下先のブロックのmodelを上書き
                        delete this.collection.models[n][fallY_now];   //落下元のブロックのmodelを削除
                        emptyBlocks.push([n, fallY_now]);
                        addBlocks.push([n, (fallY_max - fallCount)]);
                        fallCount ++;
                    }
                    for(fallY_min; fallY_min >= 0; fallY_min --) {
                        //そのX座標のブロックの内、消えたブロックの最小のYより上にあるブロックに対する落下処理
                        if(this.collection.models[n][fallY_min] == undefined) continue;
                        $('#id'+n+'_'+fallY_min).attr('id', 'id' + n + '_' + (fallY_min + blockXY[0][n])); //IDを更新
                        tempY = this.collection.models[n][fallY_min].get('blockY')
                        this.collection.models[n][fallY_min].set('blockY', (fallY_min + blockXY[0][n]));     //modelのY座標を更新
                        this.collection.models[n][fallY_min].set('id', 'id' + n + '_' + (fallY_min + blockXY[0][n]));     //modelのIDを更新
                        this.collection.models[n][(fallY_min + blockXY[0][n])] = this.collection.models[n][fallY_min];  //落下先のブロックのmodelを上書き
                        delete this.collection.models[n][fallY_min];   //落下元のブロックのmodelを削除
                        emptyBlocks.push([n, fallY_min]);
                        addBlocks.push([n, (fallY_min + blockXY[0][n])]);
                    }
                }
            }
            //ブロックが最終的に空白になった座標を割り出す処理
            _.each(emptyBlocks, function(num, index) {
                emptyBlocks[index] = num.toString();
            });
            _.each(addBlocks, function(num, index) {
                delete emptyBlocks[_.indexOf(emptyBlocks, num.toString())];
            });
            this.collection.updateErasables(this);
            this.blockMakeMargin(emptyBlocks);
        },
        //消した分のブロックの追加
        blockMakeMargin: function(emptyBlocks) {
            self = this;
            var addBlocksArray = [];
            _.each(emptyBlocks, function(num, index) {
                addBlocksArray.push(num.split(","));
            });
            var id = 0;
            var lis = [];
            var r;
            var blockModel;
            _.each(addBlocksArray, function(num, index) {
                id = Number(num[0]) + (Number(num[1]) * self.collection.properties.blockListX);
                r = Math.round(Math.random() * 4);
                blockModel = new ns.BlockModel({id: 'id' + Number(num[0]) +'_'+ Number(num[1]), blockColor: r, blockX: Number(num[0]), blockY: Number(num[1])});
                self.collection.models[Number(num[0])][Number(num[1])] = blockModel;
                lis[id] = new ns.BlockView(blockModel);
                lis[id].$el.addClass("type_" + lis[id].attributes.blockColor);
                lis[id].on('blockClick', $.proxy(self.blockGroupDelete, self));
                self.$el.append(lis[id].el);
            });
        }
    });
})(this);

/**
 * 時間表示のView
 * 
 * カウント表示
 * カウントアップの開始と停止
 * 
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};
 
    ns.TimeStatusView = Backbone.View.extend({
        el: $('#time_status'),
        properties: {
            sec: 60,
            timerId: undefined
        },
        initialize: function() {
            this.collection = new ns.BlockCollection();
        },
        start: function() {
            var self = this;
            this.properties.timerId = window.setInterval(function() {
                self.countDown();
            }, 1000);
        },
        stop: function() {
            window.clearInterval(this.properties.timerId);
        },
        countDown: function() {
            var prop = this.properties;
            prop.sec--;
            this.render();
            if(prop.sec == 0) {
                ns.GameController.prototype.gameClear(this.collection);
            }
        },
        clear: function() {
            this.stop();
            this.properties.sec = 60;
            this.$el.html(60);
        },
        render: function() {
            this.$el.html(this.properties.sec);
        }
    });
})(this);

/**
 * スコア表示のView
 * 
 * 消したブロック数を引数に渡した場合は点数の加算
 * 引数なしの場合はスコアのリセット（ゲーム終了時処理）
 * 
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};
 
    ns.ScoreStatusView = Backbone.View.extend({
        el: $('#score_status'),
        gameEl: $('#game_score'),
        properties: {
            gameScore: 0,       //スコア
            deletedBlocksCount: 0    //消したブロックの数
        },
        initialize: function(deletedBlocks) {
            if(deletedBlocks != undefined) {
                this.properties.deletedBlocksCount = deletedBlocks.length;
                this.render();
            } else {
                this.gameEl.html(this.properties.gameScore);
                this.properties.gameScore = 0;
                this.$el.html(0);
            }
        },
        render: function() {
            this.properties.gameScore += Math.pow(this.properties.deletedBlocksCount, 3);
            this.$el.text(this.properties.gameScore);
        }
    });
})(this);

/**
 * 全体のController
 * 各ビューは自身の振る舞い制御と、イベントをGameControllerへ通知
 * 
 * GameController
 * ├TimeStatusView
 * ├ScoreStatusView
 * └BlockListView
 * 　└BlockView
 * 
 */
(function(window) {
    var ns = window.DIAMONDDASH || {},
        prop;
 
    ns.GameController = Backbone.View.extend({
        el: $('#diamonddash'),
        properties: {
            is_started: false,
        },
        initialize: function() {
            this.initSceneView();
            this.initBlockListView();
            this.initTimeStatusView();
        },
        initSceneView: function() {
            $('#start_scene').on('click', $.proxy(this.gameStart, this));
            $('#pause_button').on('click', $.proxy(this.gamePause, this));
            $('#pause_scene').on('click', $.proxy(this.gameRestart, this));
            $('#onemore_button').on('click', $.proxy(this.oneMorePlay, this));
        },
        initBlockListView: function() {
            this.blockListView = new ns.BlockListView();
        },
        initTimeStatusView: function() {
            this.timeStatusView = new ns.TimeStatusView();
        },
        gameStart: function() {
            var self = this;
            var countNumber = 3;
            var countDownTimer;
            var expImg = new Image();   //爆発エフェクト画像のプリロード用
            $('#start_scene').remove();
            if(this.properties.is_started === false) {
                countDownTimer = window.setInterval(function() {
                    countNumber --
                    $('#count_down').html(countNumber);
                }, 1000);
                setTimeout(function() {self.timeStatusView.start();}, 3000);
                setTimeout(function(){$('#countdown_scene').css('display', 'none');}, 3000);
                setTimeout(function(){window.clearInterval(countDownTimer);}, 3000);
                expImg.src = 'img/exp.png'; //爆発エフェクト画像を事前にキャッシュしておく
            } else {
                self.timeStatusView.start();
            }
            this.properties.is_started = true;
        },
        gamePause: function() {
            this.timeStatusView.stop();
            $('#pause_scene').css('display', 'block');
        },
        gameRestart: function() {
            this.timeStatusView.start();
            $('#pause_scene').css('display', 'none');
        },
        gameClear: function(collection) {
            // gameClear処理
            this.properties.is_started = false;
            this.timeStatusView = new ns.TimeStatusView();
            var scoreView = new ns.ScoreStatusView();
            this.timeStatusView.clear();
            $('#clear_scene').css('display', 'block');
            setTimeout(function(){$('#onemore_button').css('display', 'inline-block');}, 1000);
        },
        oneMorePlay: function() {
            $('#count_down').html(3);
            $('#countdown_scene').css('display', 'block');
            $('#clear_scene').css('display', 'none');
            this.gameStart();
            $('#onemore_button').css('display', 'none');
        }
    });
})(this);

/**
 * GameController起動
 */
(function(window) {
    var gameController = new DIAMONDDASH.GameController();
})(this);