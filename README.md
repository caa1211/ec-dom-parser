# EC DOM PARSER


### Setup & Run
```
> npm install
> npm start   (the alias for "node main.js")
```


#### Reference

1. http://maxogden.com/scraping-with-node.html
# ec-dom-parser


#### Vespa operstion

1. Update/New data:

'''
curl --header "Content-Type: application/xml" --data-binary @productdata.xml "http://product.by-salagado.corp-us-east-1.dev.vespa.yahooapis.com:4080/feed/"
'''

2. Search

http://product.by-salagado.corp-us-east-1.dev.vespa.yahooapis.com:4080/search/?query=Bob%20best
