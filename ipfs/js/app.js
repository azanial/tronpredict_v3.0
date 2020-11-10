var ready = false;
var assetset = false;

var _q = window.location.search.substring(1);
var _v = _q.split('&');
var _p = _v[0];

/* session storage */
const asyncSessionStorage = {
    setItem: async function (key, value) {
        await null;
        return sessionStorage.setItem(key, value);
    },
    getItem: async function (key) {
        await null;
        return sessionStorage.getItem(key);
    }
};

var contract;
var tptcontract;
var text;

var trxformatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'TRX'});
var tptformatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'TPT'});

this.windowload();

async function windowload() {
    /* assets */
    // testnet
    var shasta_contract = 'TBetHLotME5DyVWbe9hDeFmDP9Uq7AYf6L';
    var shasta_text = 'Tron Shasta Testnet';
    var shasta_tptcontract = 'TPEXHofD28dvvL4XZdYq91zNecMxHU8ntk';

    // mainnet
    var mainnet_contract = 'TJFALZ4nikhNJ5J6Y599Z5497r9Tb7PcFD';
    var mainnet_tptcontract = 'TUwbf7EaLZmMc8tbfWmN2edWvmhsnYfvYd';
    var mainnet_text = 'Tron Mainnet';
    
    // tronlink installed
    if(sessionStorage.getItem('aznl_account') && sessionStorage.getItem('aznl_network')) {
        switch(sessionStorage.getItem('aznl_network')) {
            case 'https://api.trongrid.io': // mainnet
                contract = mainnet_contract;
                tptcontract = mainnet_tptcontract;
                text = mainnet_text;
                break;
            case 'https://api.shasta.trongrid.io': // shasta testnet
                contract = shasta_contract;
                tptcontract = shasta_tptcontract;
                text = shasta_text;
                break;
            default: // unsupported network
                contract = null;
                text = null;
        }

        await sessionStorage.setItem('aznl_contract',contract);
        await sessionStorage.setItem('aznl_networktext',text);
        await sessionStorage.setItem('aznl_tptcontract',tptcontract);
        
        if(sessionStorage.getItem('aznl_contract') == null) {
            $('.popupback').css('display', 'block');
            $('#noprovider').css('display', 'block');
        } else {
            $('.popupback').css('display', 'none');
            $('#noprovider').css('display', 'none');
        }
        
        try {
            window.onload = function(){
                this.loader();
            };
        } catch(error) {
            this.loader();
        }
    } else {
        window.location = './sign.html';
    }
}

async function loader() {
    var ntwrk = sessionStorage.getItem('aznl_networktext');
    var ntwrktxt = ntwrk.replace(/ /g, '<br />');
    $('.networkloaded').html(ntwrktxt);
    
    $('.acc').text(sessionStorage.getItem('aznl_account'));
    $('.net').text(sessionStorage.getItem('aznl_networktext'));
    $('.cnt').text(sessionStorage.getItem('aznl_contract'));
    
    if(!sessionStorage.getItem('aznl_currcoin')) {
        await sessionStorage.setItem('aznl_currcoin', 'TRX');
        await sessionStorage.setItem('aznl_currcoinid', 11);
    }
    
    ready = true;
    
    if(sessionStorage.getItem('aznl_contract') != null) {
        if(_p == 'weekcoin' || _p == 'daycoin') {
            loadpredictioninfo();
            loadcurrentprice();
            loadassetstats();
        }
        
        if(_p == 'weekcoin') {
            weekcountdowntoopen();
        }
        
        if(_p == 'daycoin') {
            daycountdowntoopen();
        }

        if(_p == 'predictions') {
            loaduserpredictionslist(1);
        }

        if(_p == 'wallet') {
            loaduserbalance();
        }
        
        if(_p == 'tpt') {
            loadtpt();
        }
    } else {
        $('.popupback').css('display', 'block');
        $('#noprovider').css('display', 'block');
    }
    
    
}

async function loadpredictioninfo() {
    let cont = await window.tronWeb.contract().at(contract);
    
    var currassetid, prevassetid, startoffset, closeoffset, endoffset, offsetplus;
    
    if(_p == 'weekcoin') {
        currassetid = this.weekcurrassetid(sessionStorage.getItem('aznl_currcoinid'));
        prevassetid = this.weekprevassetid(sessionStorage.getItem('aznl_currcoinid'));
    } else if(_p == 'daycoin') {
        currassetid = this.daycurrassetid(sessionStorage.getItem('aznl_currcoinid'));
        prevassetid = this.dayprevassetid(sessionStorage.getItem('aznl_currcoinid'));
    }
    
    await sessionStorage.setItem('aznl_currcoinassetid', currassetid);
    assetset = true;
    
    // current prediction info
    cont.getpredictionasset(Number(currassetid)).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));

        var _coin = obj.a;
        var _date = obj.b;
        var _cycle = parseInt(obj.c._hex);
        var _openprice = parseInt(obj.d._hex);
        var _closeprice = parseInt(obj.e._hex);
        var _pricehigh = parseInt(obj.f._hex);
        var _pricelow = parseInt(obj.g._hex);
        var _isclosed = obj.h;
        var _totstake = parseInt(obj.i._hex);
        var _totpreds = parseInt(obj.j._hex);
        var _totmined = parseInt(obj.k._hex);

        if(_openprice && _isclosed == false) {
            var op = _openprice / 1000000;
            var rp = _pricehigh / 1000000;
            var fp = _pricelow / 1000000;

            var startdatetime, closedatetime, enddatetime;
            var stu, ctu, etu, stl, ctl, etl;

            if(_cycle == 1) {
                if(_p == 'weekcoin') {
                    startdatetime = this.getdate(_date, 0) + "T00:01:00Z";
                    closedatetime = this.getdate(_date, 3) + "T11:59:00Z";
                    enddatetime = this.getdate(_date, 6) + "T23:59:00Z";
                } else if(_p == 'daycoin') {
                    startdatetime = this.getdate(_date, 0) + "T00:01:00Z";
                    closedatetime = this.getdate(_date, 0) + "T11:59:00Z";
                    enddatetime = this.getdate(_date, 0) + "T23:59:00Z";
                }
            } else if(_cycle == 2) {
                if(_p == 'weekcoin') {
                    startdatetime = this.getdate(_date, 3) + "T12:01:00Z";
                    closedatetime = this.getdate(_date, 6) + "T23:59:00Z";
                    enddatetime = this.getdate(_date, 10) + "T11:59:00Z";
                } else if(_p == 'daycoin') {
                    startdatetime = this.getdate(_date, 0) + "T12:01:00Z";
                    closedatetime = this.getdate(_date, 0) + "T23:59:00Z";
                    enddatetime = this.getdate(_date, 1) + "T11:59:00Z";
                }
            }

            sessionStorage.setItem('aznl_currclosedatetime', closedatetime);
            sessionStorage.setItem('aznl_currenddatetime', enddatetime);

            sessionStorage.setItem('aznl_currcoinopenprice', op.toFixed(6));
            sessionStorage.setItem('aznl_currcoinpricehigh', rp.toFixed(6));
            sessionStorage.setItem('aznl_currcoinpricelow', fp.toFixed(6));

            // UTC datetimes
            stu = this.datetime('UTC',startdatetime);
            ctu = this.datetime('UTC',closedatetime);
            etu = this.datetime('UTC',enddatetime);

            // LOCAL datetimes
            stl = this.datetime('LOCAL',startdatetime);
            ctl = this.datetime('LOCAL',closedatetime);
            etl = this.datetime('LOCAL',enddatetime);

            var pq = 'ON '+etu+' // '+etl+' - '+_coin+'/USDT PRICE WILL';

            $('.cycle').text('CYCLE '+_cycle);
            $('.cycletext').html('<b>CYCLE '+_cycle+':</b> '+stu+' ('+stl+') &#8594; '+etu+' ('+etl+')');
            $('.riseprice').text(rp.toFixed(6));
            $('.fallprice').text(fp.toFixed(6));

            $('#openingprice').text(op.toFixed(6));
            $('#openingtime').html(stu+'<br />'+stl);
            $('#predictionquestion').html('<b>'+pq.toUpperCase()+'</b>');
        }
    });

    // previous prediction info
    cont.getpredictionasset(Number(prevassetid)).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));

        var _openprice = parseInt(obj.d._hex);
        var _closeprice = parseInt(obj.e._hex);
        var _pricehigh = parseInt(obj.f._hex);
        var _pricelow = parseInt(obj.g._hex);
        //var _totmined = parseInt(obj.k._hex);

        if(_closeprice) {
            var yop = _openprice / 1000000;
            var ycp = _closeprice / 1000000;

            var ydiff = ycp - yop;
            var yperc = (ydiff / yop) * 100;
            var ycpc = yperc.toFixed(2) + "%";

            if(ycp > yop) {  // price rise
                $("#yestclosing").css("color","green");
                $("#yestchange").css("color","green");
            } else if(ycp < yop) { // price fall
                $("#yestclosing").css("color","red");
                $("#yestchange").css("color","red");
            }

            $('#yestopening').text(yop.toFixed(6));
            $('#yestclosing').text(ycp.toFixed(6));
            $('#yestchange').text(ycpc);
            
            var yrp = _pricehigh / 1000000;
            var yfp = _pricelow / 1000000;
            var mnd = _totmined / 1000000;
            
            // get ra/rb/fb stats
            cont.getrapredictionsstats(Number(prevassetid)).call().then(function(receipt){
                // ra stats

                var obj = JSON.parse(JSON.stringify(receipt));

                var _ratotpreds = parseInt(obj.raa._hex);
                var _ratotstake = parseInt(obj.rab._hex);
                var _raiscorrect = obj.rac;
                var _rarewardperc = parseInt(obj.rad._hex);

                if(!_ratotpreds){_ratotpreds = 0;}
                if(!_ratotstake){_ratotstake = 0;}

                cont.getrbpredictionsstats(Number(prevassetid)).call().then(function(receipt){
                    // rb stats

                    var obj = JSON.parse(JSON.stringify(receipt));

                    var _rbtotpreds = parseInt(obj.rba._hex);
                    var _rbtotstake = parseInt(obj.rbb._hex);
                    var _rbiscorrect = obj.rbc;
                    var _rbrewardperc = parseInt(obj.rbd._hex);

                    if(!_rbtotpreds){_rbtotpreds = 0;}
                    if(!_rbtotstake){_rbtotstake = 0;}

                    cont.getfbpredictionsstats(Number(prevassetid)).call().then(function(receipt){
                        // fb stats

                        var obj = JSON.parse(JSON.stringify(receipt));

                        var _fbtotpreds = parseInt(obj.fba._hex);
                        var _fbtotstake = parseInt(obj.fbb._hex);
                        var _fbiscorrect = obj.fbc;
                        var _fbrewardperc = parseInt(obj.fbd._hex);

                        if(!_fbtotpreds){_fbtotpreds = 0;}
                        if(!_fbtotstake){_fbtotstake = 0;}

                        var _yestpreds = _ratotpreds + _rbtotpreds + _fbtotpreds;
                        var _yeststake = (_ratotstake + _rbtotstake + _fbtotstake) / 1000000;
                        var _yestcorrect;
                        var _yestroi;
                        
                        if(_raiscorrect == true) {
                            _yestcorrect = "RA (+"+yrp+")";
                            _yestroi = _rarewardperc;
                        }
                        if(_rbiscorrect == true) {
                            _yestcorrect = "RB ("+yfp+" - "+yrp+")";
                            _yestroi = _rbrewardperc;
                        }
                        if(_fbiscorrect == true) {
                            _yestcorrect = "FB (-"+yfp+")";
                            _yestroi = _fbrewardperc;
                        }
                        
                        $('#yestpreds').text(_yestpreds);
                        $('#yeststake').text(_yeststake.toFixed(6)+' TRX');
                        $('#yestcorrect').text(_yestcorrect);
                        $('#yestroi').text(_yestroi+'%');
                        $('#yestmined').text(mnd);
                    });
                });
            });
        }
    });
    
    cont.getpreminestamp().call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        
        var preminestamp = parseInt(obj._hex) * 1000;
        var nowstamp = Date.now();
        
        if(nowstamp < preminestamp) { // pre-mining
            $('#minetext').html('<b>MINE & EARN TRONPREDICT TOKENS:</b> Stake at least 50 TRX on a Prediction to Mine and Earn at least 10 TPT Tokens');
        } else { // mining
            $('#minetext').html('<b>MINE & EARN TRONPREDICT TOKENS:</b> Stake any TRX amount on a Prediction to Mine and Earn TPT Tokens');
        }
    });
}

function loadcurrentprice() {
    var coinpair = sessionStorage.getItem('aznl_currcoin') + 'USDT';
    var url = "https://api.binance.com/api/v3/ticker/price?symbol=" + coinpair;
    
    $.get(url, function(data){
        var obj = JSON.parse(JSON.stringify(data));
        var cp = Number(obj.price);
        var op = sessionStorage.getItem('aznl_currcoinopenprice');
        
        var diff = cp - op;
        var perc = (diff / op) * 100;
        var cpc = perc.toFixed(2) + "%";

        if(cp > op) {  // price rise
            $("#currentprice").css("color","green");
            $("#currentpercent").css("color","green");
        } else if(cp < op) { // price fall
            $("#currentprice").css("color","red");
            $("#currentpercent").css("color","red");
        }

        $("#currentprice").text(cp.toFixed(6));
        $("#currentpercent").text(cpc);
    });
}

async function loadassetstats() {
    let cont = await window.tronWeb.contract().at(contract);
    
    var currassetid;
    
    if(_p == 'weekcoin') {
        currassetid = this.weekcurrassetid(sessionStorage.getItem('aznl_currcoinid'));
    } else if(_p == 'daycoin') {
        currassetid = this.daycurrassetid(sessionStorage.getItem('aznl_currcoinid'));
    }
    
    // get ra/rb/fb stats
    cont.getrapredictionsstats(Number(currassetid)).call().then(function(receipt){
        // ra stats
        
        var obj = JSON.parse(JSON.stringify(receipt));

        var _ratotpreds = parseInt(obj.raa._hex);
        var _ratotstake = parseInt(obj.rab._hex);

        if(!_ratotpreds){_ratotpreds = 0;}
        if(!_ratotstake){_ratotstake = 0;}

        cont.getrbpredictionsstats(Number(currassetid)).call().then(function(receipt){
            // rb stats
            
            var obj = JSON.parse(JSON.stringify(receipt));

            var _rbtotpreds = parseInt(obj.rba._hex);
            var _rbtotstake = parseInt(obj.rbb._hex);

            if(!_rbtotpreds){_rbtotpreds = 0;}
            if(!_rbtotstake){_rbtotstake = 0;}

            cont.getfbpredictionsstats(Number(currassetid)).call().then(function(receipt){
                // fb stats
                
                var obj = JSON.parse(JSON.stringify(receipt));

                var _fbtotpreds = parseInt(obj.fba._hex);
                var _fbtotstake = parseInt(obj.fbb._hex);

                if(!_fbtotpreds){_fbtotpreds = 0;}
                if(!_fbtotstake){_fbtotstake = 0;}

                var _totpreds = _ratotpreds + _rbtotpreds + _fbtotpreds;
                var _totstake = _ratotstake + _rbtotstake + _fbtotstake;

                if(_totpreds > 0) {
                    var _rap = (_ratotpreds / _totpreds) * 100;
                    var _rbp = (_rbtotpreds / _totpreds) * 100;
                    var _fbp = (_fbtotpreds / _totpreds) * 100;

                    _rap = _rap.toFixed();
                    _rbp = _rbp.toFixed();
                    _fbp = _fbp.toFixed();
                    
                    $("#rasenttext").text(_rap+"%");
                    $("#rbsenttext").text(_rbp+"%");
                    $("#fbsenttext").text(_fbp+"%");
                } else {
                    $("#rasenttext").text("0%");
                    $("#rbsenttext").text("0%");
                    $("#fbsenttext").text("0%");
                }

                if(_totstake > 0) {
                    var _rats = _ratotstake / 1000000;
                    var _rbts = _rbtotstake / 1000000;
                    var _fbts = _fbtotstake / 1000000;

                    var _ras = (_ratotstake / _totstake) * 100;
                    var _rbs = (_rbtotstake / _totstake) * 100;
                    var _fbs = (_fbtotstake / _totstake) * 100;

                    _ras = _ras.toFixed();
                    _rbs = _rbs.toFixed();
                    _fbs = _fbs.toFixed();
                    
                    $("#rastaketext").text(_rats.toFixed(6));
                    $("#rbstaketext").text(_rbts.toFixed(6));
                    $("#fbstaketext").text(_fbts.toFixed(6));

                    var _rar = ((_rbts + _fbts) * 90) / _rats;
                    var _rbr = ((_rats + _fbts) * 90) / _rbts;
                    var _fbr = ((_rbts + _rats) * 90) / _fbts;
                    
                    _rar = _rar.toFixed();
                    _rbr = _rbr.toFixed();
                    _fbr = _fbr.toFixed();
                    
                    var _fbrtxt = _fbr+'%';
                    var _rbrtxt = _rbr+'%';
                    var _rartxt = _rar+'%';
                    
                    if(_fbr == Infinity) {
                        _fbrtxt = '--';
                    }
                    if(_rbr == Infinity) {
                        _rbrtxt = '--';
                    }
                    if(_rar == Infinity) {
                        _rartxt = '--';
                    }
                    
                    $(".rarwrdtext").html("YIELD: <b>"+_rartxt+"</b>");
                    $(".rbrwrdtext").html("YIELD: <b>"+_rbrtxt+"</b>");
                    $(".fbrwrdtext").html("YIELD: <b>"+_fbrtxt+"</b>");
                } else {
                    $("#rastaketext").text("0.000000");
                    $("#rbstaketext").text("0.000000");
                    $("#fbstaketext").text("0.000000");
                    
                    $("#rarwrdtext").text("");
                    $("#rbrwrdtext").text("");
                    $("#fbrwrdtext").text("");
                }
            });
        });
    });
}

function makeprediction(pred) {
    var _ws = screen.availWidth;
    
    var etu = this.datetime('UTC',sessionStorage.getItem('aznl_currenddatetime'));
    var etl = this.datetime('LOCAL',sessionStorage.getItem('aznl_currenddatetime'));
    var stk;
    
    var img = '<img src="./images/coins/'+sessionStorage.getItem('aznl_currcoin')+'.png" style="height:30px;vertical-align:middle;" />';
    var pt = 'ON '+etu+' // '+etl+'<br />'+sessionStorage.getItem('aznl_currcoin')+'/USDT PRICE WILL:<br /><br />';
    
    if(pred == 1) { //RA
        pt += '<b>RISE ABOVE '+sessionStorage.getItem('aznl_currcoinpricehigh')+'</b>';
    } else if(pred == 2) { //RB
        pt += '<b>RANGE BETWEEN '+sessionStorage.getItem('aznl_currcoinpricelow')+' AND '+sessionStorage.getItem('aznl_currcoinpricehigh')+'</b>';
    } else if(pred == 3) { //FB
        pt += '<b>FALL BELOW '+sessionStorage.getItem('aznl_currcoinpricelow')+'</b>';
    }
    
    if(_ws > 1000) {
        stk = document.getElementById("stakeamountwide").value;
    } else if(_ws < 600) {
        stk = document.getElementById("stakeamountnarrow").value;
    } else {
        stk = document.getElementById("stakeamountmid").value;
    }
    
    $('.predictionimg').html(img);
    
    $('.predictioncoinpair').text(sessionStorage.getItem('aznl_currcoin')+'/USDT');
    $('.prediction').html(pt);
    $('.predictionstake').html('<b>'+stk+' TRX</b>');
    
    if(stk == 0) {
        $('.predictionconfirm').html('[ERROR] Stake cannot be 0 TRX.');
        
        $('.predictionstake').css('color', 'red');
        $('.predictionconfirm').css('color', 'red');
        $('.predictionconfirm').css('font-weight', 'bold');
    } else {
        $('.predictionconfirm').html('<div class="confirmbutton" onclick="confirmprediction('+pred+')">Confirm Prediction</div>');
        
        $('.predictionstake').css('color', 'green');
        $('.predictionconfirm').css('color', '#fff');
    }
    
    $('.popupback').css('display', 'block');
    $('#predconfirm').css('display', 'block');
}

async function confirmprediction(pred) {
    let cont = await window.tronWeb.contract().at(contract);
    
    var _ws = screen.availWidth;
    var stk;
    
    var _acc = sessionStorage.getItem('aznl_account');
    var _asset = sessionStorage.getItem('aznl_currcoinassetid');
    var _pred = _asset+''+pred;
    
    if(_ws > 1000) {
        stk = document.getElementById("stakeamountwide").value;
    } else if(_ws < 600) {
        stk = document.getElementById("stakeamountnarrow").value;
    } else {
        stk = document.getElementById("stakeamountmid").value;
    }
    
    var stake = stk * 1000000;
    
    var sendtxt = '<div style="color:green;"><b>Sending Prediction. It may take a minute or so to Confirm. Please Wait...</b></div>';
    $('.predictionconfirm').html(sendtxt);
    
    var _affiliate;
    
    if(sessionStorage.getItem('aznl_affiliate')) {
        _affiliate = sessionStorage.getItem('aznl_affiliate');
    } else {
        _affiliate = 'TMMUN136hHaJkqNdKVfeTz3R8Tvt3iKwbN';
    }
    
    var utokens;
    var divisible;
    var preminestamp;
    
    var nowstamp = Date.now();
    
    await cont.getminingdivisible().call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        divisible = parseInt(obj._hex);
    });
    
    await cont.getpreminestamp().call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        preminestamp = parseInt(obj._hex) * 1000;
    });
    
    if(nowstamp > preminestamp) { // mining
        utokens = (stake / divisible) / 1000000;
    } else { // pre-mining
        utokens = (stake / 5) / 1000000;
    }
    
    cont.makeuserprediction(_asset, _pred, _affiliate).send({
        callValue: stake,
        shouldPollResponse: true
    }).then(function(receipt){
        var cnfrmtxt = '<div style="color:green;"><b>PREDICTION SENT SUCCESSFULLY. TOKENS EARNED: '+utokens+' TPT</b></div><div>&nbsp;</div><div class="confirmbutton" onclick="popupclose()">Done</div>';

        $('.predictionconfirm').css('color', '#fff');
        $('.predictionconfirm').css('font-weight', 'normal');

        $('.predictionconfirm').html(cnfrmtxt);
    }).catch(function(error){
        $('.predictionconfirm').html('[ERROR] '+error);

        $('.predictionconfirm').css('color', 'red');
        $('.predictionconfirm').css('font-weight', 'bold');
    });
}

async function loaduserbalance() {
    await window.tronWeb;
    
    window.tronWeb.trx.getBalance(sessionStorage.getItem('aznl_account')).then(function(balance){
        var bal = balance / 1000000;
        $('.bal').text(trxformatter.format(bal));
        
        if(sessionStorage.getItem('aznl_networktext') == "Tron Shasta Testnet") {
            $('.usdtbal').text("TEST TRX");
        } else {
            var priceurl = "https://api.binance.com/api/v3/ticker/price?symbol=TRXUSDT";

            $.get(priceurl, function(pricedata){
                var priceobj = JSON.parse(JSON.stringify(pricedata));
                var usdtprice = Number(priceobj.price);

                var usdtbal = bal * usdtprice;
                $('.usdtbal').text('USDT '+usdtbal.toFixed(2));
            });
        }
    });
    
    let tptcont = await window.tronWeb.contract().at(sessionStorage.getItem('aznl_tptcontract'));
    
    tptcont.balanceOf(sessionStorage.getItem('aznl_account')).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        
        var tptbal = (parseInt(obj._hex)) / 1000000;
        $('.tptbal').text(tptformatter.format(tptbal));
    });
}

async function loadtpt() {
    await window.tronWeb;
    
    let cont = await window.tronWeb.contract().at(contract);
    let tptcont = await window.tronWeb.contract().at(sessionStorage.getItem('aznl_tptcontract'));
    
    tptcont.totalMined().call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        
        var mined = (parseInt(obj._hex)) / 1000000;
        $('.bal').text(tptformatter.format(mined));
    });
    
    tptcont.totalSupply().call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        
        var supply = (parseInt(obj._hex)) / 1000000;
        $('.tptbal').text(tptformatter.format(supply));
    });
    
    $('.acc').text(sessionStorage.getItem('aznl_tptcontract'));
    
    cont.getminingdivisible().call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        
        var divisible = parseInt(obj._hex);
        $('.divisible').text(divisible);
    });
}

async function loaduserpredictionslist(page) {
    let cont = await window.tronWeb.contract().at(contract);
    
    cont.getnumusertransactions().call().then(async function(receipt){
        var txnums = Number(receipt);
        var pages = Math.ceil(txnums / 20);
        
        if(txnums > 0) {
            if(page == 1) {
                predsind = txnums - 1;
                
                predslist = '<table cellpadding="0" cellspacing="0" border="0" class="predrow"><tr>';
                predslist += '<td class="predstxt"><b>Prediction</b></td>';
                predslist += '<td class="predsstk"><b>Stake</b></td>';
                predslist += '</tr></table>';
                
                $('#txnums').text('('+txnums+')');
            }
            
            var ind = predsind;
            var lst = ind - 20;

            if(ind < 20) {
                lst = -1;
            }
            var stampday = 1000 * 60 * 60 * 24;
            
            while(ind > lst) {
                cont.getlistusertransaction(ind).call().then(async function(receipt){
                    var obj = JSON.parse(JSON.stringify(receipt));

                    var _isusertx = obj.isusertx;

                    if(_isusertx == true) {
                        var _predtx = parseInt(obj.predtx._hex);
                        var _assetid = parseInt(obj.a._hex);
                        var _predid = parseInt(obj.b._hex);
                        var _stake = parseInt(obj.c._hex) / 1000000;
                        var _stamp = parseInt(obj.d._hex) * 1000;
                        var _iscorrect = obj.e;
                        
                        var prdsstk = _stake+' TRX';
                        
                        var assetstring = _assetid.toString();
                        var d = Number(assetstring.substr(-2, 1));
                        
                        cont.getpredictionasset(_assetid).call().then(async function(receipt){
                            var obj = JSON.parse(JSON.stringify(receipt));
                            
                            var _coin = obj.a;
                            var _date = obj.b;
                            var _cycle = parseInt(obj.c._hex);
                            var _closeprice = parseInt(obj.e._hex) / 1000000;
                            var _pricehigh = parseInt(obj.f._hex) / 1000000;
                            var _pricelow = parseInt(obj.g._hex) / 1000000;
                            var _isclosed = obj.h;
                            
                            var enddtstrng;
                            var offset;
                            
                            if(d == 7) {
                                // weekly
                                if(_cycle == 1) {
                                    enddtstrng = _date + 'T23:59:00Z';
                                    offset = stampday * 6;
                                } else if(_cycle == 2) {
                                    enddtstrng = _date + 'T11:59:00Z';
                                    offset = stampday * 10;
                                }
                            } else if(d == 1) {
                                // daily
                                if(_cycle == 1) {
                                    enddtstrng = _date + 'T23:59:00Z';
                                    offset = 0;
                                } else if(_cycle == 2) {
                                    enddtstrng = _date + 'T11:59:00Z';
                                    offset = stampday;
                                }
                            }
                            
                            var enddt = new Date(enddtstrng);
                            var endstmp = enddt.getTime() + offset;
                            var enddate = new Date(endstmp);
                            var enddateutc = this.datetime('UTC',enddate);
                            var enddateloc = this.datetime('LOCAL',enddate);
                            
                            var assprd = _assetid * 10;
                            var prdstxt = '<span style="font-size:0.8em;color:#aaa;">'+_predtx+' // '+new Date(_stamp)+'</span>';
                            var prdsts;

                            if(_predid == assprd + 1) {
                                // rise above
                                prdstxt += '<br /><br />'+_coin+'/USDT Price to <b>RISE ABOVE '+_pricehigh.toFixed(6)+'</b>';
                            } else if(_predid == assprd + 2) {
                                // range between
                                prdstxt += '<br /><br />'+_coin+'/USDT Price to <b>RANGE BETWEEN '+_pricelow.toFixed(6)+' AND '+_pricehigh.toFixed(6)+'</b>';
                            } else if(_predid == assprd + 3) {
                                // fall below
                                prdstxt += '<br /><br />'+_coin+'/USDT Price to <b>FALL BELOW '+_pricelow.toFixed(6)+'</b>';
                            }
                            
                            prdstxt += '<br />On '+enddateutc+' // '+enddateloc;
                            
                            if(_isclosed == true) {
                                if(_closeprice == 0) {
                                    prdsts = '&nbsp;&nbsp;<span style="background-color:#111;">&nbsp;&nbsp;&nbsp;</span>';
                                } else {
                                    if(_iscorrect == true) {
                                        prdsts = '&nbsp;&nbsp;<span style="background-color:green;">&nbsp;&nbsp;&nbsp;</span>';
                                    } else {
                                        prdsts = '&nbsp;&nbsp;<span style="background-color:red;">&nbsp;&nbsp;&nbsp;</span>';
                                    }
                                }
                            } else {
                                prdsts = '&nbsp;&nbsp;<span style="background-color:#369;">&nbsp;&nbsp;&nbsp;</span>';
                            }
                            
                            predslist += '<table cellpadding="0" cellspacing="0" border="0" class="predrow" style="cursor:pointer;" onclick="loaduserprediction('+_predtx+')"><tr>';
                            predslist += '<td class="predsimg"><img src="./images/coins/'+_coin+'.png" style="width:45px;vertical-align:middle;" /></td>';
                            predslist += '<td class="predstxt">'+prdstxt+'</td>';
                            predslist += '<td class="predsstk">'+prdsstk+prdsts+'</td>';
                            predslist += '</tr></table>';
                            
                            $('.preds').html(predslist);
                        });
                    }
                });

                ind--;
            }
            
            if(page < pages) {
                var pg = page + 1;
                var more = '<div class="morebutton" onclick="loaduserpredictionslist('+pg+')">View More</div>';
                $('.more').html(more);
                
                predsind = ind;
                page++;
            } else {
                $('.more').html('');
            }
        } else {
            $('.preds').html('<div class="nopreds">You have not made any predictions on the current network yet.</div>');
        }
            
    });
}

async function loaduserprediction(_predtx) {
    let cont = await window.tronWeb.contract().at(contract);
    
    cont.getusertransaction(_predtx).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));

        var _isusertx = obj.isusertx;

        if(_isusertx == true) {
            var _assetid = parseInt(obj.a._hex);
            var _predid = parseInt(obj.b._hex);
            var _stake = parseInt(obj.c._hex) / 1000000;
            var _reward = parseInt(obj.d._hex) / 1000000;
            var _stamp = parseInt(obj.e._hex) * 1000;
            var _iscorrect = obj.f;
            var _rewardpaid = obj.g;
            
            var _payout = 0;
            var prdsrwd = 0;
            var prdspay = 0;
            var prdscnfrm = null;
            
            var rwrdperc = (Number(_reward)  / Number(_stake)) * 100;

            var prdsstk = _stake.toFixed(6)+' TRX';
            
            var assetstring = _assetid.toString();
            var d = Number(assetstring.substr(-2, 1));
            var stampday = 1000 * 60 * 60 * 24;

            cont.getpredictionasset(_assetid).call().then(async function(receipt){
                var obj = JSON.parse(JSON.stringify(receipt));

                var _coin = obj.a;
                var _date = obj.b;
                var _cycle = parseInt(obj.c._hex);
                var _closeprice = parseInt(obj.e._hex) / 1000000;
                var _pricehigh = parseInt(obj.f._hex) / 1000000;
                var _pricelow = parseInt(obj.g._hex) / 1000000;
                var _isclosed = obj.h;

                var enddtstrng;
                var offset;

                if(d == 7) {
                    // weekly
                    if(_cycle == 1) {
                        enddtstrng = _date + 'T23:59:00Z';
                        offset = stampday * 6;
                    } else if(_cycle == 2) {
                        enddtstrng = _date + 'T11:59:00Z';
                        offset = stampday * 10;
                    }
                } else if(d == 1) {
                    // daily
                    if(_cycle == 1) {
                        enddtstrng = _date + 'T23:59:00Z';
                        offset = 0;
                    } else if(_cycle == 2) {
                        enddtstrng = _date + 'T11:59:00Z';
                        offset = stampday;
                    }
                }

                var enddt = new Date(enddtstrng);
                var endstmp = enddt.getTime() + offset;
                var enddate = new Date(endstmp);
                var enddateutc = this.datetime('UTC',enddate);
                var enddateloc = this.datetime('LOCAL',enddate);

                var assprd = _assetid * 10;
                var prdstxt = '';
                var prdscp;
                var prdscurrp;
                
                var img = '<img src="./images/coins/'+_coin+'.png" style="height:30px;vertical-align:middle;" />';

                if(_predid == assprd + 1) {
                    // rise above
                    prdstxt += _coin+'/USDT Price to <b>RISE ABOVE '+_pricehigh.toFixed(6)+'</b>';
                } else if(_predid == assprd + 2) {
                    // range between
                    prdstxt += _coin+'/USDT Price to <b>RANGE BETWEEN '+_pricelow.toFixed(6)+' AND '+_pricehigh.toFixed(6)+'</b>';
                } else if(_predid == assprd + 3) {
                    // fall below
                    prdstxt += _coin+'/USDT Price to <b>FALL BELOW '+_pricelow.toFixed(6)+'</b>';
                }

                prdstxt += '<br />On '+enddateutc+' // '+enddateloc;

                if(_isclosed == true) {
                    if(_closeprice == 0) {
                        prdsrwd = 'Not Yet Set';
                        prdspay = 'Not Yet Set';
                        prdscp = 'Not Yet Set';
                        
                        $('.predictionconfirm').html('');
                    } else {
                        prdscp = _closeprice.toFixed(6) + ' USDT';
                        
                        if(_iscorrect == true) {
                            _payout = Number(_stake) + Number(_reward);
                            
                            var prdsrwdtrx = _reward;
                            var prdspaytrx = _payout;
                            
                            prdsrwd = '<span style="color:green;">'+Number(prdsrwdtrx).toFixed(6)+' TRX ['+rwrdperc+'%]</span>';
                            prdspay = '<span style="color:green;">'+Number(prdspaytrx).toFixed(6)+' TRX</span>';
                            
                            if(_rewardpaid == false) {
                                $('.predictionconfirm').html('<div class="confirmbutton" onclick="withdraw('+_assetid+','+_predtx+')">Withdraw Pay Out</div>');
                            } else {
                                $('.predictionconfirm').html('');
                                prdspay = '<span style="color:green;">'+Number(prdspaytrx).toFixed(6)+' TRX <b>[PAID OUT]</b></span>';
                            }
                            
                            $('.predictionconfirm').css('color', '#fff');
                        } else {
                            prdsrwd = '<span style="color:red;">-'+prdsstk+' - Incorrect Prediction [-100%]</span>';
                            prdspay = '<span style="color:red;">0.0000 TRX - Incorrect Prediction</span>';
                            
                            $('.predictionconfirm').html('');
                        }
                    }
                } else {
                    prdsrwd = 'Not Yet Set';
                    prdspay = 'Not Yet Set';
                    prdscp = 'Not Yet Set';
                    
                    $('.predictionconfirm').html('');
                }
                
                var coinpair = _coin + 'USDT';
                var url = "https://api.binance.com/api/v3/ticker/price?symbol=" + coinpair;
                var _currprice;

                await $.get(url, function(data){
                    var obj = JSON.parse(JSON.stringify(data));
                    _currprice = Number(obj.price);
                });
                
                $('.predictionimg').html(img);
                $('.predictioncoinpair').html(_coin+'/USDT');
                $('.prediction').html(prdstxt);
                $('.predictioncurrentprice').html(_currprice.toFixed(6)+' USDT');
                $('.predictioncloseprice').html(prdscp);
                $('.predictiondatetime').html(new Date(_stamp));
                $('.predictionstake').html(prdsstk);
                $('.predictionreward').html(prdsrwd);
                $('.predictionpayout').html(prdspay);
                
                $('.popupback').css('display', 'block');
                $('#predview').css('display', 'block');
            });
        }
    });
}

async function withdraw(_asset,_predtx) {
    let cont = await window.tronWeb.contract().at(contract);
    
    var _acc = sessionStorage.getItem('aznl_account');
    
    cont.getusertransaction(_predtx).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));

        var _isusertx = obj.isusertx;
        var _rewardpaid = obj.g;

        if(_isusertx == true && _rewardpaid == false) {
            
            var sendtxt = '<div style="color:green;"><b>Sending Withdrawal Request. It may take a minute or so. Please Wait...</b></div>';
            $('.predictionconfirm').html(sendtxt);
            
            cont.withdrawuserreward(_asset, _predtx).send({shouldPollResponse: true}).then(function(receipt){
                var cnfrmtxt = '<div style="color:green;"><b>WITHDRAWAL REQUEST SUCCESSFUL</b></div><div>&nbsp;</div><div class="confirmbutton" onclick="popupclose()">Done</div>';

                $('.predictionconfirm').css('color', '#fff');
                $('.predictionconfirm').css('font-weight', 'normal');

                $('.predictionconfirm').html(cnfrmtxt);
            }).catch(function(error){
                $('.predictionconfirm').html('[ERROR] '+error.message);

                $('.predictionconfirm').css('color', 'red');
                $('.predictionconfirm').css('font-weight', 'bold');
            });
        }
    });
}

function countdown() {
    var countDownDate = new Date(sessionStorage.getItem('aznl_currclosedatetime')).getTime();
    var now = new Date().getTime();
    
    var distance = countDownDate - now;
    
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    $('#days').text(days);
    $('#hours').text(hours);
    $('#minutes').text(minutes);
    $('#seconds').text(seconds);
}

function popupclose() {
    $('.popup').css('display', 'none');
    $('.popupback').css('display', 'none');
}

async function tronlinkclose() {
    await sessionStorage.removeItem('aznl_network');
    await sessionStorage.removeItem('aznl_networktext');
    await sessionStorage.removeItem('aznl_account');
    await sessionStorage.removeItem('aznl_contract');
    
    window.location = './sign.html';
}
    
function weekcurrassetid(coin) {
    var cycle;
    var stamp = Date.now();
    var date = new Date();
    var stampday = 1000 * 60 * 60 * 24;
    var today = date.getUTCDay();
    var hour = date.getUTCHours();

    if(today < 3) { // sunday to tuesday (0 to 2)
        cycle = 1;
    } else if(today > 3) { // thursday to saturday (4 to 6)
        cycle = 2;
    } else { // wednesday
        if(hour < 12) { // before 12 noon
            cycle = 1;
        } else { // on and after 12 noon
            cycle = 2;
        }
    }

    var costamp1 = stamp - (today * stampday);

    var codate1 = new Date(costamp1),
        coyr1 = codate1.getUTCFullYear(),
        comn1 = codate1.getUTCMonth()+1,
        codt1 = codate1.getUTCDate();

    if(comn1 < 10){comn1 = '0'+comn1;}
    if(codt1 < 10){codt1 = '0'+codt1;}

    var assetstring = coin+""+coyr1+""+comn1+""+codt1+"7"+cycle;

    return assetstring;
}

function weekprevassetid(coin) {
    var cycle;
    var stamp = Date.now();
    var date = new Date();
    var stampday = 1000 * 60 * 60 * 24;
    var stampweek = stampday * 7;
    var today = date.getUTCDay();
    var hour = date.getUTCHours();

    if(today < 3) { // sunday to tuesday (0 to 2)
        cycle = 1;
    } else if(today > 3) { // thursday to saturday (4 to 6)
        cycle = 2;
    } else { // wednesday
        if(hour < 12) { // before 12 noon
            cycle = 1;
        } else { // on and after 12 noon
            cycle = 2;
        }
    }

    var postamp1 = (stamp - (today * stampday)) - stampweek;

    var podate1 = new Date(postamp1),
        poyr1 = podate1.getUTCFullYear(),
        pomn1 = podate1.getUTCMonth()+1,
        podt1 = podate1.getUTCDate();

    if(pomn1 < 10){pomn1 = '0'+pomn1;}
    if(podt1 < 10){podt1 = '0'+podt1;}

    var assetstring = coin+""+poyr1+""+pomn1+""+podt1+"7"+cycle;

    return assetstring;
}

function weekcountdowntoopen() {
    var stamp = Date.now();
    var date = new Date();
    var stampday = 1000 * 60 * 60 * 24;
    var today = date.getUTCDay();
    var hour = date.getUTCHours();
    var mins = date.getUTCMinutes();
    var secs = date.getUTCSeconds();
    
    var closed = false;
    var opentime;
    
    // saturday 23:59
    if (today == 6 && hour == 23 && mins == 59) {
        closed = true;
        date.setUTCHours(0);
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // sunday 00:00 - 00:10
    if (today == 0 && hour == 0 && mins < 10) {
        closed = true;
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // wednesday 11:59
    if (today == 3 && hour == 11 && mins == 59) {
        closed = true;
        date.setUTCHours(12);
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // wednesday 12:00 - 12:10
    if (today == 3 && hour == 12 && mins < 10) {
        closed = true;
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    if(closed == true) {
        $('#predsopentime').text(opentime);
        $('#predsclosed').css('width', pwtxt);
        $('#predsclosed').css('height', '100%');
        $('#predsclosed').css('border', 'none');
        $('#predsclosed').css('position', 'fixed');
        $('#predsclosed').css('top', '0');
        $('#predsclosed').css('left', '110px');
        $('#predsclosed').css('display', 'block');
    } else {
        $('#predsclosed').css('display', 'none');
    }
    
    // Sunday 00:10
    if (today == 0 && hour == 0 && mins == 10 && secs < 2) {
        this.loader();
    }
    
    // Wednesday 12:10
    if (today == 3 && hour == 12 && mins == 10 && secs < 2) {
        this.loader();
    }
}

function daycurrassetid(coin) {
    var cycle;
    var date = new Date(),
        hr = date.getUTCHours(),
        dt = date.getUTCDate(),
        mn = date.getUTCMonth() + 1,
        yr = date.getUTCFullYear();
    
    if(hr < 12) {
        cycle = 1;
    } else {
        cycle = 2;
    }
    
    if(mn < 10){mn = '0'+mn;}
    if(dt < 10){dt = '0'+dt;}
    
    var assetstring = coin+""+yr+""+mn+""+dt+"1"+cycle;
    
    return assetstring;
}

function dayprevassetid(coin) {
    var cycle;
    var stamp = Date.now() - (1000 * 60 * 60 * 24);
    var date = new Date(stamp),
        hr = date.getUTCHours(),
        dt = date.getUTCDate(),
        mn = date.getUTCMonth() + 1,
        yr = date.getUTCFullYear();
    
    if(hr < 12) {
        cycle = 1;
    } else {
        cycle = 2;
    }
    
    if(mn < 10){mn = '0'+mn;}
    if(dt < 10){dt = '0'+dt;}
    
    var assetstring = coin+""+yr+""+mn+""+dt+"1"+cycle;
    
    return assetstring;
}

function daycountdowntoopen() {
    var stamp = Date.now();
    var date = new Date();
    var stampday = 1000 * 60 * 60 * 24;
    var today = date.getUTCDay();
    var hour = date.getUTCHours();
    var mins = date.getUTCMinutes();
    var secs = date.getUTCSeconds();
    
    var closed = false;
    var opentime;
    
    // 23:59
    if (hour == 23 && mins == 59) {
        closed = true;
        date.setUTCHours(0);
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // 00:00 - 00:10
    if (hour == 0 && mins < 10) {
        closed = true;
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // 11:59
    if (hour == 11 && mins == 59) {
        closed = true;
        date.setUTCHours(12);
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // 12:00 - 12:10
    if (hour == 12 && mins < 10) {
        closed = true;
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    if(closed == true) {
        $('#predsopentime').text(opentime);
        $('#predsclosed').css('width', pwtxt);
        $('#predsclosed').css('height', '100%');
        $('#predsclosed').css('border', 'none');
        $('#predsclosed').css('position', 'fixed');
        $('#predsclosed').css('top', '0');
        $('#predsclosed').css('left', '110px');
        $('#predsclosed').css('display', 'block');
    } else {
        $('#predsclosed').css('display', 'none');
    }
    
    // 00:10
    if(hour == 0 && mins == 10 && secs < 2) {
        this.loader();
    }
    
    // 12:10
    if(hour == 12 && mins == 10 && secs < 2) {
        this.loader();
    }
}

function getdate(date, offset) {
    var d = new Date(date+"T00:00:00Z");
    var timestamp = d.getTime();
    var stampday = 1000 * 60 * 60 * 24;
    var mon = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    
    var stamp = timestamp + (stampday * offset);
    
    var _d = new Date(stamp),
        yr = _d.getUTCFullYear(),
        mn = mon[_d.getUTCMonth()],
        dt = _d.getUTCDate();
    
    if(dt < 10){dt = '0' + dt;}
    
    return yr+"-"+mn+"-"+dt;
}
    
function datetime(type, datestring) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var date = new Date(datestring);

    var hr, mn, sc, day, mon, yr;

    if(type == "UTC") {
        hr = date.getUTCHours();
        mn = date.getUTCMinutes();
        sc = date.getUTCSeconds();
        day = date.getUTCDate();
        mon = months[date.getUTCMonth()];
        yr = date.getUTCFullYear();
    } else if(type == "LOCAL") {
        hr = date.getHours();
        mn = date.getMinutes();
        sc = date.getSeconds();
        day = date.getDate();
        mon = months[date.getMonth()];
        yr = date.getFullYear();
    }

    if(hr < 10){hr = "0" + hr;}
    if(mn < 10){mn = "0" + mn;}
    if(sc < 10){sc = "0" + sc;}
    if(day < 10){day = "0" + day;}

    var dt = day + " " + mon + " " + yr + " " + hr + ":" + mn + " " + type;

    return dt;
}

async function checknetwork() {
    var node = window.tronWeb.fullNode.host;
    var addr = window.tronWeb.defaultAddress.base58;
    
    if(addr == false) {
        $('.popupback').css('display', 'block');
        $('#noprovider').css('display', 'none');
        $('#locked').css('display', 'block');
    } else {
        if(node != sessionStorage.getItem('aznl_network')) {
            if(node.includes("trongrid")) {
                $('.popupback').css('display', 'none');
                $('#noprovider').css('display', 'none');
                $('#locked').css('display', 'none');

                await sessionStorage.setItem('aznl_network',window.tronWeb.fullNode.host);
                window.location = './predictiondesk.html?' + _p;
            } else {
                $('.popupback').css('display', 'block');
                $('#noprovider').css('display', 'block');
                $('#locked').css('display', 'none');
            }
        } else {
            $('.popupback').css('display', 'none');
            $('#noprovider').css('display', 'none');
            $('#locked').css('display', 'none');
        }

        if (addr != sessionStorage.getItem('aznl_account')) {
            await sessionStorage.setItem('aznl_account',window.tronWeb.defaultAddress.base58);
            window.location = './predictiondesk.html?' + _p;
        }
    }
}

async function checkasset() {
    var currassetid = sessionStorage.getItem('aznl_currcoinassetid');
    var newassetid;
    
    if(_p == 'weekcoin') {
        newassetid = this.weekcurrassetid(sessionStorage.getItem('aznl_currcoinid'));
    }
    
    if(_p == 'daycoin') {
        newassetid = this.daycurrassetid(sessionStorage.getItem('aznl_currcoinid'));
    }
    
    if(currassetid != newassetid) {
        assetset = false;
        this.loader();
    }
}

setInterval(function(){
    if(ready == true) {
        if(_p == 'weekcoin' || _p == 'daycoin') {
            this.loadassetstats();
        }
    }
}, 30000);

setInterval(function(){
    if(ready == true) {
        if(_p == 'weekcoin' || _p == 'daycoin') {
            this.loadcurrentprice();
        }
    }
}, 5000);

setInterval(function(){
    if(ready == true) {
        this.checknetwork();
    
        if(_p == 'weekcoin' || _p == 'daycoin') {
            this.countdown();
            
            if(assetset == true) {
                this.checkasset();
            }
        }

        if(_p == 'weekcoin') {
            this.weekcountdowntoopen();
        }

        if(_p == 'daycoin') {
            this.daycountdowntoopen();
        }
    }
}, 1000);
