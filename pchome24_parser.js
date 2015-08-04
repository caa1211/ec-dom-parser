"use strict";

var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var fs = require('fs');
var _ = require('lodash');

var request = require('request');
var data2xml = require('data2xml');

var xmlconvert = data2xml({xmlheader: '<?xml version="1.0" encoding="utf-8" ?>'});
var remoteSrc = "http://24h.pchome.com.tw/prod/DGALU9-A9005I8DG";
var postSrc = "http://product.by-salagado.corp-us-east-1.dev.vespa.yahooapis.com:4080/feed/";
var apiSrc = "http://ecapi.pchome.com.tw/ecshop/prodapi/v2/prod?id=";
var apiQueryFields = "Id,Name,Price,Pic,Qty";
var imageBaseUrl = "http://24h.pchome.com.tw";
var baseUrl = "http://24h.pchome.com.tw/prod/";
var property = "pchome24";
var documentidPrefix = "id:eccs:product::";

var vespaFeedSource = [];

function pushParsedData(data){
    vespaFeedSource.push(data);
    pushToVespa();
}

function pushToVespa(){
    var baseAttr = { type : 'product', documentid: '' };
    var docs = [];
    _.forEach(vespaFeedSource, function(item) {
        var attr = _.extend({}, baseAttr, {documentid: documentidPrefix+ property +"_"+item.Id});
        var doc = {
            _attr: attr,
            name : item.Name,
            price : item.Price.P,
            priceCurrency: "TWD",
            sku : item.Id,
            image : imageBaseUrl + item.Pic.B,
            url : baseUrl + item.primeId
        };
        docs.push(doc);
    });

    var convertedxml = xmlconvert(
        "vespafeed",
        {
            document: docs
        }
    );

    var requestOptions = {
        url: postSrc,
        body : convertedxml,
        headers: {'Content-Type': 'application/xml'}
    };

    request.post(requestOptions,
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log("push success");
            }
        });
}

function startParse(src){
    var pid = src.split("prod/")[1]; //TODO: multiple ids can be combined with comma
    var headers = {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.36'
    };

    var requestOptions = {
        url: "http://ecapi.pchome.com.tw/ecshop/prodapi/v2/prod?id="+pid+"&fields=Id,Name,Price,Pic,Qty",
        headers: headers,
        method: 'GET'
    };

    request(requestOptions, function (err, res, data) {
        if (err) { return console.log(err); }
        var dataKey = pid;

        if(pid.split("-").length === 2) {
            dataKey = pid + "-000";
        }

        var parsedData = JSON.parse(data)[dataKey];
        parsedData.primeId = pid;
        pushParsedData(parsedData);

    });
}

startParse(remoteSrc);



