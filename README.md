# EC DOM PARSER


### Setup & Run
```
> npm install
> momo: npm run momo
> pchome24: npm run pchome24
```


#### Reference

1. http://maxogden.com/scraping-with-node.html
# ec-dom-parser


#### Vespa operstion

- Update/New data:

```
curl --header "Content-Type: application/xml" --data-binary @productdata.xml "http://product.by-salagado.corp-us-east-1.dev.vespa.yahooapis.com:4080/feed/"
```

- Search

http://product.by-salagado.corp-us-east-1.dev.vespa.yahooapis.com:4080/search/?query=iphone
