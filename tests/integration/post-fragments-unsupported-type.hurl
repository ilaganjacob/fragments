# Test posting a fragment with an unsupported content type
# We expect a 415 Unsupported Media Type response

POST http://localhost:8080/v1/fragments
# Using an unsupported media type
Content-Type: application/pdf
[BasicAuth]
user1@email.com:password1
# Sample PDF content (not actually valid, just for testing)
`%PDF-1.1 This is not a valid PDF, just testing unsupported types`

# We expect to get back an HTTP 415
HTTP/1.1 415
[Asserts]
# The response should include a JSON error object
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
# The error message should indicate the media type is unsupported
jsonpath "$.error.message" matches "Unsupported Media Type"
