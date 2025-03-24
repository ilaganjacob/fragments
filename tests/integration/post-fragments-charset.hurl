# Test posting a fragment with charset in Content-Type
# We expect the charset to be preserved

POST http://localhost:8080/v1/fragments
# Include charset in the Content-Type
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
# Simple text with some UTF-8 characters
`Hello, world! 你好，世界！`

# We expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
# Verify the fragment type includes the charset
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"
# Capture the Location URL for the next request
[Captures]
url: header "Location"

# Now GET the fragment to verify it returns with the correct Content-Type
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
# Verify the Content-Type header in the response has the charset
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello, world! 你好，世界！"
