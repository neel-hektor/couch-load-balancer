# couch-load-balancer
Couchdb is a NOSQL database with a HTTP querying interface. The simple HTTP interface has led to the creation of multiple clientside drivers for Sync of data between Apps and server ( on HTTP) . The primary limitation of Couchdb is that its incapable of efficient Horizontal scaling . 

In order to address the problems related to scaling , couch balancer provides a solution by manually implementing sharding 
using the combination of 

1. Lua + OpenResty ( Open Source Variant of NGINX ) 
2. Redis 

# Working
The customized loadbalancer analyses the URL's and provide the details of the server to which the HTTP 
requests need to be forwarded. 

for Example: 
Suppose we insert a document into couchdb using the following : 

```
POST /somedatabase/ HTTP/1.0
Content-Length: 245
Content-Type: application/json

{
  "Subject":"I like Plankton",
  "Author":"Rusty",
  "PostedDate":"2006-08-15T17:30:12-04:00",
  "Tags":["plankton", "baseball", "decisions"],
  "Body":"I decided today that I don't like baseball. I like plankton."
}
```
The Lua based sharding script does the following step at the Loadbalancer: 
1. Check for authentication headers ( verify using JWT and discard on failure ) 
2. Lookup Redis using key as 'somedatabase' 
3. Redis provides the IP Address / domain name ( within VPN) of the server within the couchdb farm as value.  
4. Updates the URL in given request to IP / URL retreived.
5. Forward requests.

The other advantages are : 
1. customized session authentication ( it redirects all session request to a HTTP endpoint of your preference)
2. Loose binding with couchdb, hence can be easily scaled using services like AWS beanstalk / Docker. 
3. JWT based session validation ( to prevent performance bottlenecks ) 

Drawbacks: 
1. Heavily reliant on Redis. 

## Why REDIS ? 
The Redis instance running alongside the Loadbalancer is operated in a master slave configuration. The Redis instance operated upon by the API server is categorized as the master. 
Whenever a new database is added to any couchdb instance ( via an call to API server )  , an entry is made in REDIS to with the key as the database name and the server Address. 
As soon as the change percolates between the REDIS instances of the API server and the load balancer, all follow up requests for data sync are forwarded to the destination server . 







