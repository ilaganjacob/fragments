# # tests/integration/lab-10-dynamodb.hurl
# # Test our DynamoDB implementation with full fragment operations

# # 1. Create a JSON fragment
# POST http://localhost:8080/v1/fragments
# Content-Type: application/json
# [BasicAuth]
# user1@email.com:password1

# { "service": "DynamoDB" }

# # 2. Confirm that the server returns a 201 and capture the URL and fragment id
# HTTP/1.1 201
# [Captures]
# fragment1_url: header "Location"
# fragment1_id: jsonpath "$.fragment.id"

# # 3. GET the fragment's info (metadata) and confirm everything looks right
# GET {{fragment1_url}}/info
# [BasicAuth]
# user1@email.com:password1

# # Verify we get a 200 and all metadata properties match what we expect
# HTTP/1.1 200
# [Asserts]
# jsonpath "$.status" == "ok"
# jsonpath "$.fragment.id" == {{fragment1_id}}
# jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$" # Hex hash of the user's email
# jsonpath "$.fragment.created" isString
# jsonpath "$.fragment.updated" isString
# jsonpath "$.fragment.type" == "application/json"
# jsonpath "$.fragment.size" == 25 # Size of JSON: { "service": "DynamoDB" }

# # 4. POST a second Markdown fragment
# POST http://localhost:8080/v1/fragments
# Content-Type: text/markdown
# [BasicAuth]
# user1@email.com:password1
# `DynamoDB is **great**.`

# # 5. Confirm 201 and capture the URL and fragment id
# HTTP/1.1 201
# [Captures]
# fragment2_url: header "Location"
# fragment2_id: jsonpath "$.fragment.id"

# # 6. GET the second fragment's info and validate
# GET {{fragment2_url}}/info
# [BasicAuth]
# user1@email.com:password1

# HTTP/1.1 200
# [Asserts]
# jsonpath "$.status" == "ok"
# jsonpath "$.fragment.id" == {{fragment2_id}}
# jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# jsonpath "$.fragment.created" isString
# jsonpath "$.fragment.updated" isString
# jsonpath "$.fragment.type" == "text/markdown"
# jsonpath "$.fragment.size" == 22 # Size of: DynamoDB is **great**.

# # 7. GET all fragments for this user (not expanded)
# GET http://localhost:8080/v1/fragments
# [BasicAuth]
# user1@email.com:password1

# # Verify we get both fragments in our list
# HTTP/1.1 200
# [Asserts]
# jsonpath "$.status" == "ok"
# jsonpath "$.fragments" includes {{fragment1_id}}
# jsonpath "$.fragments" includes {{fragment2_id}}

# # 8. DELETE the first fragment
# DELETE {{fragment1_url}}
# [BasicAuth]
# user1@email.com:password1

# # 9. Confirm 200 OK for successful deletion
# HTTP/1.1 200
# [Asserts]
# jsonpath "$.status" == "ok"

# # 10. Try to GET the deleted fragment, should be gone
# GET {{fragment1_url}}
# [BasicAuth]
# user1@email.com:password1

# # 11. Confirm we get a 404 since the fragment should be deleted
# HTTP/1.1 404
# [Asserts]
# jsonpath "$.status" == "error"
# jsonpath "$.error.code" == 404

# # 12. GET all fragments one more time to verify first fragment is gone but second remains
# GET http://localhost:8080/v1/fragments
# [BasicAuth]
# user1@email.com:password1

# HTTP/1.1 200
# [Asserts]
# jsonpath "$.status" == "ok"
# jsonpath "$.fragments" not includes {{fragment1_id}}
# jsonpath "$.fragments" includes {{fragment2_id}}




# Lab 10 DynamoDB Integration Test

# 1. POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`{ "service": "DynamoDB" }`
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. GET fragment metadata for the first fragment (append /info)
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.ownerId" isString
jsonpath "$.fragment.size" isNumber

# 3. POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**`
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 4. GET fragment metadata for the second fragment (append /info)
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.ownerId" isString
jsonpath "$.fragment.size" isNumber

# 5. GET all fragments for the user (IDs-only)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# 6. DELETE the first fragment (use the URL without /info)
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

# 7. GET the first fragment metadata to ensure deletion (append /info)
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP/1.1 404

# 8. GET all fragments for the user again (IDs-only)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" not contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"
