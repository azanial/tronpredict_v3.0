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

var contract = 'TJFALZ4nikhNJ5J6Y599Z5497r9Tb7PcFD';
var tptcontract = 'TUwbf7EaLZmMc8tbfWmN2edWvmhsnYfvYd';
var text = 'Tron Mainnet';

var account;
var network;

var trxformatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'TRX'});
var tptformatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'TPT'});

window.onload = function() {
    this.windowload();
};

async function windowload() {
    await sessionStorage.setItem('aznladmin_account',window.tronWeb.defaultAddress.base58);
    await sessionStorage.setItem('aznladmin_network',window.tronWeb.fullNode.host);
    await sessionStorage.setItem('aznladmin_contract',contract);
    await sessionStorage.setItem('aznladmin_tptcontract',tptcontract);
    await sessionStorage.setItem('aznladmin_networktext',text);
    
    this.loader();
}

async function loader() {
    var ntwrk = sessionStorage.getItem('aznladmin_networktext');
    var ntwrktxt = ntwrk.replace(/ /g, '<br />');
    $('.networkloaded').html(ntwrktxt);
    
    $('.acc').text(sessionStorage.getItem('aznladmin_account'));
    $('.net').text(sessionStorage.getItem('aznladmin_networktext'));
    $('.cnt').text(sessionStorage.getItem('aznladmin_contract'));
    
    await loadaffiliateinfo();
    
    ready = true;
}

async function loadaffiliateinfo() {
    let cont = await window.tronWeb.contract().at(contract);
    let tptcont = await window.tronWeb.contract().at(tptcontract);
    
    // affiliate balance
    cont.getaffiliatebalance().call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        
        var bal = parseInt(obj._hex) / 1000000;
        
        $('.bal').text(trxformatter.format(bal));
        
        if(bal > 0) {
            var bttn = '<div>&nbsp;</div><div>&nbsp;</div><span class="confirmbutton" onclick="withdraw()">Withdraw Balance</span>';
            
            $('#withdrawbutton').css('color', 'white');
            $('#withdrawbutton').css('font-weight', 'normal');
            $('#withdrawbutton').css('font-size', '0.9em');
            $('#withdrawbutton').html(bttn);
        } else {
            $('#withdrawbutton').html(null);
        }
    });
    
    // affiliate num transactions
    cont.getnumaffiliatetransactions().call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        
        var numtx = parseInt(obj._hex);
        
        $('.numtx').text(numtx);
    });
    
    // affiliate TPT balance
    tptcont.balanceOf(sessionStorage.getItem('aznladmin_account')).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));
        
        var tptbal = parseInt(obj._hex) / 1000000;
        
        $('.tptbal').text(tptformatter.format(tptbal));
    });
}

async function withdraw() {
    let cont = await window.tronWeb.contract().at(contract);
    
    cont.withdrawaffiliatereward().send({shouldPollResponse: false}).then(function(receipt){
        console.log(receipt);
        var cnfrmtxt = '<div>&nbsp;</div><span style="color:green;cursor:pointer;" onclick="tronscan(\''+receipt+'\')">WITHDRAWAL REQUEST SENT<br />TXN ID: '+receipt+'<br />(See on TronScan)</span>';

        $('#withdrawbutton').css('font-weight', 'bold');
        $('#withdrawbutton').css('font-size', '0.8em');
        $('#withdrawbutton').html(cnfrmtxt);
    }).catch(function(error){
        var cnfrmtxt = '<div>&nbsp;</div><span style="color:red;">[ERROR]: '+error+'</span>';
        
        $('#withdrawbutton').css('font-weight', 'normal');
        $('#withdrawbutton').css('font-size', '0.8em');
        $('#withdrawbutton').html(cnfrmtxt);
    });
}

function tronscan(txnid) {
    var link = 'https://tronscan.org/#/transaction/'+txnid;
    
    window.open(link);
}

function popupclose() {
    $('.popup').css('display', 'none');
    $('.popupback').css('display', 'none');
}

async function checknetwork() {
    var node = window.tronWeb.fullNode.host;
    var addr = window.tronWeb.defaultAddress.base58;
    
    if(addr == false) {
        $('.popupback').css('display', 'block');
        $('#noprovider').css('display', 'none');
        $('#locked').css('display', 'block');
    } else {
        if(node != sessionStorage.getItem('aznladmin_network')) {
            if(node.includes("https://api.trongrid.io")) {
                $('.popupback').css('display', 'none');
                $('#noprovider').css('display', 'none');
                $('#locked').css('display', 'none');

                await sessionStorage.setItem('aznladmin_network',window.tronWeb.fullNode.host);
                window.location = './admin.html';
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

        if (addr != sessionStorage.getItem('aznladmin_account')) {
            await sessionStorage.setItem('aznl_account',window.tronWeb.defaultAddress.base58);
            window.location = './admin.html';
        }
    }
}

setInterval(function(){
    if(ready == true) {
        this.loadaffiliateinfo();
    }
}, 60000);

setInterval(function(){
    if(ready == true) {
        this.checknetwork();
    }
}, 1000);
