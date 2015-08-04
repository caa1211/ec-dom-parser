var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var fs = require('fs');
var _ = require('lodash');

var originRequest = require('request');
var data2xml = require('data2xml');
var xmlconvert = data2xml({xmlheader: '<?xml version="1.0" encoding="utf-8" ?>\n'});

var remoteSrc = "http://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=3152387";
var localSrc="data/momo-3152387.html";
var postSrc = "http://product.by-salagado.corp-us-east-1.dev.vespa.yahooapis.com:4080/feed/";

var vespaFeedSource = [];

function priceToNum(str){
	var cleanstring = str.replace(/[^\d\.\-\ ]/g, '');
	return parseInt(cleanstring, 10);
}

function parseMomo (data){
	var $ = momoDataDecoder(data);
	var priceStr = $(".saleinPrice > b").text();

	var price = priceToNum(priceStr);
	var title = $(".prdnoteArea > h1").text();
	var image = $("meta[property='og:image']").attr("content");
	var description = $("meta[property='og:description']").attr("content");
	var url = $("meta[property='og:url']").attr("content");
	var sourceId = "";

	if(url && url.length>0){
		var urlSplitAry = url.split("i_code=");
		if(urlSplitAry.length > 1){
			sourceId = urlSplitAry[1];
		}
	}
	return {
		property: "momo",
		sourceId: sourceId,
		url: url,
		description: description,
		title: title,
		image: image,
		price: price
	}
}

function momoDataDecoder(data){
	var decodedHtml = iconv.decode(new Buffer(data, "binary"), "big5");
	var $ = cheerio.load(decodedHtml);
	return $;
}

function pushParsedData(data){
	vespaFeedSource.push(data);
	pushToVespa();
}

function pushToVespa(){
	var baseAttr = { type : 'product', documentid: '' };
	var documentidPrefix = "id:sampleapp:product::";
	var docs = [];
	_.forEach(vespaFeedSource, function(item) {
		var attr = _.extend({}, baseAttr, {documentid: documentidPrefix+item.property+"_"+item.sourceId});
		var doc = {
			_attr: attr,
			name : item.title,
			price : item.price,
			priceCurrency: "TWD",
			sku : item.sourceId,
			image : item.image,
			url : item.url
		};
		docs.push(doc);
	});

	var convertedxml = xmlconvert(
		"vespafeed",
		{
			document: docs
		}
		);

	var postOption = {
		url: postSrc,
		body : convertedxml,
		headers: {'Content-Type': 'application/xml'}
	};

	originRequest.post(postOption,
		function (error, response, body) {     
			if (!error && response.statusCode === 200) {
				console.log("push success");
			}
		}
		);
}


function startParse(src, isRemote){
	if(isRemote === true) {
		var headers = {  
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
		};

		function request (src, callback) {  
			var options = {
				url: src,
				encoding: null,
				headers: headers
			}
			originRequest(options, callback)
		}

		request(src, function (err, res, data) {  
			if (err) { return console.log(err); }

			var parsedData = parseMomo(data);
			pushParsedData(parsedData);
		});

	}else{
		fs.readFile(src, 'binary', function (err,data) {
			if (err) { return console.log(err); }

			var parsedData = parseMomo(data);
			pushParsedData(parsedData);
		});
	}
}

startParse(remoteSrc, true);



