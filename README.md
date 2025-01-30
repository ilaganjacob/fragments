# fragments

Cloud Computing

## Scripts instructions

# lint

npm run lint

# start

npm start

# dev

npm run dev

# debug

npm run debug

# curl

curl localhost:port

# Pipes curl output to jq, pretty-prints the JSON (-s silences the usual output to CURL, only sending the response from the server to jq)

curl -s localhost:port | jq

# fetch headers only

curl -i localhost:8080

# testing

to test, we do npm test to test all \*.test.js files

to test specific files, we can do npm test {filename}

if we git push origin main, the CI will give a green checkmark if all our tests pass
