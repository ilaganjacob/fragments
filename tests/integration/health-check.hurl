# Health check test
GET http://localhost:8080

# We should get back an HTTP 1.1 200 response
HTTP/1.1 200

# We should get back a non-cacheable response (cache-control header)
Cache-Control: no-cache

