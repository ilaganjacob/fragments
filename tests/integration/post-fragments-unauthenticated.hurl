# Test posting a fragment without authentication
# We expect a 401 Unauthorized response

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
# No BasicAuth credentials provided
`This is an unauthenticated request`

# We expect to get back an HTTP 401
HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" matches "Unauthorized"
