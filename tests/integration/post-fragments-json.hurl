# Test posting a JSON fragment
# We expect successful creation and retrieval

POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
# JSON data in the request body
{
  "name": "Sample JSON Fragment",
  "values": [1, 2, 3],
  "active": true,
  "metadata": {
    "created": "2023-01-01T00:00:00Z",
    "version": 1
  }
}

# We expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
# Capture the Location URL for the next request
[Captures]
url: header "Location"

# Now GET the fragment to verify it returns with the correct Content-Type and data
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
[Asserts]
# Verify the JSON structure is preserved
jsonpath "$.name" == "Sample JSON Fragment"
# For arrays, check individual elements instead of the whole array
jsonpath "$.values[0]" == 1
jsonpath "$.values[1]" == 2
jsonpath "$.values[2]" == 3
# Or check array length
jsonpath "$.values" count == 3
jsonpath "$.active" == true
jsonpath "$.metadata.created" == "2023-01-01T00:00:00Z"
jsonpath "$.metadata.version" == 1
