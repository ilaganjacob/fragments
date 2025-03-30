# tests/integration/lab-9-s3.hurl

# Test S3 storage integration for fragments
# 1. POST a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`

# 2. Confirm successful creation (201 status)
HTTP/1.1 201
[Captures]
url: header "Location"
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 9

# 3. GET the fragment we just created using the captured URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 4. Verify the fragment content and type
HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

# 5. DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# 6. Confirm successful deletion
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# 7. Try to GET the deleted fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 8. Confirm the fragment is gone (404 status)
HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
