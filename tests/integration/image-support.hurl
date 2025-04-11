# tests/integration/image-support.hurl
# Tests for image fragment support

# 1. Create a PNG image fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@email.com:password1
file,../test-images/test-image.png;

# We expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/png"

# Capture the Location header value and fragment id for later use
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. Get the fragment metadata
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.type" == "image/png"

# 3. Get the fragment data
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png

# 4. Get the fragment converted to JPEG
GET {{fragment1_url}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpeg

# 5. Get the fragment converted to WebP
GET {{fragment1_url}}.webp
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp

# 6. Test CSV fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/csv
[BasicAuth]
user1@email.com:password1
```
name,age,city
John,30,New York
Jane,25,Toronto
Bob,28,Vancouver
```

# We expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/csv"

# Capture the Location header for the CSV fragment
[Captures]
csv_fragment_url: header "Location"

# 7. Get the CSV fragment converted to JSON
GET {{csv_fragment_url}}.json
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
[Asserts]
jsonpath "$[0].name" == "John"
jsonpath "$[1].name" == "Jane"
jsonpath "$[2].name" == "Bob"

# 8. Test YAML fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/yaml
[BasicAuth]
user1@email.com:password1
```
users:
  - name: John
    age: 30
    city: New York
  - name: Jane
    age: 25
    city: Toronto
```

# We expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/yaml"

# Capture the Location header for the YAML fragment
[Captures]
yaml_fragment_url: header "Location"

# 9. Get the YAML fragment converted to JSON
GET {{yaml_fragment_url}}.json
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
[Asserts]
jsonpath "$.users[0].name" == "John"
jsonpath "$.users[1].name" == "Jane"
